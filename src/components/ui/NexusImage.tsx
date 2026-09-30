import React, { useState, useEffect } from 'react';
import { ImageOff, Sparkles } from 'lucide-react';
import { resolveAssetUrl } from '../../utils/assetStore';

interface NexusImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src?: string;
    fallbackIcon?: React.ElementType;
    containerClassName?: string;
}

export const NexusImage: React.FC<NexusImageProps> = ({
    src,
    alt = 'Nexus Lore Asset',
    className = '',
    containerClassName = '',
    fallbackIcon: FallbackIcon = ImageOff,
    ...props
}) => {
    const [resolvedUrl, setResolvedUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        setHasError(false);

        if (!src) {
            setResolvedUrl('');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        if (src.startsWith('asset://')) {
            resolveAssetUrl(src)
                .then((url) => {
                    if (isMounted) {
                        if (url) {
                            setResolvedUrl(url);
                        } else {
                            setHasError(true);
                        }
                        setIsLoading(false);
                    }
                })
                .catch(() => {
                    if (isMounted) {
                        setHasError(true);
                        setIsLoading(false);
                    }
                });
        } else {
            setResolvedUrl(src);
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [src]);

    if (!src || hasError) {
        return (
            <div className={`flex items-center justify-center bg-black/30 border border-white/5 text-white/30 rounded-xl ${containerClassName} ${className}`}>
                <FallbackIcon size={24} className="opacity-40" />
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${containerClassName}`}>
            {isLoading && (
                <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
                    <Sparkles size={16} className="text-yellow-400/40 animate-spin" />
                </div>
            )}
            <img
                src={resolvedUrl}
                alt={alt}
                className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                onError={() => setHasError(true)}
                {...props}
            />
        </div>
    );
};
