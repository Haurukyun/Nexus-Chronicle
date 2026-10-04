import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Eye,
  EyeOff,
  Crosshair,
  Info,
} from 'lucide-react';
import { WorldData, WorldEntity, EntityType } from '../types';
import { HIERARCHY_CONFIG, TYPE_LABELS } from '../constants';
import { useWorldStore } from '../store/useWorldStore';
import { useTheme } from '../theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GraphNode {
  id: string;
  name: string;
  type: EntityType;
  category: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphEdge {
  source: string;
  target: string;
  kind: EdgeKind;
}

type EdgeKind =
  | 'family'    // parent/child
  | 'ally'      // friend/ally
  | 'enemy'     // enemy
  | 'member'    // member of group
  | 'related'   // general / referenced
  | 'event'     // event involvement
  | 'location'; // location connection

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  story:  '#a78bfa', // violet
  world:  '#34d399', // emerald
  groups: '#f59e0b', // amber
  details:'#60a5fa', // blue
};

const EDGE_COLORS: Record<EdgeKind, string> = {
  family:   '#facc15',
  ally:     '#4ade80',
  enemy:    '#f87171',
  member:   '#fb923c',
  related:  '#94a3b8',
  event:    '#c084fc',
  location: '#38bdf8',
};

const EDGE_LABELS: Record<EdgeKind, string> = {
  family:   'Family',
  ally:     'Ally',
  enemy:    'Enemy',
  member:   'Member',
  related:  'Connected',
  event:    'Event',
  location: 'Location',
};

const NODE_RADIUS = 28;
const SIM_ALPHA_DECAY = 0.015;
const SIM_VELOCITY_DECAY = 0.4;

// ─── Edge extraction ──────────────────────────────────────────────────────────

