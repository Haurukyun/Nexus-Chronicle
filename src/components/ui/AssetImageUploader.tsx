import React, { useState, useRef } from 'react';
import { Upload, Link2, X, Check, Image as ImageIcon, Sparkles, HardDrive } from 'lucide-react';
import { saveAsset } from '../../utils/assetStore';
import { NexusImage } from './NexusImage';

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
    isWikiMode = false,
    helperText = 'Stored uncompressed in local IndexedDB asset vault.'
}) => {
    const [mode, setMode] = useState<'upload' | 'url'>('upload');
    const [urlInput, setUrlInput] = useState(value && !value.startsWith('asset://') ? value : '');
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isLocalAsset = Boolean(value && value.startsWith('asset://'));

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsSaving(true);
            const assetUri = await saveAsset(file);
            onChange(assetUri);
        } catch (err) {
            console.error('Failed to save asset:', err);
            alert('Failed to store image in local asset vault.');
        } finally {
            setIsSaving(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;

        try {
            setIsSaving(true);
            const assetUri = await saveAsset(file);
            onChange(assetUri);
        } catch (err) {
            console.error('Failed to drop asset:', err);
        } finally {
            setIsSaving(false);
        }
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
                <div className={`p-4 rounded-2xl border space-y-3 max-w-lg mx-auto ${
                    isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-900/60 border-slate-800'
                }`}>
                    <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-white/10 bg-black/40 group">
                        <NexusImage src={value} className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/75 text-white opacity-80 hover:opacity-100 hover:bg-red-600 transition-all shadow"
                            title="Remove Image"
                        >
                            <X size={15} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 px-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            isLocalAsset
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-blue-500/20 text-blue-300'
                        }`}>
                            {isLocalAsset ? 'Vault Asset (HD Uncompressed)' : 'External Web URL'}
                        </span>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-bold uppercase tracking-wider text-yellow-400 hover:underline cursor-pointer"
                        >
                            Replace Image
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
        </div>
    );
};
