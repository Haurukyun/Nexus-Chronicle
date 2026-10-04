import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
    Compass, Wind, MapPin, Footprints, Clock, Scale, 
    Ship, Shield, Flame, Mountain, TreePine, AlertTriangle, 
    CheckCircle2, Edit3, ArrowRight, Backpack, Users, Sparkles,
    ExternalLink, X, Crosshair
} from 'lucide-react';
import { WorldData, Location } from '../types';
import { useWorldStore } from '../store/useWorldStore';
import { useTheme } from '../theme';

interface JourneyViewProps {
    world: WorldData;
    onNavigate: (id: string) => void;
}

type TravelMethod = 'foot' | 'wagon' | 'horse' | 'ship' | 'magic';
type TerrainType = 'highway' | 'hills' | 'forest' | 'mountains' | 'chasm';

const TRAVEL_SPEEDS: Record<TravelMethod, { speed: number; label: string; icon: any; desc: string }> = {
    foot:  { speed: 20, label: 'On Foot', icon: Footprints, desc: '20 leagues/day · Standard march pace' },
    wagon: { speed: 35, label: 'Caravan / Cart', icon: Scale, desc: '35 leagues/day · Heavy baggage & supplies' },
    horse: { speed: 60, label: 'Mounted Steed', icon: Wind, desc: '60 leagues/day · Couriers & light cavalry' },
    ship:  { speed: 90, label: 'Sea Vessel', icon: Ship, desc: '90 leagues/day · Unobstructed coastal winds' },
    magic: { speed: 220, label: 'Arcane Flight', icon: Sparkles, desc: '220 leagues/day · Wind-striders & portals' }
};

const TERRAIN_MODIFIERS: Record<TerrainType, { factor: number; label: string; icon: any; danger: string }> = {
    highway:   { factor: 1.0, label: 'Imperial Highway / Paved Road', icon: CheckCircle2, danger: 'Safe (Patrolled)' },
    hills:     { factor: 1.25, label: 'Rolling Hills & Grassy Plains', icon: Wind, danger: 'Moderate (Wildlife)' },
    forest:    { factor: 1.5, label: 'Dense Wildwood & Swamplands', icon: TreePine, danger: 'Hazardous (Predators)' },
    mountains: { factor: 1.85, label: 'Jagged Alpine Passes & Crags', icon: Mountain, danger: 'Severe (Rockslides & Altitude)' },
    chasm:     { factor: 2.4, label: 'Planar Rift / Desolate Badlands', icon: Flame, danger: 'Treacherous (Monsters & Magic)' }
};