function buildEdges(entities: WorldEntity[]): GraphEdge[] {
  const edgeSet = new Set<string>();
  const edges: GraphEdge[] = [];
  const entityIds = new Set(entities.map((e) => e.id));

  const addEdge = (src: string, tgt: string, kind: EdgeKind) => {
    if (!entityIds.has(src) || !entityIds.has(tgt) || src === tgt) return;
    const key = `${[src, tgt].sort().join('|')}|${kind}`;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    edges.push({ source: src, target: tgt, kind });
  };

  entities.forEach((e) => {
    const a = e as any;

    // Family
    (e.parentIds || []).forEach((pid: string) => addEdge(e.id, pid, 'family'));
    (a.parentsOfCharacter || []).forEach((pid: string) => addEdge(e.id, pid, 'family'));
    if (e.parentId) addEdge(e.id, e.parentId, 'family');
    (e.childrenIds || []).forEach((cid: string) => addEdge(e.id, cid, 'family'));
    (a.childOfCharacter || []).forEach((cid: string) => addEdge(e.id, cid, 'family'));

    // Allies / friends
    (e.friendIds || []).forEach((fid: string) => addEdge(e.id, fid, 'ally'));
    (a.allyResCharacter || []).forEach((fid: string) => addEdge(e.id, fid, 'ally'));

    // Enemies
    (e.enemyIds || []).forEach((eid: string) => addEdge(e.id, eid, 'enemy'));
    (a.enemydResCharacter || []).forEach((eid: string) => addEdge(e.id, eid, 'enemy'));

    // Relatives / complicated
    (e.relativeIds || []).forEach((rid: string) => addEdge(e.id, rid, 'family'));
    (a.relativesOfCharacter || []).forEach((rid: string) => addEdge(e.id, rid, 'family'));
    (e.complicatedWithIds || []).forEach((rid: string) => addEdge(e.id, rid, 'ally'));

    // Member-of group arrays (characters)
    const memberArrays = [
      a.pairedBelongingPolGroup, a.pairedBelongingOtherGroups,
      a.pairedBelongingRelGroup, a.pairedBelongingMagicGroup,
      a.pairedBelongingTechGroup,
    ];
    memberArrays.forEach((arr: string[] | undefined) =>
      (arr || []).forEach((gid: string) => addEdge(e.id, gid, 'member'))
    );

    // Leading figure
    const leadingArrays = [
      a.leadingPoliticalLeaders, a.leadingOtherLeaders,
      a.leadingReligiousLeaders, a.leadingMagicalLeaders, a.leadingTechLeaders,
    ];
    leadingArrays.forEach((arr: string[] | undefined) =>
      (arr || []).forEach((gid: string) => addEdge(e.id, gid, 'member'))
    );

    // Ally group
    const allyGroupArrays = [
      a.pairedAllyPolGroup, a.pairedAllyOtherGroups,
      a.pairedAllyRelGroup, a.pairedAllyMagicGroup, a.pairedAllyTechGroup,
    ];
    allyGroupArrays.forEach((arr: string[] | undefined) =>
      (arr || []).forEach((gid: string) => addEdge(e.id, gid, 'ally'))
    );

    // Enemy group
    const enemyGroupArrays = [
      a.pairedEnemyPolGroup, a.pairedEnemyOtherGroups,
      a.pairedEnemyRelGroup, a.pairedEnemyMagicGroup, a.pairedEnemyTechGroup,
    ];
    enemyGroupArrays.forEach((arr: string[] | undefined) =>
      (arr || []).forEach((gid: string) => addEdge(e.id, gid, 'enemy'))
    );

    // Events
    (a.pairedEvent || a.pairedEvents || e.eventIds || []).forEach((evid: string) =>
      addEdge(e.id, evid, 'event')
    );
    (a.involvedEntityIds || a.pairedCharacter || []).forEach((chid: string) =>
      addEdge(e.id, chid, 'event')
    );

    // Locations
    (e.locationIds || a.pairedConnectedPlaces || a.pairedLocations || []).forEach((lid: string) =>
      addEdge(e.id, lid, 'location')
    );
    if (a.locationId && entityIds.has(a.locationId)) addEdge(e.id, a.locationId, 'location');

    // Race / species
    (a.pairedRace || e.detailItemIds || []).forEach((rid: string) => addEdge(e.id, rid, 'member'));

    // General related
    (e.loreNoteIds || a.pairedConnectedNotes || []).forEach((nid: string) => addEdge(e.id, nid, 'related'));
    (e.mythIds || a.pairedConnectedMyths || a.pairedMyths || []).forEach((mid: string) =>
      addEdge(e.id, mid, 'related')
    );
    (e.cultureIds || a.relatedCultures || []).forEach((cid: string) => addEdge(e.id, cid, 'related'));

    // groupConnections deep scan
    if (e.groupConnections && typeof e.groupConnections === 'object') {
      Object.entries(e.groupConnections).forEach(([, roles]) => {
        if (!roles || typeof roles !== 'object') return;
        Object.entries(roles as any).forEach(([role, ids]) => {
          if (!Array.isArray(ids)) return;
          (ids as string[]).forEach((tid) => {
            const kind: EdgeKind =
              role === 'allyOf' ? 'ally'
              : role === 'enemyOf' ? 'enemy'
              : role === 'memberOf' || role === 'leadingFigureOf' ? 'member'
              : 'related';
            addEdge(e.id, tid, kind);
          });
        });
      });
    }
  });

  return edges;
}

// ─── Force simulation (pure JS, no d3) ───────────────────────────────────────

function initNodes(entities: WorldEntity[], w: number, h: number): GraphNode[] {
  return entities.map((e, i) => {
    const angle = (i / entities.length) * 2 * Math.PI;
    const r = Math.min(w, h) * 0.35;
    const cat = HIERARCHY_CONFIG.find((c) => c.types.includes(e.type))?.id ?? 'details';
    return {
      id: e.id,
      name: e.name,
      type: e.type,
      category: cat,
      x: w / 2 + r * Math.cos(angle),
      y: h / 2 + r * Math.sin(angle),
      vx: 0,
      vy: 0,
      fx: null,
      fy: null,
    };
  });
}

