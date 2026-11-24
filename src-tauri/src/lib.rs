use std::path::PathBuf;
use tauri::Manager;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct VaultInfo {
    pub is_portable: bool,
    pub vault_dir: String,
    pub assets_dir: String,
    pub codex_file: String,
}

/// Resolves the vault directory using Choice 1 (Portable Install Folder with AppData fallback):
/// 1. Check parent directory of the current executable.
/// 2. If it's not in Program Files, and it's writable (or has portable.txt or data dir):
///    Use `<exe_parent>/data` as the portable vault!
/// 3. Otherwise, fallback to the platform AppData folder.
fn resolve_vault_info(app: &tauri::AppHandle) -> VaultInfo {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let exe_dir_str = exe_dir.to_string_lossy().to_lowercase();
            let is_in_program_files = exe_dir_str.contains("program files");

            if !is_in_program_files {
                let candidate_data = exe_dir.join("data");
                let candidate_marker = exe_dir.join("portable.txt");

                let should_use_portable = candidate_marker.exists()
                    || candidate_data.exists()
                    || (std::fs::create_dir_all(&candidate_data).is_ok() && {
                        let test_file = candidate_data.join(".write_test");
                        let writable = std::fs::write(&test_file, b"ok").is_ok();
                        let _ = std::fs::remove_file(&test_file);
                        writable
                    });

                if should_use_portable {
                    let assets_dir = candidate_data.join("assets");
                    let _ = std::fs::create_dir_all(&assets_dir);
                    return VaultInfo {
                        is_portable: true,
                        vault_dir: candidate_data.to_string_lossy().into_owned(),
                        assets_dir: assets_dir.to_string_lossy().into_owned(),
                        codex_file: candidate_data.join("codex.json").to_string_lossy().into_owned(),
                    };
                }
            }
        }
    }

    // Fallback: platform-specific AppData folder
    let app_data = app.path().app_data_dir().unwrap_or_else(|_| PathBuf::from("."));
    let vault_dir = app_data.join("data");
    let assets_dir = vault_dir.join("assets");
    let _ = std::fs::create_dir_all(&assets_dir);

    VaultInfo {
        is_portable: false,
        vault_dir: vault_dir.to_string_lossy().into_owned(),
        assets_dir: assets_dir.to_string_lossy().into_owned(),
        codex_file: vault_dir.join("codex.json").to_string_lossy().into_owned(),
    }
}

/// Returns the resolved vault information including portability state and paths.
#[tauri::command]
fn get_vault_info(app: tauri::AppHandle) -> Result<VaultInfo, String> {
    Ok(resolve_vault_info(&app))
}

/// Returns the platform-specific app data / vault directory as an absolute path string.
#[tauri::command]
fn get_app_data_dir(app: tauri::AppHandle) -> Result<String, String> {
    let info = resolve_vault_info(&app);
    Ok(info.vault_dir)
}

/// Loads the codex JSON content directly from the vault's codex.json file, if present.
#[tauri::command]
fn load_codex_from_disk(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let info = resolve_vault_info(&app);
    let path = PathBuf::from(&info.codex_file);
    if !path.exists() {
        return Ok(None);
    }
    match std::fs::read_to_string(&path) {
        Ok(content) => Ok(Some(content)),
        Err(e) => Err(format!("Failed to read codex from disk: {}", e)),
    }
}

/// Saves the codex JSON content atomically to disk (write to temp file then rename).
#[tauri::command]
fn save_codex_to_disk(app: tauri::AppHandle, content: String) -> Result<(), String> {
    let info = resolve_vault_info(&app);
    let target_path = PathBuf::from(&info.codex_file);
    let tmp_path = PathBuf::from(format!("{}.tmp", info.codex_file));

    // Ensure parent dir exists
    if let Some(parent) = target_path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }

    // Write to temp file first
    std::fs::write(&tmp_path, content.as_bytes()).map_err(|e| format!("Temp write failed: {}", e))?;

    // Atomic replace (on Windows, if target exists rename might fail unless removed first)
    if target_path.exists() {
        let _ = std::fs::remove_file(&target_path);
    }
    std::fs::rename(&tmp_path, &target_path).map_err(|e| format!("Atomic rename failed: {}", e))?;

    Ok(())
}

/// Opens the vault directory in the OS file explorer.
#[tauri::command]
fn open_vault_folder(app: tauri::AppHandle) -> Result<(), String> {
    let info = resolve_vault_info(&app);
    let path = info.vault_dir;

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        std::process::Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}

/// Writes binary data directly to disk at the chosen path without sandbox/scope blocks.
#[tauri::command]
fn write_file_to_disk(path: String, data: Vec<u8>) -> Result<(), String> {
    std::fs::write(&path, data).map_err(|e| e.to_string())
}

/// Reads binary data directly from disk from the chosen path.
#[tauri::command]
fn read_file_from_disk(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(&path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_vault_info,
            get_app_data_dir,
            load_codex_from_disk,
            save_codex_to_disk,
            open_vault_folder,
            write_file_to_disk,
            read_file_from_disk
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}

