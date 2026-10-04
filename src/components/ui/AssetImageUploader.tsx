import React, { useState, useRef } from 'react';
import { Upload, Link2, X, Sparkles, HardDrive, Crop } from 'lucide-react';
import { saveAsset } from '../../utils/assetStore';
import { NexusImage } from './NexusImage';
import { ImageCropModal } from './ImageCropModal';
import { useTheme } from '../../theme';

interface AssetImageUploaderProps {
    label: string;
    value?: string;
    onChange: (uriOrUrl: string) => void;
    isWikiMode?: boolean;
    helperText?: string;
}

export const AssetImageUploader: React.FC<AssetImageUploaderProps> = ({
    label,
    value = '',
    onChange,
    helperText = 'Stored uncompressed in local IndexedDB asset vault.'
}) => {
    const { layoutMode } = useTheme();
    const isWikiMode = layoutMode === 'wiki';
    const [mode, setMode] = useState<'upload' | 'url'>('upload');
    const [urlInput, setUrlInput] = useState(value && !value.startsWith('asset://') ? value : '');
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Crop Modal State
    const [isCropOpen, setIsCropOpen] = useState(false);
    const [cropImageSource, setCropImageSource] = useState<string>('');
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    const isLocalAsset = Boolean(value && value.startsWith('asset://'));

    const prepareCropForFile = (file: File) => {
        const objectUrl = URL.createObjectURL(file);
        setPendingFile(file);
        setCropImageSource(objectUrl);
        setIsCropOpen(true);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        prepareCropForFile(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        prepareCropForFile(file);
    };

    const handleOpenCropForCurrent = () => {
        if (!value) return;
        setPendingFile(null);
        setCropImageSource(value);
        setIsCropOpen(true);
    };

    const handleApplyCrop = async (croppedBlob: Blob) => {
        try {
            setIsSaving(true);
            const assetUri = await saveAsset(croppedBlob);
            onChange(assetUri);
        } catch (err) {
            console.error('Failed to save cropped asset:', err);
            alert('Failed to store cropped image in asset vault.');
        } finally {
            setIsSaving(false);
            cleanupCrop();
        }
    };

    const handleKeepOriginal = async () => {
        if (!pendingFile) return;
        try {
            setIsSaving(true);
            const assetUri = await saveAsset(pendingFile);
            onChange(assetUri);
        } catch (err) {
            console.error('Failed to save original asset:', err);
            alert('Failed to store image in local asset vault.');
        } finally {
            setIsSaving(false);
            cleanupCrop();
        }
    };

    const cleanupCrop = () => {
        if (cropImageSource && cropImageSource.startsWith('blob:')) {
            URL.revokeObjectURL(cropImageSource);
        }
        setCropImageSource('');
        setPendingFile(null);
        setIsCropOpen(false);
    };

    const handleApplyUrl = () => {
        if (!urlInput.trim()) return;
        onChange(urlInput.trim());
    };

    const handleClear = () => {
        onChange('');
        setUrlInput('');
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block">
                    {label}
                </label>
                {/* Mode toggle */}
                <div className="flex items-center gap-1 text-[10px] opacity-70">
                    <button
                        type="button"
                        onClick={() => setMode('upload')}
                        className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                            mode === 'upload'
                                ? isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-yellow-400 text-black font-bold'
                                : 'hover:bg-white/10'
                        }`}
                    >
                        <HardDrive size={10} /> Local File
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('url')}
                        className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                            mode === 'url'
                                ? isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-yellow-400 text-black font-bold'
                                : 'hover:bg-white/10'
                        }`}
                    >
                        <Link2 size={10} /> Web URL
                    </button>
                </div>
            </div>

            {/* Preview Box & Controls */}
            {value ? (
                <div className={`p-5 rounded-[2rem] border space-y-4 max-w-xs mx-auto shadow-2xl ${
                    isWikiMode ? 'bg-[#fefce8] border-[#d4c8af]' : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md'
                }`}>
                    <div className="flex items-center justify-between px-1">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                            isWikiMode ? 'text-[#854d0e]' : 'text-[#fef08a]'
                        }`}>
                            Card Portrait (1:1)
                        </span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                            isLocalAsset ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                            {isLocalAsset ? 'Vault HD' : 'Web URL'}
                        </span>
                    </div>

                    <div className={`relative w-full aspect-square rounded-2xl overflow-hidden border ${
                        isWikiMode ? 'border-[#d4c8af] bg-[#ccc5a8]/20' : 'border-slate-700/60 shadow-xl bg-slate-950/40'
                    } flex items-center justify-center group`}>
                        <NexusImage src={value} className="w-full h-full object-cover" containerClassName="w-full h-full" />
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity z-10">
                            <button
                                type="button"
                                onClick={handleOpenCropForCurrent}
                                className="p-2 rounded-xl bg-black/80 hover:bg-yellow-400 hover:text-black text-white transition-all shadow-lg backdrop-blur-sm"
                                title="Crop & Reposition"
                            >
                                <Crop size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-2 rounded-xl bg-black/80 text-white hover:bg-red-600 transition-all shadow-lg backdrop-blur-sm"
                                title="Remove Image"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 px-1 pt-1 border-t border-white/5">
                        <button
                            type="button"
                            onClick={handleOpenCropForCurrent}
                            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
                                isWikiMode ? 'text-[#b91c1c] hover:underline' : 'text-yellow-400 hover:text-yellow-300'
                            }`}
                        >
                            <Crop size={13} /> Crop / Center
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-bold uppercase tracking-wider opacity-70 hover:opacity-100 cursor-pointer"
                        >
                            Replace
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            ) : mode === 'upload' ? (
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
                        isWikiMode
                            ? 'border-[#d4c8af] hover:border-[#b91c1c] bg-white/40'
                            : 'border-slate-700/60 hover:border-yellow-400/60 bg-black/20 hover:bg-black/30'
                    }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center gap-3">
                        {isSaving ? (
                            <Sparkles size={28} className="text-yellow-400 animate-spin" />
                        ) : (
                            <Upload size={28} className="opacity-40" />
                        )}
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wider">
                                {isSaving ? 'Inscribing to Asset Vault...' : 'Choose Image or Drop File Here'}
                            </p>
                            <p className="text-xs opacity-50 mt-1">
                                High-resolution PNG, JPEG, WebP, SVG supported (Uncompressed)
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex gap-2.5">
                    <input
                        type="text"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className={`flex-1 px-4 py-2.5 rounded-xl border text-xs outline-none ${
                            isWikiMode
                                ? 'bg-white border-[#d4c8af] text-[#2b1810]'
                                : 'bg-slate-800 border-slate-700 text-white'
                        }`}
                    />
                    <button
                        type="button"
                        onClick={handleApplyUrl}
                        disabled={!urlInput.trim()}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                            isWikiMode
                                ? 'bg-[#b91c1c] text-white disabled:opacity-40'
                                : 'bg-[#fef08a] text-black disabled:opacity-40'
                        }`}
                    >
                        Apply
                    </button>
                </div>
            )}

            {helperText && (
                <p className="text-[11px] opacity-40 italic font-serif text-center pt-1">
                    {helperText}
                </p>
            )}

            {isCropOpen && cropImageSource && (
                <ImageCropModal
                    isOpen={isCropOpen}
                    imageSrc={cropImageSource}
                    onApplyCrop={handleApplyCrop}
                    onClose={cleanupCrop}
                    onKeepOriginal={pendingFile ? handleKeepOriginal : undefined}
                />
            )}
        </div>
    );
};