function tickForces(
  nodes: GraphNode[],
  edges: GraphEdge[],
  w: number,
  h: number,
  alpha: number
): void {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Link force
  const linkStrength = 0.3;
  const targetDist = 180;
  edges.forEach(({ source, target }) => {
    const s = nodeMap.get(source);
    const t = nodeMap.get(target);
    if (!s || !t) return;
    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const force = ((dist - targetDist) / dist) * linkStrength * alpha;
    if (!s.fx) { s.vx += dx * force; s.vy += dy * force; }
    if (!t.fx) { t.vx -= dx * force; t.vy -= dy * force; }
  });

  // Repulsion
  const repulse = 4500;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      const distSq = dx * dx + dy * dy || 1;
      const dist = Math.sqrt(distSq);
      const force = (repulse * alpha) / distSq;
      dx /= dist; dy /= dist;
      if (!a.fx) { a.vx -= dx * force; a.vy -= dy * force; }
      if (!b.fx) { b.vx += dx * force; b.vy += dy * force; }
    }
  }

  // Center gravity
  const cx = w / 2, cy = h / 2;
  const grav = 0.04 * alpha;
  nodes.forEach((n) => {
    if (!n.fx) n.vx += (cx - n.x) * grav;
    if (!n.fy) n.vy += (cy - n.y) * grav;
  });

  // Integrate
  nodes.forEach((n) => {
    if (n.fx != null) { n.x = n.fx; n.vy = 0; n.vx = 0; return; }
    if (n.fy != null) { n.y = n.fy; }
    n.vx *= 1 - SIM_VELOCITY_DECAY;
    n.vy *= 1 - SIM_VELOCITY_DECAY;
    n.x += n.vx;
    n.y += n.vy;
  });
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  world: WorldData;
  isWikiMode?: boolean;
  onNavigate: (id: string) => void;
}

type ActiveFilters = Set<string>; // category ids

