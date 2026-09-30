import React, { useState, useMemo } from 'react';
import { 
    Compass, Wind, MapPin, Footprints, Clock, Scale, 
    Ship, Shield, Flame, Mountain, TreePine, AlertTriangle, 
    CheckCircle2, Edit3, ArrowRight, Backpack, Users, Sparkles
} from 'lucide-react';
import { WorldData, Location } from '../types';
import { useWorldStore } from '../store/useWorldStore';

interface JourneyViewProps {
    world: WorldData;
    isWikiMode: boolean;
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

export const JourneyView: React.FC<JourneyViewProps> = ({ world, isWikiMode, onNavigate }) => {
    const [startId, setStartId] = useState<string>('');
    const [endId, setEndId] = useState<string>('');
    const [travelMethod, setTravelMethod] = useState<TravelMethod>('foot');
    const [terrain, setTerrain] = useState<TerrainType>('highway');
    const [partySize, setPartySize] = useState<number>(4);
    
    // Manual override state
    const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
    const [manualDistanceInput, setManualDistanceInput] = useState<string>('');

    const theme = useWorldStore(state => state.theme);
    const isRoyal = theme === 'royal-codex';
    const mapImage = world.mapImage;

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

    const accent = isRoyal ? 'text-[#d4af37]' : isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
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
                    isRoyal ? 'text-[#f0ddb0]' : isWikiMode ? 'text-[#b91c1c]' : 'text-white'
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
                            <label className="text-[10px] font-black uppercase opacity-60 flex items-center justify-between">
                                <span>Origin Anchor</span>
                                {startLoc?.coordinates ? (
                                    <span className="text-[9px] text-emerald-400 font-mono">
                                        Pinned ({startLoc.coordinates.x}%, {startLoc.coordinates.y}%)
                                    </span>
                                ) : startLoc ? (
                                    <span className="text-[9px] text-amber-400 font-mono">Unanchored</span>
                                ) : null}
                            </label>
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
                            <label className="text-[10px] font-black uppercase opacity-60 flex items-center justify-between">
                                <span>Destination Anchor</span>
                                {endLoc?.coordinates ? (
                                    <span className="text-[9px] text-emerald-400 font-mono">
                                        Pinned ({endLoc.coordinates.x}%, {endLoc.coordinates.y}%)
                                    </span>
                                ) : endLoc ? (
                                    <span className="text-[9px] text-amber-400 font-mono">Unanchored</span>
                                ) : null}
                            </label>
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
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs space-y-1">
                                <p className="font-bold text-amber-300">Unanchored Route Detected</p>
                                <p className="opacity-75 leading-relaxed">
                                    {!startLoc.coordinates && !endLoc.coordinates 
                                        ? "Both selected locations lack Atlas map coordinates."
                                        : !startLoc.coordinates
                                        ? `Origin "${startLoc.name}" does not have map coordinates.`
                                        : `Destination "${endLoc.name}" does not have map coordinates.`
                                    } You can set coordinates in each Location's editor, or use the <strong>Manual Distance Override</strong> below.
                                </p>
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
                                                ? (isWikiMode 
                                                    ? 'bg-[#b91c1c] text-white border-transparent shadow-md' 
                                                    : 'bg-[#fef08a] text-black border-transparent shadow-lg shadow-yellow-500/20') 
                                                : 'hover:bg-white/5 opacity-60 border-slate-500/20'
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
        </div>
    );
};
