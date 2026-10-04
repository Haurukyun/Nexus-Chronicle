import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Radio, X, Send, Download, Sparkles, Check,
    AlertCircle, Copy, HardDrive, Smartphone, Monitor, ArrowRight, RefreshCw, FileArchive, Upload
} from 'lucide-react';
import { ThemeMode, WorldData } from '../../types';
import { useWorldStore } from '../../store/useWorldStore';
import { useTheme } from '../../theme';
import { NexusBeamSender, NexusBeamReceiver, BeamProgress } from '../../utils/nexusBeam';
import { exportNexusArchiveFile, unpackNexusArchive } from '../../utils/nexusArchive';

interface NexusBeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme?: ThemeMode;
}

export const NexusBeamModal: React.FC<NexusBeamModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { world, importWorldData, activeWorldId } = useWorldStore();
    const { isWikiMode, isRoyal } = useTheme();
    const [mode, setMode] = useState<'send' | 'receive' | 'file'>('send');
    const [senderToken, setSenderToken] = useState('');
    const [receiverAnswerInput, setReceiverAnswerInput] = useState('');
    const [receiveOfferInput, setReceiveOfferInput] = useState('');
    const [generatedAnswerToken, setGeneratedAnswerToken] = useState('');
    const [progress, setProgress] = useState<BeamProgress | null>(null);
    const [copied, setCopied] = useState(false);
    const [fileNotice, setFileNotice] = useState<string | null>(null);

    const senderRef = useRef<NexusBeamSender | null>(null);
    const receiverRef = useRef<NexusBeamReceiver | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const accent = isRoyal
        ? 'text-[#d4af37]'
        : isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';

    const modalBg = isRoyal
        ? 'bg-[#181410] border-[#c8a96e]/40 text-[#f5ebd7]'
        : isWikiMode
        ? 'bg-[#fbf6ea] border-[#d4c8af] text-[#2b1810]'
        : 'bg-slate-900 border-slate-700 text-slate-100';

    const inputCls = isRoyal
        ? 'bg-[#0f0a07] border-[#c8a96e]/30 text-[#f5ebd7] placeholder-[#c8a96e]/30'
        : isWikiMode
        ? 'bg-white border-[#d4c8af] text-[#2b1810] placeholder-[#b0a090]'
        : 'bg-slate-800 border-slate-700 text-white placeholder-slate-500';

    // Cleanup peer connections on unmount or close
    useEffect(() => {
        if (!isOpen) {
            senderRef.current?.close();
            receiverRef.current?.close();
            senderRef.current = null;
            receiverRef.current = null;
            setProgress(null);
            setSenderToken('');
            setReceiverAnswerInput('');
            setReceiveOfferInput('');
            setGeneratedAnswerToken('');
            setFileNotice(null);
        }
    }, [isOpen]);

    // Listen for custom event when receiver finishes stream
    useEffect(() => {
        const handleBeamReceived = (e: any) => {
            const manifest = e.detail;
            if (manifest.world) {
                importWorldData(manifest.world, 'new');
            } else if (manifest.universe) {
                importWorldData(manifest.universe, 'new');
            }
        };

        window.addEventListener('nexus-beam-received', handleBeamReceived);
        return () => window.removeEventListener('nexus-beam-received', handleBeamReceived);
    }, [importWorldData]);

    if (!isOpen) return null;

    // Start Send Flow
    const handleStartSend = async () => {
        senderRef.current?.close();
        const sender = new NexusBeamSender((p) => setProgress(p));
        senderRef.current = sender;

        try {
            const token = await sender.initialize({ world });
            setSenderToken(token);
        } catch (err: any) {
            console.error('Failed to initialize sender:', err);
            alert(`Handshake error: ${err?.message || 'Unknown'}`);
        }
    };

    // Confirm Answer from Receiver
    const handleConnectAnswer = async () => {
        if (!receiverAnswerInput.trim() || !senderRef.current) return;
        try {
            await senderRef.current.connectWithAnswer(receiverAnswerInput.trim());
        } catch (err: any) {
            alert(`Connection error: ${err?.message || 'Invalid token'}`);
        }
    };

    // Receiver: Ingest Offer & Generate Answer
    const handleStartReceive = async () => {
        if (!receiveOfferInput.trim()) return;
        receiverRef.current?.close();
        const receiver = new NexusBeamReceiver((p) => setProgress(p));
        receiverRef.current = receiver;

        try {
            const answer = await receiver.initializeWithOffer(receiveOfferInput.trim());
            setGeneratedAnswerToken(answer);
        } catch (err: any) {
            alert(`Pairing error: ${err?.message || 'Invalid offer token'}`);
        }
    };

    // Copy to clipboard helper
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Direct File Export (.nexus)
    const handleExportFile = async () => {
        try {
            setFileNotice('Packaging world lore & all uncompressed HD assets into .nexus bundle...');
            await exportNexusArchiveFile({ world });
            setFileNotice('Archive exported successfully! You can AirDrop, email, or save to Google Drive.');
        } catch (err: any) {
            setFileNotice(`Export failed: ${err?.message || 'Unknown error'}`);
        }
    };

    // Direct File Import (.nexus)
    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setFileNotice('Unpacking .nexus archive & inscribing uncompressed HD assets into local IndexedDB...');
            const { manifest, assetsImported } = await unpackNexusArchive(file);

            if (manifest.world) {
                importWorldData(manifest.world, 'new');
            } else if (manifest.universe) {
                importWorldData(manifest.universe, 'new');
            }

            setFileNotice(`Inscribed realm "${manifest.world?.name || 'Imported Realm'}" with ${assetsImported} uncompressed assets!`);
        } catch (err: any) {
            setFileNotice(`Import failed: ${err?.message || 'Invalid archive'}`);
        }
    };

    const modalElement = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-2xl p-8 rounded-3xl border shadow-2xl space-y-6 ${modalBg} relative max-h-[92vh] overflow-y-auto`}>
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4 border-current/10">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl ${isWikiMode ? 'bg-[#b91c1c]/10' : 'bg-yellow-400/10'}`}>
                            <Radio size={24} className={accent} />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-black uppercase tracking-tight flex items-center gap-2">
                                Nexus Beam & Archive Portal
                            </h2>
                            <p className="text-[11px] opacity-60 font-serif italic">
                                High-speed direct P2P transfer & uncompressed .nexus packaging across PC & Mobile.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="opacity-50 hover:opacity-100 transition-opacity p-1.5 rounded-xl hover:bg-white/5"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Mode Selector Tabs */}
                <div className={`flex rounded-2xl p-1 border ${
                    isWikiMode ? 'bg-[#f0e8d8] border-[#d4c8af]' : 'bg-black/30 border-slate-700/50'
                }`}>
                    <button
                        type="button"
                        onClick={() => { setMode('send'); setProgress(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                            mode === 'send'
                                ? isWikiMode ? 'bg-[#b91c1c] text-white shadow' : 'bg-[#fef08a] text-black shadow-lg'
                                : 'opacity-60 hover:opacity-100'
                        }`}
                    >
                        <Monitor size={14} /> Beam To Mobile (Send)
                    </button>

                    <button
                        type="button"
                        onClick={() => { setMode('receive'); setProgress(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                            mode === 'receive'
                                ? isWikiMode ? 'bg-[#b91c1c] text-white shadow' : 'bg-[#fef08a] text-black shadow-lg'
                                : 'opacity-60 hover:opacity-100'
                        }`}
                    >
                        <Smartphone size={14} /> Receive From PC (Receive)
                    </button>

                    <button
                        type="button"
                        onClick={() => { setMode('file'); setProgress(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                            mode === 'file'
                                ? isWikiMode ? 'bg-[#b91c1c] text-white shadow' : 'bg-[#fef08a] text-black shadow-lg'
                                : 'opacity-60 hover:opacity-100'
                        }`}
                    >
                        <FileArchive size={14} /> .nexus Archive File
                    </button>
                </div>

                {/* Progress Bar (Visible during active streaming) */}
                {progress && (
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 animate-in fade-in">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold flex items-center gap-1.5 capitalize">
                                {progress.stage === 'streaming' && <Radio size={14} className="animate-pulse text-yellow-400" />}
                                {progress.stage.replace('_', ' ')}
                            </span>
                            <span className="font-mono opacity-80">
                                {progress.percent}% {progress.speedMBs > 0 && `(${progress.speedMBs} MB/s)`}
                            </span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                                className="h-full bg-yellow-400 transition-all duration-150"
                                style={{ width: `${progress.percent}%` }}
                            />
                        </div>

                        {progress.message && (
                            <p className="text-[11px] opacity-70 font-mono text-center">
                                {progress.message}
                            </p>
                        )}
                    </div>
                )}

                {/* TAB 1: SENDER (PC -> Mobile) */}
                {mode === 'send' && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-2">
                            <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles size={14} className={accent} /> Direct P2P Wireless Stream
                            </p>
                            <p className="text-xs opacity-70 leading-relaxed font-serif">
                                Streams the active realm ("<strong>{world.name}</strong>") and all its uncompressed HD photos directly to your mobile phone over local Wi-Fi, global internet, or WireGuard.
                            </p>
                        </div>

                        {!senderToken ? (
                            <button
                                type="button"
                                onClick={handleStartSend}
                                className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                    isWikiMode
                                        ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b]'
                                        : 'bg-[#fef08a] text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20'
                                }`}
                            >
                                <Send size={15} /> Generate Pairing Key For Mobile
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block">
                                        Step 1: Copy this Pairing Key & Paste into Mobile
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            readOnly
                                            rows={3}
                                            value={senderToken}
                                            className={`w-full p-3 pr-20 rounded-xl border text-[10px] font-mono outline-none resize-none ${inputCls}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(senderToken)}
                                            className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow"
                                        >
                                            {copied ? <Check size={12} /> : <Copy size={12} />}
                                            {copied ? 'Copied!' : 'Copy Key'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block">
                                        Step 2: Paste the Mobile Device's Response Key below
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Paste Response Key from Mobile here..."
                                            value={receiverAnswerInput}
                                            onChange={(e) => setReceiverAnswerInput(e.target.value)}
                                            className={`flex-1 px-3 py-2.5 rounded-xl border text-xs outline-none ${inputCls}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleConnectAnswer}
                                            disabled={!receiverAnswerInput.trim()}
                                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                                isWikiMode
                                                    ? 'bg-[#b91c1c] text-white disabled:opacity-40'
                                                    : 'bg-[#fef08a] text-black disabled:opacity-40'
                                            }`}
                                        >
                                            Begin Beam
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: RECEIVER (Mobile <- PC) */}
                {mode === 'receive' && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-2">
                            <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <HardDrive size={14} className={accent} /> Inscribe Streamed Realm & Media
                            </p>
                            <p className="text-xs opacity-70 leading-relaxed font-serif">
                                Receives the streamed world and writes all uncompressed HD images directly into your mobile device's local IndexedDB vault.
                            </p>
                        </div>

                        {!generatedAnswerToken ? (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block">
                                    Step 1: Paste the Pairing Key generated on your PC
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Paste pairing key from PC here..."
                                    value={receiveOfferInput}
                                    onChange={(e) => setReceiveOfferInput(e.target.value)}
                                    className={`w-full p-3 rounded-xl border text-[11px] font-mono outline-none resize-none ${inputCls}`}
                                />
                                <button
                                    type="button"
                                    onClick={handleStartReceive}
                                    disabled={!receiveOfferInput.trim()}
                                    className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                        isWikiMode
                                            ? 'bg-[#b91c1c] text-white disabled:opacity-40'
                                            : 'bg-[#fef08a] text-black disabled:opacity-40'
                                    }`}
                                >
                                    Generate Mobile Response Key
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block">
                                        Step 2: Copy this Response Key and paste it on your PC
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            readOnly
                                            rows={3}
                                            value={generatedAnswerToken}
                                            className={`w-full p-3 pr-20 rounded-xl border text-[10px] font-mono outline-none resize-none ${inputCls}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(generatedAnswerToken)}
                                            className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow"
                                        >
                                            {copied ? <Check size={12} /> : <Copy size={12} />}
                                            {copied ? 'Copied!' : 'Copy Key'}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[11px] text-emerald-400 font-serif italic text-center animate-pulse">
                                    ✓ Awaiting direct binary stream from PC... Keep this window open.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: FILE ARCHIVE (.nexus) */}
                {mode === 'file' && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-2">
                            <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <FileArchive size={14} className={accent} /> Self-Contained .nexus Archive File
                            </p>
                            <p className="text-xs opacity-70 leading-relaxed font-serif">
                                Creates a single, portable binary package containing all entities, lore, and every uncompressed HD image. Perfect for AirDrop, USB drives, or cloud storage.
                            </p>
                        </div>

                        {fileNotice && (
                            <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-300 leading-relaxed">
                                {fileNotice}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleExportFile}
                                className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all ${
                                    isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-yellow-400 text-black font-bold'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase font-black tracking-wider">Export .nexus Archive</span>
                                    <Download size={18} />
                                </div>
                                <span className="text-[10px] opacity-80 font-normal">
                                    Bundles "{world.name}" + all uncompressed HD pictures into a single file. Uses Web Share on mobile.
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-4 rounded-2xl border border-white/10 hover:border-white/30 bg-black/20 hover:bg-black/30 text-left flex flex-col justify-between gap-3 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase font-black tracking-wider">Import .nexus Archive</span>
                                    <Upload size={18} />
                                </div>
                                <span className="text-[10px] opacity-60">
                                    Restores full realm data and auto-extracts all HD images into local IndexedDB storage.
                                </span>
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".nexus,.bin"
                                onChange={handleImportFile}
                                className="hidden"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalElement, document.body) : modalElement;
};