export const NexusGraphView: React.FC<Props> = ({ world, isWikiMode: propWiki, onNavigate }) => {
  const { isWikiMode: themeWiki, isRoyal } = useTheme();
  const isWikiMode = propWiki !== undefined ? propWiki : themeWiki;
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const alphaRef = useRef(1);
  const rafRef = useRef<number>(0);
  const [, forceRender] = useState(0);

  // Camera state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  // Drag node state
  const draggingNode = useRef<GraphNode | null>(null);

  // Hover / selected
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filter state
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(
    new Set(HIERARCHY_CONFIG.map((c) => c.id))
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [edgeKindFilters, setEdgeKindFilters] = useState<Set<EdgeKind>>(
    new Set<EdgeKind>(['family', 'ally', 'enemy', 'member', 'related', 'event', 'location'])
  );

  const [showLegend, setShowLegend] = useState(true);
  const [dims, setDims] = useState({ w: 1200, h: 700 });

  // Measure container
  useEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      setDims({ w: width, h: height });
    };
    measure();
    const obs = new ResizeObserver(measure);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Build graph data
  const { nodes: initialNodes, edges } = useMemo(() => {
    const visEntities = world.entities.filter((e) => {
      const cat = HIERARCHY_CONFIG.find((c) => c.types.includes(e.type))?.id;
      return cat && activeFilters.has(cat);
    });
    const edges = buildEdges(visEntities).filter((e) => edgeKindFilters.has(e.kind));
    return { nodes: visEntities, edges };
  }, [world.entities, activeFilters, edgeKindFilters]);

  // Init / reset simulation when entities change
  useEffect(() => {
    nodesRef.current = initNodes(initialNodes, dims.w, dims.h);
    edgesRef.current = edges;
    alphaRef.current = 1;
  }, [initialNodes, edges, dims]);

  // Animation loop
  useEffect(() => {
    const tick = () => {
      if (alphaRef.current > 0.001) {
        tickForces(nodesRef.current, edgesRef.current, dims.w, dims.h, alphaRef.current);
        alphaRef.current *= 1 - SIM_ALPHA_DECAY;
        forceRender((n) => n + 1);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dims]);

  // ─── Pointer / wheel ──────────────────────────────────────────────────────

  const svgToWorld = useCallback(
    (sx: number, sy: number) => ({
      x: (sx - pan.x) / zoom,
      y: (sy - pan.y) / zoom,
    }),
    [pan, zoom]
  );

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setZoom((z) => Math.max(0.15, Math.min(4, z + delta * z)));
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      // Check if we hit a node
      const rect = svgRef.current!.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const { x, y } = svgToWorld(sx, sy);
      const hit = nodesRef.current.find((n) => {
        const dx = n.x - x, dy = n.y - y;
        return Math.sqrt(dx * dx + dy * dy) < NODE_RADIUS;
      });
      if (hit) {
        draggingNode.current = hit;
        hit.fx = hit.x;
        hit.fy = hit.y;
        alphaRef.current = Math.max(alphaRef.current, 0.3);
        (e.currentTarget as unknown as Element).setPointerCapture(e.pointerId);
        return;
      }
      // Pan
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY, ox: pan.x, oy: pan.y };
      (e.currentTarget as unknown as Element).setPointerCapture(e.pointerId);
    },
    [pan, svgToWorld]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (draggingNode.current) {
        const rect = svgRef.current!.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const { x, y } = svgToWorld(sx, sy);
        draggingNode.current.fx = x;
        draggingNode.current.fy = y;
        draggingNode.current.x = x;
        draggingNode.current.y = y;
        alphaRef.current = Math.max(alphaRef.current, 0.1);
        return;
      }
      if (isPanning.current) {
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        setPan({ x: panStart.current.ox + dx, y: panStart.current.oy + dy });
      }
    },
    [svgToWorld]
  );

  const onPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingNode.current) {
      draggingNode.current.fx = null;
      draggingNode.current.fy = null;
      draggingNode.current = null;
    }
    isPanning.current = false;
    (e.currentTarget as unknown as Element).releasePointerCapture(e.pointerId);
  }, []);

  const onNodeClick = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      if (selectedId === nodeId) {
        onNavigate(nodeId);
      } else {
        setSelectedId(nodeId);
      }
    },
    [selectedId, onNavigate]
  );

  // ─── Derived for rendering ────────────────────────────────────────────────

  const highlightedEdgeIds = useMemo(() => {
    if (!hoveredId && !selectedId) return new Set<string>();
    const focusId = selectedId || hoveredId;
    return new Set(
      edgesRef.current
        .filter((e) => e.source === focusId || e.target === focusId)
        .map((e) => `${e.source}|${e.target}|${e.kind}`)
    );
  }, [hoveredId, selectedId]);

  const highlightedNodeIds = useMemo(() => {
    const focusId = selectedId || hoveredId;
    if (!focusId) return new Set<string>();
    const s = new Set([focusId]);
    edgesRef.current.forEach((e) => {
      if (e.source === focusId) s.add(e.target);
      if (e.target === focusId) s.add(e.source);
    });
    return s;
  }, [hoveredId, selectedId]);

  const focusId = selectedId || hoveredId;
  const hasFocus = Boolean(focusId);

  const resetCamera = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const nodes = nodesRef.current;
  const edgeList = edgesRef.current;

  const wikiText = isRoyal ? 'text-[#3d0a10]' : isWikiMode ? 'text-[#3d2b1f]' : 'text-white';
  const wikiPanel = isRoyal
    ? 'bg-[#f5ead0] border-[#c8a96e]/50 text-[#3d0a10]'
    : isWikiMode
    ? 'bg-[#f5f0e8] border-[#d4c8af] text-[#3d2b1f]'
    : 'bg-slate-900/90 border-slate-700/60 text-white';
  const accentColor = isRoyal ? '#70121e' : isWikiMode ? '#b91c1c' : '#fef08a';

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none">

      {/* ── SVG Canvas ─────────────────────────────────────────────────────── */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={() => setSelectedId(null)}
      >
        <defs>
          {/* Glow filters per category */}
          {HIERARCHY_CONFIG.map((cat) => (
            <filter key={cat.id} id={`glow-${cat.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <filter id="glow-selected" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Arrowhead markers per edge kind */}
          {(Object.keys(EDGE_COLORS) as EdgeKind[]).map((kind) => (
            <marker
              key={kind}
              id={`arrow-${kind}`}
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 7 3.5, 0 7" fill={EDGE_COLORS[kind]} opacity="0.6" />
            </marker>
          ))}
        </defs>

        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {/* ── Edges ─────────────────────────────────────────────────────── */}
          <g>
            {edgeList.map((edge, i) => {
              const s = nodes.find((n) => n.id === edge.source);
              const t = nodes.find((n) => n.id === edge.target);
              if (!s || !t) return null;
              const key = `${edge.source}|${edge.target}|${edge.kind}`;
              const isHighlighted = highlightedEdgeIds.has(key);
              const isDimmed = hasFocus && !isHighlighted;
              const color = EDGE_COLORS[edge.kind];

              // Offset so multiple edges don't fully overlap
              const dx = t.x - s.x;
              const dy = t.y - s.y;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              const mx = (s.x + t.x) / 2 - (dy / len) * 20;
              const my = (s.y + t.y) / 2 + (dx / len) * 20;

              return (
                <path
                  key={`${key}-${i}`}
                  d={`M${s.x},${s.y} Q${mx},${my} ${t.x},${t.y}`}
                  stroke={color}
                  strokeWidth={isHighlighted ? 2.5 : 1}
                  strokeOpacity={isDimmed ? 0.06 : isHighlighted ? 0.9 : 0.3}
                  fill="none"
                  markerEnd={isHighlighted ? `url(#arrow-${edge.kind})` : undefined}
                  style={{ transition: 'stroke-opacity 0.2s' }}
                />
              );
            })}
          </g>

          {/* ── Nodes ─────────────────────────────────────────────────────── */}
          <g>
            {nodes.map((node) => {
              const color = CATEGORY_COLORS[node.category] ?? '#94a3b8';
              const isSelected = node.id === selectedId;
              const isHovered = node.id === hoveredId;
              const isDimmed = hasFocus && !highlightedNodeIds.has(node.id);
              const isFocused = highlightedNodeIds.has(node.id);
              const r = isSelected ? NODE_RADIUS + 6 : NODE_RADIUS;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y})`}
                  style={{ cursor: 'pointer', opacity: isDimmed ? 0.15 : 1, transition: 'opacity 0.2s' }}
                  onPointerEnter={() => setHoveredId(node.id)}
                  onPointerLeave={() => setHoveredId(null)}
                  onClick={(e) => onNodeClick(e, node.id)}
                >
                  {/* Outer glow ring for selected */}
                  {isSelected && (
                    <circle
                      r={r + 8}
                      fill="none"
                      stroke={accentColor}
                      strokeWidth={2}
                      strokeOpacity={0.5}
                      filter="url(#glow-selected)"
                    />
                  )}

                  {/* Pulse ring for focused neighbour */}
                  {isFocused && !isSelected && (
                    <circle
                      r={r + 4}
                      fill="none"
                      stroke={color}
                      strokeWidth={1.5}
                      strokeOpacity={0.4}
                    />
                  )}

                  {/* Main circle */}
                  <circle
                    r={r}
                    fill={color}
                    fillOpacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.6}
                    stroke={isSelected ? accentColor : color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    filter={isSelected ? `url(#glow-selected)` : `url(#glow-${node.category})`}
                  />

                  {/* Category letter in node */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={11}
                    fontWeight="900"
                    fill={isWikiMode ? '#1e1b18' : '#fff'}
                    fillOpacity={0.85}
                    style={{ pointerEvents: 'none', fontFamily: 'sans-serif', letterSpacing: '0.05em' }}
                  >
                    {TYPE_LABELS[node.type]?.charAt(0) ?? '?'}
                  </text>

                  {/* Name label below */}
                  <text
                    y={r + 12}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={isSelected || isHovered ? '700' : '500'}
                    fill={isWikiMode ? '#3d2b1f' : '#e2e8f0'}
                    fillOpacity={isSelected || isHovered ? 1 : 0.75}
                    style={{
                      pointerEvents: 'none',
                      fontFamily: 'sans-serif',
                      textShadow: isWikiMode ? 'none' : '0 1px 4px rgba(0,0,0,0.8)',
                    }}
                  >
                    {node.name.length > 16 ? node.name.slice(0, 14) + '…' : node.name}
                  </text>

                  {/* Type badge on hover/select */}
                  {(isHovered || isSelected) && (
                    <text
                      y={r + 24}
                      textAnchor="middle"
                      fontSize={8}
                      fill={color}
                      fillOpacity={0.9}
                      style={{ pointerEvents: 'none', fontFamily: 'sans-serif' }}
                    >
                      {TYPE_LABELS[node.type]}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <Network size={80} className="opacity-10 mb-6" />
          <p className={`text-xl font-serif uppercase tracking-widest opacity-20 ${wikiText}`}>
            No entities to graph
          </p>
          <p className={`text-xs opacity-10 mt-2 ${wikiText}`}>
            Create some entries or enable filters above
          </p>
        </div>
      )}

      {/* ── Top-left: title ─────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <h1
          className={`text-5xl font-serif font-black uppercase tracking-tighter ${isRoyal ? 'text-[#3d0a10]' : isWikiMode ? 'text-[#b91c1c]' : 'text-white'}`}
        >
          The Nexus
        </h1>
        <p className="text-[10px] uppercase tracking-[0.35em] opacity-40 ml-1 mt-0.5 italic">
          Interactive Relationship Graph
        </p>
        {nodes.length > 0 && (
          <p className={`text-[10px] opacity-30 ml-1 mt-1 ${wikiText}`}>
            {nodes.length} nodes · {edgeList.length} connections
          </p>
        )}
      </div>

      {/* ── Top-right: controls ─────────────────────────────────────────────── */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* Filter panel toggle */}
        <button
          onClick={() => setFilterOpen((o) => !o)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${wikiPanel} ${filterOpen ? (isRoyal ? 'ring-2 ring-[#70121e]' : isWikiMode ? 'ring-2 ring-[#b91c1c]' : 'ring-2 ring-yellow-400/50') : ''}`}
        >
          <Filter size={13} />
          Filters
        </button>

        {/* Zoom controls */}
        <div className={`flex flex-col rounded-xl border overflow-hidden ${wikiPanel}`}>
          <button
            className="p-2 hover:bg-white/10 transition-colors"
            onClick={() => setZoom((z) => Math.min(4, z * 1.25))}
          >
            <ZoomIn size={14} />
          </button>
          <div className={`h-px ${isRoyal ? 'bg-[#c8a96e]/50' : isWikiMode ? 'bg-[#d4c8af]' : 'bg-slate-700'}`} />
          <button
            className="p-2 hover:bg-white/10 transition-colors"
            onClick={() => setZoom((z) => Math.max(0.15, z * 0.8))}
          >
            <ZoomOut size={14} />
          </button>
        </div>

        {/* Reset camera */}
        <button
          className={`p-2 rounded-xl border transition-all ${wikiPanel} hover:bg-white/10`}
          onClick={resetCamera}
          title="Reset camera"
        >
          <Maximize2 size={14} />
        </button>

        {/* Re-center on selected node */}
        {selectedId && (
          <button
            className={`p-2 rounded-xl border transition-all ${wikiPanel} hover:bg-white/10`}
            onClick={() => {
              const n = nodesRef.current.find((n) => n.id === selectedId);
              if (!n) return;
              setPan({ x: dims.w / 2 - n.x * zoom, y: dims.h / 2 - n.y * zoom });
            }}
            title="Center on selected"
          >
            <Crosshair size={14} />
          </button>
        )}

        {/* Legend toggle */}
        <button
          className={`p-2 rounded-xl border transition-all ${wikiPanel} hover:bg-white/10`}
          onClick={() => setShowLegend((v) => !v)}
          title="Toggle legend"
        >
          {showLegend ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      {/* ── Filter panel ────────────────────────────────────────────────────── */}
      {filterOpen && (
        <div
          className={`absolute top-16 right-4 w-64 rounded-2xl border p-4 shadow-2xl flex flex-col gap-3 z-30 ${wikiPanel}`}
        >
          <p className="text-[10px] uppercase tracking-widest font-black opacity-60">
            Entity Categories
          </p>
          <div className="flex flex-col gap-1.5">
            {HIERARCHY_CONFIG.map((cat) => {
              const active = activeFilters.has(cat.id);
              const color = CATEGORY_COLORS[cat.id];
              return (
                <button
                  key={cat.id}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    active ? 'opacity-100' : 'opacity-40'
                  }`}
                  style={{ border: `1.5px solid ${color}40`, background: active ? `${color}18` : 'transparent' }}
                  onClick={() =>
                    setActiveFilters((prev) => {
                      const next = new Set(prev);
                      if (next.has(cat.id)) next.delete(cat.id);
                      else next.add(cat.id);
                      return next;
                    })
                  }
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className={`h-px ${isWikiMode ? 'bg-[#d4c8af]' : 'bg-slate-700'}`} />

          <p className="text-[10px] uppercase tracking-widest font-black opacity-60">
            Connection Types
          </p>
          <div className="flex flex-col gap-1">
            {(Object.keys(EDGE_COLORS) as EdgeKind[]).map((kind) => {
              const active = edgeKindFilters.has(kind);
              const color = EDGE_COLORS[kind];
              return (
                <button
                  key={kind}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    active ? 'opacity-100' : 'opacity-40'
                  }`}
                  style={{ border: `1.5px solid ${color}40`, background: active ? `${color}15` : 'transparent' }}
                  onClick={() =>
                    setEdgeKindFilters((prev) => {
                      const next = new Set(prev);
                      if (next.has(kind)) next.delete(kind);
                      else next.add(kind);
                      return next;
                    })
                  }
                >
                  <span
                    className="w-8 h-0.5 flex-shrink-0 rounded-full"
                    style={{ background: color }}
                  />
                  {EDGE_LABELS[kind]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Legend ──────────────────────────────────────────────────────────── */}
      {showLegend && (
        <div
          className={`absolute bottom-4 left-4 rounded-2xl border p-4 shadow-xl flex flex-col gap-2 z-20 ${wikiPanel}`}
          style={{ minWidth: 180 }}
        >
          <p className="text-[9px] uppercase tracking-widest font-black opacity-50">Legend</p>
          {HIERARCHY_CONFIG.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 text-[10px] font-semibold">
              <span
                className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/20"
                style={{ background: CATEGORY_COLORS[cat.id] }}
              />
              {cat.label}
            </div>
          ))}
          <div className={`h-px mt-1 ${isWikiMode ? 'bg-[#d4c8af]' : 'bg-slate-700'}`} />
          {(Object.keys(EDGE_COLORS) as EdgeKind[]).map((kind) => (
            <div key={kind} className="flex items-center gap-2 text-[10px]">
              <span
                className="w-5 h-0.5 rounded-full flex-shrink-0"
                style={{ background: EDGE_COLORS[kind] }}
              />
              <span className="opacity-70">{EDGE_LABELS[kind]}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Selected node info panel ─────────────────────────────────────────── */}
      {selectedId && (() => {
        const node = nodes.find((n) => n.id === selectedId);
        if (!node) return null;
        const connectedEdges = edgeList.filter(
          (e) => e.source === selectedId || e.target === selectedId
        );
        return (
          <div
            className={`absolute bottom-4 right-4 w-72 rounded-2xl border p-5 shadow-2xl z-30 ${wikiPanel}`}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p
                  className="text-xs font-black uppercase tracking-widest opacity-50 mb-0.5"
                  style={{ color: CATEGORY_COLORS[node.category] }}
                >
                  {TYPE_LABELS[node.type]}
                </p>
                <h3 className="text-base font-black leading-tight">{node.name}</h3>
              </div>
              <button
                className="opacity-40 hover:opacity-100 transition-opacity mt-0.5"
                onClick={() => setSelectedId(null)}
              >
                ✕
              </button>
            </div>

            {connectedEdges.length > 0 ? (
              <div className="space-y-1">
                <p className="text-[9px] uppercase tracking-widest opacity-50 font-bold mb-2">
                  {connectedEdges.length} connection{connectedEdges.length !== 1 ? 's' : ''}
                </p>
                {connectedEdges.slice(0, 8).map((edge, i) => {
                  const otherId = edge.source === selectedId ? edge.target : edge.source;
                  const other = nodes.find((n) => n.id === otherId);
                  if (!other) return null;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs opacity-80 hover:opacity-100 cursor-pointer"
                      onClick={() => setSelectedId(other.id)}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: EDGE_COLORS[edge.kind] }}
                      />
                      <span className="truncate font-medium">{other.name}</span>
                      <span className="opacity-40 text-[9px] ml-auto flex-shrink-0">
                        {EDGE_LABELS[edge.kind]}
                      </span>
                    </div>
                  );
                })}
                {connectedEdges.length > 8 && (
                  <p className="text-[9px] opacity-40 mt-1">
                    +{connectedEdges.length - 8} more connections
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs opacity-40 italic">No visible connections</p>
            )}

            <button
              className="mt-4 w-full py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              style={{
                background: `${CATEGORY_COLORS[node.category]}25`,
                border: `1px solid ${CATEGORY_COLORS[node.category]}50`,
                color: CATEGORY_COLORS[node.category],
              }}
              onClick={() => onNavigate(selectedId)}
            >
              <Info size={11} className="inline mr-1.5" />
              Open Entry
            </button>
          </div>
        );
      })()}

      {/* ── Zoom indicator ──────────────────────────────────────────────────── */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-widest opacity-30 pointer-events-none ${wikiText}`}
      >
        {Math.round(zoom * 100)}% · Scroll to zoom · Drag to pan · Click node to inspect · Double-click to open
      </div>
    </div>
  );
};
