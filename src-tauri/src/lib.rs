use tauri::Manager;

/// Returns the platform-specific app data directory as an absolute path string.
/// e.g. C:\Users\<user>\AppData\Roaming\com.haurukyun.nexuschronicle on Windows
///      ~/Library/Application Support/com.haurukyun.nexuschronicle on macOS
///      ~/.local/share/com.haurukyun.nexuschronicle on Linux
#[tauri::command]
fn get_app_data_dir(app: tauri::AppHandle) -> Result<String, String> {
    app.path()
        .app_data_dir()
        .map(|p| p.to_string_lossy().into_owned())
        .map_err(|e| e.to_string())
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
            get_app_data_dir,
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

