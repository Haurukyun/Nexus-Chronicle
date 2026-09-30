import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut, Check, Move, Sparkles, RefreshCw, Square, RectangleVertical, RectangleHorizontal } from 'lucide-react';
import { resolveAssetUrl } from '../../utils/assetStore';

interface ImageCropModalProps {
    isOpen: boolean;
    imageSrc: string;
    onApplyCrop: (croppedBlob: Blob) => Promise<void> | void;
    onClose: () => void;
    onKeepOriginal?: () => void;
    isWikiMode?: boolean;
}

type AspectRatioMode = '1:1' | '4:5' | '16:9';

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
    isOpen,
    imageSrc,
    onApplyCrop,
    onClose,
    onKeepOriginal,
    isWikiMode = false
}) => {
    const [resolvedUrl, setResolvedUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    
    // Crop Settings (Default 1:1 to match Card Portrait exactly)
    const [aspectMode, setAspectMode] = useState<AspectRatioMode>('1:1');
    const [zoom, setZoom] = useState<number>(1);
    const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const isDraggingRef = useRef(false);
    const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });
    const imageRef = useRef<HTMLImageElement>(null);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    // Crop box dimensions in pixels
    const getCropBoxSize = useCallback(() => {
        if (aspectMode === '1:1') return { width: 340, height: 340 };
        if (aspectMode === '4:5') return { width: 300, height: 375 };
        return { width: 380, height: 214 }; // 16:9
    }, [aspectMode]);

    const { width: boxWidth, height: boxHeight } = getCropBoxSize();

    // Resolve asset URL when imageSrc changes
    useEffect(() => {
        let isMounted = true;
        if (!isOpen || !imageSrc) {
            setResolvedUrl('');
            return;
        }

        setIsLoading(true);
        if (imageSrc.startsWith('asset://')) {
            resolveAssetUrl(imageSrc)
                .then(url => {
                    if (isMounted) {
                        setResolvedUrl(url);
                        setIsLoading(false);
                    }
                })
                .catch(() => {
                    if (isMounted) setIsLoading(false);
                });
        } else {
            setResolvedUrl(imageSrc);
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [isOpen, imageSrc]);

    // Calculate base fit and center on load or aspect change
    const resetPosition = useCallback((imgW: number, imgH: number) => {
        if (!imgW || !imgH) return;
        const baseScale = Math.max(boxWidth / imgW, boxHeight / imgH);
        const displayW = imgW * baseScale;
        const displayH = imgH * baseScale;
        setZoom(1);
        setPan({
            x: (boxWidth - displayW) / 2,
            y: (boxHeight - displayH) / 2
        });
    }, [boxWidth, boxHeight]);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        resetPosition(img.naturalWidth, img.naturalHeight);
    };

    useEffect(() => {
        if (imageDimensions.width && imageDimensions.height) {
            resetPosition(imageDimensions.width, imageDimensions.height);
        }
    }, [aspectMode, resetPosition, imageDimensions]);

    // Mouse / Touch Dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isDraggingRef.current = true;
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            panX: pan.x,
            panY: pan.y
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingRef.current || !imageDimensions.width) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        
        const baseScale = Math.max(boxWidth / imageDimensions.width, boxHeight / imageDimensions.height);
        const currentScale = baseScale * zoom;
        const displayW = imageDimensions.width * currentScale;
        const displayH = imageDimensions.height * currentScale;

        // Allow panning with bounding clamp so image always covers crop area
        const newX = Math.min(0, Math.max(boxWidth - displayW, dragStartRef.current.panX + dx));
        const newY = Math.min(0, Math.max(boxHeight - displayH, dragStartRef.current.panY + dy));

        setPan({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    // Zoom handler with re-clamping
    const handleZoomChange = (newZoom: number) => {
        const clampedZoom = Math.max(1, Math.min(3.5, newZoom));
        setZoom(clampedZoom);

        if (imageDimensions.width && imageDimensions.height) {
            const baseScale = Math.max(boxWidth / imageDimensions.width, boxHeight / imageDimensions.height);
            const currentScale = baseScale * clampedZoom;
            const displayW = imageDimensions.width * currentScale;
            const displayH = imageDimensions.height * currentScale;

            setPan(prev => ({
                x: Math.min(0, Math.max(boxWidth - displayW, prev.x)),
                y: Math.min(0, Math.max(boxHeight - displayH, prev.y))
            }));
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        handleZoomChange(zoom + delta);
    };

    // Apply Crop to Canvas
    const handleSaveCrop = async () => {
        if (!imageRef.current || !imageDimensions.width) return;

        try {
            setIsSaving(true);
            const img = imageRef.current;
            const baseScale = Math.max(boxWidth / imageDimensions.width, boxHeight / imageDimensions.height);
            const currentScale = baseScale * zoom;

            // Map crop box back to native source image coordinates
            const srcX = Math.max(0, -pan.x / currentScale);
            const srcY = Math.max(0, -pan.y / currentScale);
            const srcW = Math.min(imageDimensions.width - srcX, boxWidth / currentScale);
            const srcH = Math.min(imageDimensions.height - srcY, boxHeight / currentScale);

            // Output resolution (high quality)
            const targetWidth = 800;
            const targetHeight = Math.round(800 * (boxHeight / boxWidth));

            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');

            if (!ctx) throw new Error('Could not initialize canvas context');

            // Draw cropped segment
            ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);

            canvas.toBlob(
                async (blob) => {
                    if (blob) {
                        await onApplyCrop(blob);
                        onClose();
                    }
                    setIsSaving(false);
                },
                'image/jpeg',
                0.92
            );
        } catch (err) {
            console.error('Failed to crop image:', err);
            alert('Failed to crop image. Please try again.');
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const baseScale = imageDimensions.width
        ? Math.max(boxWidth / imageDimensions.width, boxHeight / imageDimensions.height)
        : 1;
    const currentScale = baseScale * zoom;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div 
                className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
                    isWikiMode ? 'bg-[#fefce8] border-[#d4c8af] text-[#1a1a1a]' : 'bg-slate-900 border-slate-700/80 text-white'
                }`}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between ${
                    isWikiMode ? 'bg-[#fef9c3] border-[#d4c8af]' : 'bg-slate-950/60 border-slate-800'
                }`}>
                    <div className="flex items-center gap-2">
                        <Move size={16} className={isWikiMode ? 'text-[#854d0e]' : 'text-yellow-400'} />
                        <h3 className="font-bold text-sm uppercase tracking-wider">
                            Position & Crop Portrait
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-black/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body / Workspace */}
                <div className="p-6 flex flex-col items-center select-none">
                    <p className="text-xs opacity-60 mb-4 text-center">
                        Drag to center face or focal point. Use slider or scroll wheel to zoom.
                    </p>

                    {/* Viewport Container */}
                    <div 
                        onWheel={handleWheel}
                        className={`relative rounded-2xl overflow-hidden shadow-inner flex items-center justify-center ${
                            isWikiMode ? 'bg-black/10' : 'bg-slate-950 border border-slate-800'
                        }`}
                        style={{ width: 440, height: 420 }}
                    >
                        {isLoading && (
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                <Sparkles size={24} className="animate-spin text-yellow-400" />
                                <span className="text-xs font-mono uppercase">Loading Source Asset...</span>
                            </div>
                        )}

                        {resolvedUrl && (
                            <div 
                                className="relative overflow-hidden cursor-grab active:cursor-grabbing border-2 border-dashed border-yellow-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] rounded-xl"
                                style={{ width: boxWidth, height: boxHeight }}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                            >
                                {/* The movable image */}
                                <img
                                    ref={imageRef}
                                    src={resolvedUrl}
                                    alt="Crop Source"
                                    crossOrigin="anonymous"
                                    onLoad={handleImageLoad}
                                    draggable={false}
                                    className="absolute max-w-none pointer-events-none transition-transform"
                                    style={{
                                        transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${currentScale})`,
                                        transformOrigin: 'top left'
                                    }}
                                />

                                {/* Rule of Thirds Guide Grid */}
                                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-25 border border-white/20">
                                    <div className="border-r border-b border-white/40" />
                                    <div className="border-r border-b border-white/40" />
                                    <div className="border-b border-white/40" />
                                    <div className="border-r border-b border-white/40" />
                                    <div className="border-r border-b border-white/40" />
                                    <div className="border-b border-white/40" />
                                    <div className="border-r border-b border-white/40" />
                                    <div className="border-r border-b border-white/40" />
                                    <div />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Aspect Ratio Selector */}
                    <div className="flex items-center gap-2 mt-4 text-xs font-bold">
                        <span className="text-[10px] uppercase opacity-50 tracking-wider">Aspect:</span>
                        <button
                            type="button"
                            onClick={() => setAspectMode('1:1')}
                            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                                aspectMode === '1:1'
                                    ? isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-yellow-400 text-black shadow'
                                    : 'bg-black/10 hover:bg-black/20'
                            }`}
                        >
                            <Square size={13} /> 1:1 (Card Standard)
                        </button>
                        <button
                            type="button"
                            onClick={() => setAspectMode('4:5')}
                            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                                aspectMode === '4:5'
                                    ? isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-yellow-400 text-black shadow'
                                    : 'bg-black/10 hover:bg-black/20'
                            }`}
                        >
                            <RectangleVertical size={13} /> 4:5 (Portrait)
                        </button>
                        <button
                            type="button"
                            onClick={() => setAspectMode('16:9')}
                            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                                aspectMode === '16:9'
                                    ? isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-yellow-400 text-black shadow'
                                    : 'bg-black/10 hover:bg-black/20'
                            }`}
                        >
                            <RectangleHorizontal size={13} /> 16:9 (Wide)
                        </button>
                    </div>

                    {/* Zoom Slider & Reset */}
                    <div className="w-full max-w-sm flex items-center gap-3 mt-4 px-4 py-2 rounded-xl bg-black/10">
                        <ZoomOut size={16} className="opacity-60" />
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.02"
                            value={zoom}
                            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                            className="w-full accent-yellow-400 cursor-pointer h-1.5 rounded-lg bg-black/20"
                        />
                        <ZoomIn size={16} className="opacity-60" />
                        <button
                            type="button"
                            onClick={() => resetPosition(imageDimensions.width, imageDimensions.height)}
                            className="p-1.5 rounded-lg hover:bg-black/10 text-xs font-mono opacity-70 hover:opacity-100 flex items-center gap-1 ml-1"
                            title="Reset pan and zoom"
                        >
                            <RefreshCw size={12} />
                        </button>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className={`px-6 py-4 border-t flex justify-end gap-3 ${
                    isWikiMode ? 'bg-[#fef9c3]/40 border-[#d4c8af]' : 'bg-slate-950/60 border-slate-800'
                }`}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
                    >
                        Cancel
                    </button>
                    {onKeepOriginal && (
                        <button
                            type="button"
                            onClick={() => {
                                onKeepOriginal();
                                onClose();
                            }}
                            disabled={isSaving}
                            className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider opacity-80 hover:opacity-100 hover:bg-white/10 transition-all border border-white/10"
                        >
                            Use Full Original
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleSaveCrop}
                        disabled={isSaving || !resolvedUrl}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                            isWikiMode
                                ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b]'
                                : 'bg-yellow-400 text-black hover:bg-yellow-300'
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <Sparkles size={14} className="animate-spin" />
                                <span>Applying Crop...</span>
                            </>
                        ) : (
                            <>
                                <Check size={14} />
                                <span>Save Crop</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