export const JourneyView: React.FC<JourneyViewProps> = ({ world, onNavigate }) => {
    const [startId, setStartId] = useState<string>('');
    const [endId, setEndId] = useState<string>('');
    const [travelMethod, setTravelMethod] = useState<TravelMethod>('foot');
    const [terrain, setTerrain] = useState<TerrainType>('highway');
    const [partySize, setPartySize] = useState<number>(4);
    
    // Manual override state
    const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
    const [manualDistanceInput, setManualDistanceInput] = useState<string>('');

    const setWorld = useWorldStore(state => state.setWorld);
    const handleOpenEntity = useWorldStore(state => state.handleOpenEntity);
    const handleToggleEdit = useWorldStore(state => state.handleToggleEdit);
    const editingTabIds = useWorldStore(state => state.editingTabIds);

    const [quickPinTarget, setQuickPinTarget] = useState<Location | null>(null);
    const [quickPinCoords, setQuickPinCoords] = useState<{ x: number; y: number } | null>(null);

    const { isWikiMode, isRoyal } = useTheme();
    const mapImage = world.mapImage;

    const handleOpenInEditor = (id: string) => {
        handleOpenEntity(id);
        if (!editingTabIds.includes(id)) {
            handleToggleEdit(id);
        }
    };

    const locations = useMemo(() => {
        return world.entities.filter(e => e.type === 'location') as Location[];
    }, [world.entities]);

    const startLoc = useMemo(() => locations.find(l => l.id === startId), [locations, startId]);
    const endLoc = useMemo(() => locations.find(l => l.id === endId), [locations, endId]);

    const hasCoordinates = Boolean(startLoc?.coordinates && endLoc?.coordinates);

    // Calculate Euclidean base leagues from Atlas coordinates (10 leagues per 1 map percentage unit)
    const coordinateDistance = useMemo(() => {
        if (!startLoc?.coordinates || !endLoc?.coordinates) return null;
        const dx = endLoc.coordinates.x - startLoc.coordinates.x;
        const dy = endLoc.coordinates.y - startLoc.coordinates.y;
        const distUnits = Math.sqrt(dx * dx + dy * dy);
        const unitsToLeagues = 10;
        return Math.round(distUnits * unitsToLeagues);
    }, [startLoc, endLoc]);

    // Active distance in leagues (either from coordinate calculation or manual override)
    const effectiveBaseLeagues = useMemo(() => {
        if (isManualOverride) {
            const parsed = parseFloat(manualDistanceInput);
            return isNaN(parsed) || parsed < 0 ? 0 : parsed;
        }
        if (coordinateDistance !== null) {
            return coordinateDistance;
        }
        // If no coordinates and no manual override, fall back to manual input if provided
        const parsed = parseFloat(manualDistanceInput);
        return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    }, [isManualOverride, manualDistanceInput, coordinateDistance]);

    // Final calculation with terrain multiplier and transit speed
    const calculation = useMemo(() => {
        if (effectiveBaseLeagues <= 0) return null;

        const terrainMod = TERRAIN_MODIFIERS[terrain];
        const methodInfo = TRAVEL_SPEEDS[travelMethod];

        const totalLeagues = Math.round(effectiveBaseLeagues * terrainMod.factor);
        const daysExact = totalLeagues / methodInfo.speed;
        const days = Math.max(0.1, daysExact);

        const rationsNeeded = Math.ceil(days * partySize);
        const campsitesNeeded = Math.max(0, Math.floor(days));

        return {
            baseLeagues: Math.round(effectiveBaseLeagues),
            terrainFactor: terrainMod.factor,
            totalLeagues,
            days: days.toFixed(1),
            daysInt: Math.ceil(days),
            rationsNeeded,
            campsitesNeeded,
            speed: methodInfo.speed,
            danger: terrainMod.danger
        };
    }, [effectiveBaseLeagues, terrain, travelMethod, partySize]);

    const accent = isRoyal ? 'text-[#70121e]' : isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    const bgCard = isRoyal
        ? 'bg-[#181410] border-[#c8a96e]/30 shadow-2xl'
        : isWikiMode 
        ? 'bg-[#fdf6e3] border-[#d4c8af] shadow-md' 
        : 'bg-slate-900/50 border-slate-800 shadow-2xl';

    const inputBg = isRoyal
        ? 'bg-[#0f0905] border-[#c8a96e]/30 text-[#f0ddb0]'
        : isWikiMode
        ? 'bg-white border-[#d4c8af] text-slate-900'
        : 'bg-black/30 border-slate-700 text-white';

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    <Compass size={28} className={accent} />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] opacity-50">Logistics & Expedition Planner</span>
                </div>
                <h1 className={`text-5xl lg:text-7xl font-serif font-black uppercase tracking-tighter ${
                    isRoyal ? 'text-[#3d0a10]' : isWikiMode ? 'text-[#b91c1c]' : 'text-white'
                }`}>
                    The Grand Voyager
                </h1>
                <p className="opacity-60 text-sm tracking-[0.2em] uppercase italic">
                    Transdimensional Distances, Expedition Rations & Waypoint Navigation
                </p>
            </header>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Configuration Form */}
                <div className={`lg:col-span-7 p-8 rounded-[3rem] border ${bgCard} space-y-8`}>
                    <h3 className="text-lg font-serif font-bold flex items-center gap-3 uppercase tracking-widest border-b pb-4 border-slate-500/10">
                        <Compass size={18} className={accent} /> Route Anchors & Conditions
                    </h3>

                    {/* Location Selectors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Starting Location */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase opacity-60">
                                    Origin Anchor
                                </label>
                                {startLoc && (
                                    <div className="flex items-center gap-1.5">
                                        {startLoc.coordinates ? (
                                            <span className="text-[9px] text-emerald-400 font-mono">
                                                [{startLoc.coordinates.x}%, {startLoc.coordinates.y}%]
                                            </span>
                                        ) : (
                                            <span className="text-[9px] text-amber-400 font-mono">Unanchored</span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setQuickPinTarget(startLoc);
                                                setQuickPinCoords(startLoc.coordinates || { x: 50, y: 50 });
                                            }}
                                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all flex items-center gap-1 ${
                                                startLoc.coordinates
                                                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                            }`}
                                            title="Set or update map coordinates"
                                        >
                                            <MapPin size={10} /> {startLoc.coordinates ? 'Re-pin' : 'Pin'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenInEditor(startLoc.id)}
                                            className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase opacity-60 hover:opacity-100 hover:bg-white/10 transition-all"
                                            title="Open in Location Editor"
                                        >
                                            <ExternalLink size={10} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <select 
                                value={startId} 
                                onChange={(e) => {
                                    setStartId(e.target.value);
                                    setIsManualOverride(false);
                                }}
                                className={`w-full p-3.5 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
                            >
                                <option value="">Select Origin...</option>
                                {locations.map(l => (
                                    <option key={l.id} value={l.id}>
                                        {l.name} {l.coordinates ? '📍' : '▫️'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Destination Location */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase opacity-60">
                                    Destination Anchor
                                </label>
                                {endLoc && (
                                    <div className="flex items-center gap-1.5">
                                        {endLoc.coordinates ? (
                                            <span className="text-[9px] text-emerald-400 font-mono">
                                                [{endLoc.coordinates.x}%, {endLoc.coordinates.y}%]
                                            </span>
                                        ) : (
                                            <span className="text-[9px] text-amber-400 font-mono">Unanchored</span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setQuickPinTarget(endLoc);
                                                setQuickPinCoords(endLoc.coordinates || { x: 50, y: 50 });
                                            }}
                                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all flex items-center gap-1 ${
                                                endLoc.coordinates
                                                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                            }`}
                                            title="Set or update map coordinates"
                                        >
                                            <MapPin size={10} /> {endLoc.coordinates ? 'Re-pin' : 'Pin'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenInEditor(endLoc.id)}
                                            className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase opacity-60 hover:opacity-100 hover:bg-white/10 transition-all"
                                            title="Open in Location Editor"
                                        >
                                            <ExternalLink size={10} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <select 
                                value={endId} 
                                onChange={(e) => {
                                    setEndId(e.target.value);
                                    setIsManualOverride(false);
                                }}
                                className={`w-full p-3.5 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
                            >
                                <option value="">Select Destination...</option>
                                {locations.map(l => (
                                    <option key={l.id} value={l.id}>
                                        {l.name} {l.coordinates ? '📍' : '▫️'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Unanchored Locations Warning & Guidance */}
                    {startLoc && endLoc && !hasCoordinates && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                                <div className="text-xs space-y-1">
                                    <p className="font-bold text-amber-300">Unanchored Route Detected</p>
                                    <p className="opacity-75 leading-relaxed">
                                        {!startLoc.coordinates && !endLoc.coordinates 
                                            ? "Both selected locations lack Atlas map coordinates."
                                            : !startLoc.coordinates
                                            ? `Origin "${startLoc.name}" does not have map coordinates.`
                                            : `Destination "${endLoc.name}" does not have map coordinates.`
                                        } Anchor them directly using the quick pin buttons below, open them in the Location editor, or use the <strong>Manual Distance Override</strong>.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-500/20">
                                {!startLoc.coordinates && (
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setQuickPinTarget(startLoc);
                                                setQuickPinCoords({ x: 50, y: 50 });
                                            }}
                                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                                        >
                                            <MapPin size={12} /> Pin {startLoc.name}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenInEditor(startLoc.id)}
                                            className="px-2.5 py-1.5 rounded-xl bg-black/20 hover:bg-white/10 text-slate-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                                        >
                                            <ExternalLink size={11} /> Editor
                                        </button>
                                    </div>
                                )}
                                {!endLoc.coordinates && (
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setQuickPinTarget(endLoc);
                                                setQuickPinCoords({ x: 50, y: 50 });
                                            }}
                                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                                        >
                                            <MapPin size={12} /> Pin {endLoc.name}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenInEditor(endLoc.id)}
                                            className="px-2.5 py-1.5 rounded-xl bg-black/20 hover:bg-white/10 text-slate-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                                        >
                                            <ExternalLink size={11} /> Editor
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Distance Mode: Coordinate vs Manual Override */}
                    <div className="p-4 rounded-2xl border border-slate-500/15 space-y-3 bg-black/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Edit3 size={14} className={accent} />
                                <span className="text-xs font-bold uppercase tracking-wider">Distance Determination</span>
                            </div>
                            {coordinateDistance !== null && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsManualOverride(!isManualOverride);
                                        if (!isManualOverride && !manualDistanceInput) {
                                            setManualDistanceInput(String(coordinateDistance));
                                        }
                                    }}
                                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border transition-all ${
                                        isManualOverride 
                                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                            : 'opacity-50 hover:opacity-100 border-slate-500/30'
                                    }`}
                                >
                                    {isManualOverride ? 'Using Manual Override' : 'Override Distance'}
                                </button>
                            )}
                        </div>

                        {coordinateDistance !== null && !isManualOverride ? (
                            <div className="flex items-center justify-between text-xs pt-1">
                                <span className="opacity-60">Calculated via Atlas Pin Coordinates:</span>
                                <span className="font-mono font-bold text-base text-yellow-300">
                                    {coordinateDistance} <span className="text-xs font-normal opacity-70">Leagues</span>
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-1.5 pt-1">
                                <label className="text-[10px] font-black uppercase opacity-60 flex items-center justify-between">
                                    <span>Route Distance in Leagues</span>
                                    {coordinateDistance !== null && (
                                        <span className="text-[9px] opacity-40">
                                            (Map straight-line: {coordinateDistance} leagues)
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    placeholder="Enter estimated leagues (e.g. 150)"
                                    value={manualDistanceInput}
                                    onChange={(e) => setManualDistanceInput(e.target.value)}
                                    className={`w-full p-3 rounded-xl border text-xs outline-none ${inputBg}`}
                                />
                            </div>
                        )}
                    </div>

                    {/* Method of Transit */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-50 tracking-wider">
                            Method of Transit
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                            {(Object.keys(TRAVEL_SPEEDS) as TravelMethod[]).map(m => {
                                const info = TRAVEL_SPEEDS[m];
                                const Icon = info.icon;
                                const isSelected = travelMethod === m;
                                return (
                                    <button 
                                        key={m}
                                        type="button"
                                        onClick={() => setTravelMethod(m)}
                                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-20 ${
                                            isSelected 
                                                ? (isRoyal
                                                    ? 'bg-[#70121e] text-[#fff8e7] border-[#c8a96e] shadow-md'
                                                    : isWikiMode 
                                                    ? 'bg-[#b91c1c] text-white border-transparent shadow-md' 
                                                    : 'bg-[#fef08a] text-black border-transparent shadow-lg shadow-yellow-500/20') 
                                                : isRoyal ? 'hover:bg-[#d9c9a3]/20 opacity-60 border-[#c8a96e]/20' : 'hover:bg-white/5 opacity-60 border-slate-500/20'
                                        }`}
                                    >
                                        <Icon size={18} />
                                        <div>
                                            <div className="text-[11px] font-bold leading-tight">{info.label}</div>
                                            <div className="text-[8px] opacity-75 font-mono">{info.speed} l/d</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Terrain & Hazards Modifier */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-50 tracking-wider">
                            Terrain & Waypoint Difficulty
                        </label>
                        <select 
                            value={terrain} 
                            onChange={(e) => setTerrain(e.target.value as TerrainType)}
                            className={`w-full p-3.5 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
                        >
                            {(Object.keys(TERRAIN_MODIFIERS) as TerrainType[]).map(t => {
                                const info = TERRAIN_MODIFIERS[t];
                                return (
                                    <option key={t} value={t}>
                                        {info.label} (Multiplier: {info.factor}x) — {info.danger}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Expedition Party Size */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-500/15 bg-black/10">
                        <div className="flex items-center gap-2">
                            <Users size={16} className={accent} />
                            <div>
                                <div className="text-xs font-bold uppercase">Travel Party Size</div>
                                <div className="text-[9px] opacity-40">Affects ration consumption & supply burdens</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {[1, 2, 4, 6, 10].map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setPartySize(size)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        partySize === size 
                                            ? 'bg-yellow-400 text-black shadow' 
                                            : 'opacity-40 hover:opacity-100 hover:bg-white/10'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Voyage Ledger & Visual Path */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Primary Calculation Display Card */}
                    <div className={`p-8 rounded-[3rem] border ${bgCard} relative overflow-hidden flex flex-col justify-between space-y-8 min-h-[380px]`}>
                        {calculation ? (
                            <div className="space-y-8 animate-in zoom-in-95 duration-300">
                                {/* Route Overview Header */}
                                <div className="flex items-center justify-between border-b pb-4 border-slate-500/10">
                                    <div className="truncate max-w-[45%]">
                                        <div className="text-[9px] uppercase tracking-wider opacity-40 font-bold">Departure</div>
                                        <div className="text-sm font-black truncate">{startLoc?.name}</div>
                                    </div>
                                    <ArrowRight size={16} className={accent} />
                                    <div className="truncate max-w-[45%] text-right">
                                        <div className="text-[9px] uppercase tracking-wider opacity-40 font-bold">Destination</div>
                                        <div className="text-sm font-black truncate">{endLoc?.name}</div>
                                    </div>
                                </div>

                                {/* Big Number Metrics */}
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="p-4 rounded-2xl bg-black/15 border border-white/5 space-y-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${accent}`}>
                                            Expedition Distance
                                        </span>
                                        <div className="text-4xl lg:text-5xl font-serif font-black">
                                            {calculation.totalLeagues}
                                        </div>
                                        <div className="text-[10px] opacity-50 uppercase tracking-widest">Leagues</div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-black/15 border border-white/5 space-y-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${accent}`}>
                                            Arrival Forecast
                                        </span>
                                        <div className="text-4xl lg:text-5xl font-serif font-black">
                                            {calculation.days}
                                        </div>
                                        <div className="text-[10px] opacity-50 uppercase tracking-widest">Days of Transit</div>
                                    </div>
                                </div>

                                {/* Logistics Manifest */}
                                <div className="space-y-2 pt-2 border-t border-slate-500/10">
                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                                        Expedition Supply Manifest
                                    </div>

                                    <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-black/10">
                                        <span className="flex items-center gap-2 opacity-70">
                                            <Backpack size={13} /> Provisions / Rations:
                                        </span>
                                        <span className="font-mono font-bold text-yellow-300">
                                            {calculation.rationsNeeded} Rations ({partySize} travelers)
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-black/10">
                                        <span className="flex items-center gap-2 opacity-70">
                                            <Clock size={13} /> Expected Encampments:
                                        </span>
                                        <span className="font-mono font-bold">
                                            {calculation.campsitesNeeded} Overnight Camps
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-black/10">
                                        <span className="flex items-center gap-2 opacity-70">
                                            <Shield size={13} /> Danger Classification:
                                        </span>
                                        <span className="font-mono font-bold text-emerald-400">
                                            {calculation.danger}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="my-auto text-center space-y-4 py-12">
                                <div className="w-16 h-16 rounded-full bg-slate-500/10 flex items-center justify-center mx-auto opacity-40">
                                    <MapPin size={32} />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-serif text-lg uppercase tracking-wider opacity-60">Awaiting Course Coordinates</p>
                                    <p className="text-xs opacity-40 max-w-xs mx-auto leading-relaxed">
                                        Select both an Origin and a Destination above, or enter a manual distance to chart the threads of transit.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mini Route Map Preview (if both locations have coordinates) */}
                    {hasCoordinates && startLoc?.coordinates && endLoc?.coordinates && (
                        <div className={`p-4 rounded-3xl border ${bgCard} space-y-2`}>
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                                    <Compass size={12} className={accent} /> Trajectory Projection
                                </span>
                                <span className="text-[9px] font-mono opacity-40">Atlas Synchronized</span>
                            </div>

                            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
                                <img
                                    src={mapImage}
                                    alt="Journey Path"
                                    className="w-full h-full object-cover filter contrast-105 opacity-70"
                                />

                                {/* SVG Connection Vector */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    <line
                                        x1={`${startLoc.coordinates.x}%`}
                                        y1={`${startLoc.coordinates.y}%`}
                                        x2={`${endLoc.coordinates.x}%`}
                                        y2={`${endLoc.coordinates.y}%`}
                                        stroke="#facc15"
                                        strokeWidth="2.5"
                                        strokeDasharray="6 4"
                                        className="animate-pulse"
                                    />
                                </svg>

                                {/* Origin Pin */}
                                <div
                                    style={{ left: `${startLoc.coordinates.x}%`, top: `${startLoc.coordinates.y}%` }}
                                    className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center"
                                >
                                    <div className="px-1.5 py-0.5 rounded bg-black/90 text-[8px] font-bold text-white shadow border border-white/20">
                                        {startLoc.name}
                                    </div>
                                    <div className="p-1 rounded-full bg-emerald-400 text-black shadow-md">
                                        <MapPin size={12} fill="currentColor" />
                                    </div>
                                </div>

                                {/* Destination Pin */}
                                <div
                                    style={{ left: `${endLoc.coordinates.x}%`, top: `${endLoc.coordinates.y}%` }}
                                    className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center"
                                >
                                    <div className="px-1.5 py-0.5 rounded bg-black/90 text-[8px] font-bold text-yellow-300 shadow border border-yellow-500/40">
                                        {endLoc.name}
                                    </div>
                                    <div className="p-1 rounded-full bg-yellow-400 text-black shadow-md">
                                        <MapPin size={12} fill="currentColor" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Voyager's Almanac & Lore Footer */}
            <div className={`p-8 lg:p-10 rounded-[3rem] border ${bgCard} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Clock size={160} />
                </div>
                <div className="relative z-10 space-y-4">
                    <h3 className="text-xl font-serif font-bold uppercase tracking-[0.2em]">Voyager's Almanac & Imperial Standards</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs italic opacity-70 leading-relaxed">
                        <div className="p-4 rounded-xl bg-black/10 border border-white/5 space-y-1">
                            <span className="font-bold font-sans not-italic text-[10px] uppercase opacity-60 block">The Standard League</span>
                            <p>"One World League corresponds to three nautical miles or approx. one hour of steady foot travel across fair weather and flat earth."</p>
                        </div>
                        <div className="p-4 rounded-xl bg-black/10 border border-white/5 space-y-1">
                            <span className="font-bold font-sans not-italic text-[10px] uppercase opacity-60 block">Mountain & Marsh Multipliers</span>
                            <p>"Air distance is calculated as the raven flies. High elevation passes typically require a 1.8x to 2.4x detour factor due to winding crags."</p>
                        </div>
                        <div className="p-4 rounded-xl bg-black/10 border border-white/5 space-y-1">
                            <span className="font-bold font-sans not-italic text-[10px] uppercase opacity-60 block">Arcane Gateways</span>
                            <p>"Ley-line crossings compress leagues into seconds, but require rare runic catalysts and stable anchor points on both ends."</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Pin Modal */}
            {quickPinTarget && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className={`w-full max-w-2xl p-6 rounded-3xl border shadow-2xl space-y-5 ${
                        isRoyal
                            ? 'bg-[#181410] border-[#c8a96e]/50 text-[#f0ddb0]'
                            : isWikiMode
                            ? 'bg-[#fbf6ea] border-[#d4c8af] text-[#2b1810]'
                            : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}>
                        {/* Header */}
                        <div className="flex items-center justify-between border-b pb-4 border-slate-500/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-serif font-black uppercase tracking-tight">
                                        Quick Anchor: {quickPinTarget.name}
                                    </h3>
                                    <p className="text-[10px] opacity-60 font-mono tracking-widest">
                                        CLICK ANYWHERE ON MAP TO FIX COORD PIN
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setQuickPinTarget(null); setQuickPinCoords(null); }}
                                className="opacity-50 hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Interactive Map Canvas */}
                        <div className="space-y-3">
                            <div
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
                                    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
                                    setQuickPinCoords({
                                        x: Math.max(0, Math.min(100, x)),
                                        y: Math.max(0, Math.min(100, y))
                                    });
                                }}
                                className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 cursor-crosshair shadow-inner group select-none"
                            >
                                <img
                                    src={mapImage}
                                    alt="Realm Map"
                                    className="w-full h-full object-cover filter contrast-105 pointer-events-none select-none"
                                />

                                {/* Render current pin marker if coords exist */}
                                {quickPinCoords && (
                                    <div
                                        style={{ left: `${quickPinCoords.x}%`, top: `${quickPinCoords.y}%` }}
                                        className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none transition-all duration-150 animate-in zoom-in"
                                    >
                                        <div className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider mb-0.5 shadow-md bg-black/90 text-yellow-300 border border-yellow-500/40">
                                            {quickPinTarget.name}
                                        </div>
                                        <div className="p-1.5 rounded-full bg-yellow-400 text-black shadow-[0_0_16px_rgba(250,204,21,0.9)] animate-pulse">
                                            <MapPin size={16} fill="currentColor" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Inputs & Quick Actions */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase opacity-60">X%:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={quickPinCoords?.x ?? 50}
                                        onChange={(e) => {
                                            const val = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                                            setQuickPinCoords(prev => ({ x: val, y: prev?.y ?? 50 }));
                                        }}
                                        className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${inputBg}`}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase opacity-60">Y%:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={quickPinCoords?.y ?? 50}
                                        onChange={(e) => {
                                            const val = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                                            setQuickPinCoords(prev => ({ x: prev?.x ?? 50, y: val }));
                                        }}
                                        className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${inputBg}`}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setQuickPinCoords({ x: 50, y: 50 })}
                                        className="text-[10px] font-bold uppercase tracking-wider opacity-60 hover:opacity-100 hover:text-yellow-400 transition-colors flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-slate-500/20"
                                    >
                                        <Crosshair size={12} /> Center (50%, 50%)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-500/20">
                            <button
                                type="button"
                                onClick={() => { setQuickPinTarget(null); setQuickPinCoords(null); }}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase opacity-60 hover:opacity-100 transition-opacity"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!quickPinTarget || !quickPinCoords) return;
                                    setWorld(prev => ({
                                        ...prev,
                                        entities: prev.entities.map(ent =>
                                            ent.id === quickPinTarget.id
                                                ? { ...ent, coordinates: quickPinCoords }
                                                : ent
                                        )
                                    }));
                                    setQuickPinTarget(null);
                                    setQuickPinCoords(null);
                                }}
                                disabled={!quickPinCoords}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    isRoyal
                                        ? 'bg-[#70121e] text-[#fff8e7] hover:bg-[#881337] disabled:opacity-40 border border-[#c8a96e] shadow-md'
                                        : isWikiMode
                                        ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b] disabled:opacity-40'
                                        : 'bg-[#fef08a] text-black hover:bg-yellow-400 disabled:opacity-40 shadow-lg shadow-yellow-500/20'
                                }`}
                            >
                                Save Coordinates
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
