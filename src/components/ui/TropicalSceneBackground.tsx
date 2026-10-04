import React from 'react';

/**
 * TropicalSceneBackground — Grand Voyager theme
 * CSS-only layered approach (no SVG flat fills — those look cartoonish).
 * Uses blurred, overlapping div gradients to create a photographic, atmospheric
 * tropical cove feel. No images, no AI art, no external resources.
 */
export const TropicalSceneBackground: React.FC = () => {
    return (
        <div
            className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none"
            aria-hidden="true"
            style={{ isolation: 'isolate' }}
        >
            <style>{`
                @keyframes gv-wave-slow {
                    0%   { transform: translateX(0%) scaleY(1); }
                    50%  { transform: translateX(-3%) scaleY(1.04); }
                    100% { transform: translateX(-6%) scaleY(1); }
                }
                @keyframes gv-wave-mid {
                    0%   { transform: translateX(0%) scaleY(1); }
                    50%  { transform: translateX(3%) scaleY(1.06); }
                    100% { transform: translateX(6%) scaleY(1); }
                }
                @keyframes gv-wave-fast {
                    0%   { transform: translateX(0%) scaleY(1); }
                    50%  { transform: translateX(-4%) scaleY(1.05); }
                    100% { transform: translateX(-8%) scaleY(1); }
                }
                @keyframes gv-shimmer {
                    0%, 100% { opacity: 0.4; }
                    50%       { opacity: 0.75; }
                }
                @keyframes gv-cloud-drift {
                    0%   { transform: translateX(0px); }
                    100% { transform: translateX(70px); }
                }
                @keyframes gv-sun-pulse {
                    0%, 100% { opacity: 0.85; transform: scale(1); }
                    50%       { opacity: 1; transform: scale(1.02); }
                }
                .gv-w-slow { animation: gv-wave-slow 9s ease-in-out infinite alternate; }
                .gv-w-mid  { animation: gv-wave-mid 7s ease-in-out infinite alternate; }
                .gv-w-fast { animation: gv-wave-fast 5.5s ease-in-out infinite alternate; }
                .gv-shimmer { animation: gv-shimmer 4s ease-in-out infinite; }
                .gv-cloud-a { animation: gv-cloud-drift 30s ease-in-out infinite alternate; }
                .gv-cloud-b { animation: gv-cloud-drift 40s ease-in-out infinite alternate-reverse; }
                .gv-sun-pulse { animation: gv-sun-pulse 6s ease-in-out infinite; }
            `}</style>

            {/* ─────────────────────────────────────────────────────── */}
            {/* LAYER 1: Sky base — rich azure to soft horizon         */}
            {/* ─────────────────────────────────────────────────────── */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(180deg, #0d4a8c 0%, #1a6ac0 18%, #3090d8 38%, #5ab0ec 54%, #80c8f5 66%, #a8defa 76%, #c8ecfe 84%, #d8f0fe 90%, #e0d898 95%, #dcc87a 100%)',
                }}
            />

            {/* ─────────────────────────────────────────────────────── */}
            {/* LAYER 2: Sun — blazing, soft, photographic             */}
            {/* ─────────────────────────────────────────────────────── */}
            {/* Outer atmospheric halo — massive */}
            <div
                className="absolute gv-sun-pulse"
                style={{
                    top: '-180px', right: '-40px',
                    width: '680px', height: '680px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,250,200,0.85) 0%, rgba(255,230,120,0.6) 20%, rgba(255,200,60,0.3) 40%, rgba(255,180,30,0.12) 60%, transparent 75%)',
                    filter: 'blur(32px)',
                }}
            />
            {/* Inner core glow */}
            <div
                className="absolute"
                style={{
                    top: '-30px', right: '80px',
                    width: '300px', height: '300px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,248,210,0.95) 18%, rgba(255,230,140,0.7) 38%, rgba(255,210,80,0.3) 58%, transparent 72%)',
                    filter: 'blur(8px)',
                }}
            />
            {/* Sun disc */}
            <div
                className="absolute"
                style={{
                    top: '42px', right: '148px',
                    width: '82px', height: '82px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #ffffff 0%, #fffbf0 55%, #fff8e0 100%)',
                    boxShadow: '0 0 60px 30px rgba(255,248,200,0.8), 0 0 120px 60px rgba(255,230,100,0.4)',
                }}
            />

            {/* ─────────────────────────────────────────────────────── */}
            {/* LAYER 3: Atmospheric sky glow — warm tone near horizon */}
            {/* ─────────────────────────────────────────────────────── */}
            <div
                className="absolute inset-x-0"
                style={{
                    top: '52%',
                    height: '18%',
                    background: 'linear-gradient(180deg, transparent 0%, rgba(220,245,255,0.25) 40%, rgba(180,230,250,0.3) 100%)',
                    filter: 'blur(4px)',
                }}
            />

            {/* ─────────────────────────────────────────────────────── */}
            {/* LAYER 4: Clouds — soft white, blurred photographic     */}
            {/* ─────────────────────────────────────────────────────── */}
            <div className="absolute gv-cloud-a" style={{ top: '6%', left: '5%', filter: 'blur(8px)' }}>
                <div style={{
                    width: '380px', height: '100px',
                    background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(255,255,255,0.95) 0%, rgba(240,250,255,0.85) 45%, transparent 80%)',
                }} />
            </div>
            <div className="absolute gv-cloud-a" style={{ top: '4%', left: '12%', filter: 'blur(5px)' }}>
                <div style={{
                    width: '280px', height: '75px',
                    background: 'radial-gradient(ellipse 55% 55% at 50% 55%, rgba(255,255,255,0.9) 0%, rgba(235,248,255,0.75) 50%, transparent 80%)',
                }} />
            </div>
            <div className="absolute gv-cloud-b" style={{ top: '8%', left: '40%', filter: 'blur(7px)' }}>
                <div style={{
                    width: '340px', height: '90px',
                    background: 'radial-gradient(ellipse 58% 48% at 50% 60%, rgba(255,255,255,0.88) 0%, rgba(238,250,255,0.72) 48%, transparent 78%)',
                }} />
            </div>
            <div className="absolute gv-cloud-b" style={{ top: '11%', left: '55%', filter: 'blur(9px)', opacity: 0.65 }}>
                <div style={{
                    width: '250px', height: '65px',
                    background: 'radial-gradient(ellipse 55% 50% at 50% 58%, rgba(255,255,255,0.85) 0%, rgba(230,248,255,0.65) 50%, transparent 78%)',
                }} />
            </div>

            {/* ─────────────────────────────────────────────────────── */}
            {/* LAYER 5: Distant island/landmass — blurred, hazy       */}
            {/* ─────────────────────────────────────────────────────── */}
            <div
                className="absolute"
                style={{
                    top: '47%',
                    left: '6%',
                    width: '32%',
                    height: '10%',
                    background: 'radial-gradient(ellipse 80% 60% at 50% 70%, rgba(22,90,48,0.7) 0%, rgba(14,62,32,0.55) 50%, transparent 80%)',
                    filter: 'blur(10px)',
                    borderRadius: '50%',
                }}
            />
            <div
                className="absolute"
                style={{
                    top: '48%',
                    right: '8%',
                    width: '22%',
                    height: '8%',
                    background: 'radial-gradient(ellipse 80% 60% at 50% 70%, rgba(18,72,38,0.55) 0%, rgba(10,48,22,0.4) 50%, transparent 80%)',
                    filter: 'blur(12px)',
                    borderRadius: '50%',
                }}
            />

            {/* ─────────────────────────────────────────────────────── */}
            {/* LAYER 6: Deep ocean — rich teal, the heart of the scene*/}
            {/* ─────────────────────────────────────────────────────── */}
            <div
                className="absolute inset-x-0 gv-w-slow"
                style={{
                    top: '50%',
                    bottom: '17%',
                    background: 'linear-gradient(180deg, #006c7a 0%, #008898 20%, #00a0a8 45%, #12b8b0 68%, #22c8c0 85%, #34d4cc 100%)',
                    borderRadius: '48% 52% 0 0 / 22px 22px 0 0',
                    transformOrigin: 'bottom center',
                }}
            />
            {/* Mid ocean wave — brighter */}
            <div
                className="absolute inset-x-0 gv-w-mid"
                style={{
                    top: '56%',
                    bottom: '17%',
                    background: 'linear-gradient(180deg, #00a4ae 0%, #12bcb4 25%, #28cec6 55%, #40dad2 80%, #58e4dc 100%)',
                    borderRadius: '45% 55% 0 0 / 18px 18px 0 0',
                    transformOrigin: 'bottom center',
                }}
            />
            {/* Near-shore lagoon — crystal brilliant turquoise */}
            <div
                className="absolute inset-x-0 gv-w-fast"
                style={{
                    top: '62%',
                    bottom: '17%',
                    background: 'linear-gradient(180deg, #18c8c0 0%, #30d8d0 30%, #48e4dc 60%, #62ece8 85%, #80f2ee 100%)',
                    borderRadius: '42% 58% 0 0 / 14px 14px 0 0',
                    transformOrigin: 'bottom center',
                }}
            />
            {/* Foam edge — white cap at shore */}
            <div
                className="absolute inset-x-0"
                style={{
                    bottom: '17%',
                    height: '14px',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 40%, transparent 100%)',
                    filter: 'blur(2px)',
                }}
            />

            {/* ─────────────────────────────────────────────────────── */}
            {/* LAYER 7: Sun reflection column on water                */}
            {/* ─────────────────────────────────────────────────────── */}
            <div
                className="absolute gv-shimmer"
                style={{
                    top: '52%',
                    bottom: '17%',
                    right: '6%',
                    width: '12%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,240,160,0.45) 25%, rgba(255,220,100,0.28) 55%, rgba(255,200,60,0.1) 80%, transparent 100%)',
                    filter: 'blur(12px)',
                    borderRadius: '50%',
                }}
            />
            {/* Bright sparkle center of reflection */}
            <div
                className="absolute gv-shimmer"
                style={{
                    animationDelay: '-1.8s',
                    top: '56%',
                    bottom: '25%',
                    right: '10%',
                    width: '4%',
                    background: 'rgba(255,255,255,0.5)',
                    filter: 'blur(8px)',
                    borderRadius: '50%',
                }}
            />

            {/* ─────────────────────────────────────────────────────── */}
            {/* LAYER 8: Sandy beach — warm golden bottom strip        */}
            {/* ─────────────────────────────────────────────────────── */}
            <div
                className="absolute inset-x-0"
                style={{
                    bottom: 0,
                    height: '20%',
                    background: 'linear-gradient(180deg, #c09430 0%, #d4a840 18%, #e2b850 42%, #eec860 65%, #f6d870 85%, #fce078 100%)',
                }}
            />
            {/* Wet sand at waterline */}
            <div
                className="absolute inset-x-0"
                style={{
                    bottom: '17%',
                    height: '5%',
                    background: 'linear-gradient(180deg, rgba(148,108,28,0.55) 0%, rgba(168,124,36,0.4) 50%, transparent 100%)',
                    filter: 'blur(1px)',
                }}
            />

            {/* ─────────────────────────────────────────────────────── */}
            {/* LAYER 9: Distant sailing ship — subtle silhouette      */}
            {/* ─────────────────────────────────────────────────────── */}
            <div
                className="absolute"
                style={{
                    top: '48%',
                    left: '38%',
                    width: '60px',
                    height: '80px',
                    opacity: 0.35,
                    filter: 'blur(1.5px)',
                }}
            >
                <svg viewBox="0 0 60 80" width="60" height="80" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 72 Q30 76, 40 72 L37 79 Q30 82, 23 79 Z" fill="#2a3820" />
                    <rect x="29" y="18" width="2" height="54" fill="#2a3820" />
                    <rect x="40" y="32" width="1.5" height="36" fill="#2a3820" />
                    <path d="M30 20 L50 58 L30 62 Z" fill="#e8e0c8" opacity="0.9" />
                    <path d="M30 20 L12 52 L30 62 Z" fill="#ddd5c0" opacity="0.85" />
                    <path d="M41 34 L54 56 L41 60 Z" fill="#e0d8c4" opacity="0.8" />
                    <rect x="18" y="42" width="24" height="1.5" fill="#2a3820" />
                </svg>
            </div>

            {/* ─────────────────────────────────────────────────────── */}
            {/* LAYER 10: Subtle top-to-bottom atmosphere overlay      */}
            {/* ─────────────────────────────────────────────────────── */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, transparent 30%, transparent 75%, rgba(0,0,0,0.04) 100%)',
                }}
            />

            {/* ─────────────────────────────────────────────────────── */}
            {/* LAYER 11: Vignette edges — subtle cinematic framing    */}
            {/* ─────────────────────────────────────────────────────── */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse 90% 90% at 50% 45%, transparent 40%, rgba(0,0,0,0.22) 100%)',
                }}
            />
        </div>
    );
};
