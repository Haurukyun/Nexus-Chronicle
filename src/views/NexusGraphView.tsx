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
  Users,
  StickyNote,
  Layers,
  Compass,
  Scan,
  Download,
} from 'lucide-react';
import { WorldData, WorldEntity, EntityType } from '../types';
import { HIERARCHY_CONFIG, TYPE_LABELS } from '../constants';
import { useWorldStore } from '../store/useWorldStore';
import { useTheme } from '../theme';
import { isEntityMinor } from '../utils/documentModeUtils';
import { exportSvg, exportPng } from '../utils/graphExport';

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
  location: '#2dd4bf',
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
  alpha: number,
  isClustered: boolean = false
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

  // Center gravity vs Category Cluster Centers
  if (isClustered) {
    const clusterCenters: Record<string, { cx: number; cy: number }> = {
      story:   { cx: w * 0.28, cy: h * 0.28 },
      world:   { cx: w * 0.72, cy: h * 0.28 },
      groups:  { cx: w * 0.28, cy: h * 0.72 },
      details: { cx: w * 0.72, cy: h * 0.72 },
    };
    const clusterStrength = 0.07 * alpha;
    nodes.forEach((n) => {
      const center = clusterCenters[n.category] || { cx: w / 2, cy: h / 2 };
      if (!n.fx) n.vx += (center.cx - n.x) * clusterStrength;
      if (!n.fy) n.vy += (center.cy - n.y) * clusterStrength;
    });
  } else {
    const cx = w / 2, cy = h / 2;
    const grav = 0.04 * alpha;
    nodes.forEach((n) => {
      if (!n.fx) n.vx += (cx - n.x) * grav;
      if (!n.fy) n.vy += (cy - n.y) * grav;
    });
  }

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
  onNavigate: (id: string) => void;
}

type ActiveFilters = Set<string>; // category ids

// ─── Hover card position ──────────────────────────────────────────────────────
interface HoverCardPos { svgX: number; svgY: number; }

export const NexusGraphView: React.FC<Props> = ({ world, onNavigate }) => {
  const { themeId, layoutMode } = useTheme();
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
  const [hoveredPos, setHoveredPos] = useState<HoverCardPos | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filter state
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(
    new Set(HIERARCHY_CONFIG.map((c) => c.id))
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [edgeKindFilters, setEdgeKindFilters] = useState<Set<EdgeKind>>(
    new Set<EdgeKind>(['family', 'ally', 'enemy', 'member', 'related', 'event', 'location'])
  );
  const [suppressMinor, setSuppressMinor] = useState(false);

  const [showLegend, setShowLegend] = useState(true);
  const [dims, setDims] = useState({ w: 1200, h: 700 });
  const [isClustered, setIsClustered] = useState(false);
  const [isolateNeighbors, setIsolateNeighbors] = useState(false);
  const isClusteredRef = useRef(isClustered);

  useEffect(() => {
    isClusteredRef.current = isClustered;
    alphaRef.current = Math.max(alphaRef.current, 0.7);
  }, [isClustered]);

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
      if (!cat || !activeFilters.has(cat)) return false;
      if (suppressMinor && isEntityMinor(e)) return false;
      return true;
    });
    const edges = buildEdges(visEntities).filter((e) => edgeKindFilters.has(e.kind));
    return { nodes: visEntities, edges };
  }, [world.entities, activeFilters, edgeKindFilters, suppressMinor]);

  // Entity lookup map for relational notes
  const entityMap = useMemo(() => {
    const map = new Map<string, WorldEntity>();
    world.entities.forEach(e => map.set(e.id, e));
    return map;
  }, [world.entities]);

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
        tickForces(nodesRef.current, edgesRef.current, dims.w, dims.h, alphaRef.current, isClusteredRef.current);
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

  const zoomToFit = () => {
    const nodes = nodesRef.current;
    if (nodes.length === 0) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });
    const padding = 120;
    const graphW = maxX - minX + padding * 2;
    const graphH = maxY - minY + padding * 2;
    const targetZoom = Math.max(0.18, Math.min(2.0, Math.min(dims.w / graphW, dims.h / graphH)));
    const graphCenterX = (minX + maxX) / 2;
    const graphCenterY = (minY + maxY) / 2;
    setZoom(targetZoom);
    setPan({
      x: dims.w / 2 - graphCenterX * targetZoom,
      y: dims.h / 2 - graphCenterY * targetZoom,
    });
  };

  const nodes = nodesRef.current;
  const edgeList = edgesRef.current;

  const isRoyal = themeId === 'royal-codex';
  const isWiki = layoutMode === 'wiki';
  const isLight = isRoyal || isWiki;

  const wikiText = isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#3d2b1f]' : 'text-white';
  const wikiPanel = isRoyal
    ? 'bg-[#f5ead0] border-[#c8a96e]/60 text-[#2b1810]'
    : isWiki
    ? 'bg-[#f5f0e8] border-[#d4c8af] text-[#2b1810]'
    : 'bg-slate-900/90 border-slate-700/60 text-white';
  const accentColor = isRoyal ? '#70121e' : isWiki ? '#b91c1c' : '#fef08a';

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
          {/* ── Category Cluster Background Halos ─────────────────────────── */}
          {isClustered && (
            <g className="pointer-events-none select-none">
              {[
                { label: 'Story & Lore', color: CATEGORY_COLORS.story, x: dims.w * 0.28, y: dims.h * 0.28 },
                { label: 'World & Inhabitants', color: CATEGORY_COLORS.world, x: dims.w * 0.72, y: dims.h * 0.28 },
                { label: 'Orders & Circles', color: CATEGORY_COLORS.groups, x: dims.w * 0.28, y: dims.h * 0.72 },
                { label: 'Details & Arcana', color: CATEGORY_COLORS.details, x: dims.w * 0.72, y: dims.h * 0.72 },
              ].map((c) => (
                <g key={c.label} transform={`translate(${c.x},${c.y})`}>
                  <circle r={160} fill={c.color} fillOpacity={0.03} stroke={c.color} strokeWidth={1} strokeDasharray="6 6" strokeOpacity={0.25} />
                  <text
                    textAnchor="middle"
                    y={-125}
                    fontSize={11}
                    fontWeight="bold"
                    letterSpacing="0.25em"
                    fill={c.color}
                    fillOpacity={0.4}
                    fontFamily="serif"
                    style={{ textTransform: 'uppercase' }}
                  >
                    ✦ {c.label} ✦
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* ── Edges ─────────────────────────────────────────────────────── */}
          <g>
            {edgeList.map((edge, i) => {
              const s = nodes.find((n) => n.id === edge.source);
              const t = nodes.find((n) => n.id === edge.target);
              if (!s || !t) return null;
              const key = `${edge.source}|${edge.target}|${edge.kind}`;
              const isHighlighted = highlightedEdgeIds.has(key);
              const isDimmed = hasFocus && !isHighlighted;
              const isEdgeHidden = isolateNeighbors && hasFocus && isDimmed;
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
                  strokeOpacity={isEdgeHidden ? 0 : isDimmed ? 0.06 : isHighlighted ? 0.9 : 0.3}
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
              const isNodeHidden = isolateNeighbors && hasFocus && isDimmed;
              const isFocused = highlightedNodeIds.has(node.id);
              const r = isSelected ? NODE_RADIUS + 6 : NODE_RADIUS;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y})`}
                  style={{ cursor: isNodeHidden ? 'default' : 'pointer', opacity: isNodeHidden ? 0.02 : isDimmed ? 0.15 : 1, pointerEvents: isNodeHidden ? 'none' : 'auto', transition: 'opacity 0.2s' }}
                  onPointerEnter={() => {
                    setHoveredId(node.id);
                    setHoveredPos({ svgX: node.x * zoom + pan.x, svgY: node.y * zoom + pan.y });
                  }}
                  onPointerLeave={() => { setHoveredId(null); setHoveredPos(null); }}
                  onClick={(e) => onNodeClick(e, node.id)}
                  onDoubleClick={(e) => { e.stopPropagation(); onNavigate(node.id); }}
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
                    fillOpacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.65}
                    stroke={isSelected ? accentColor : (isLight ? '#5a3825' : color)}
                    strokeWidth={isSelected ? 3 : 1.8}
                    filter={isSelected ? `url(#glow-selected)` : `url(#glow-${node.category})`}
                  />

                  {/* Category letter in node */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={11}
                    fontWeight="900"
                    fill={isLight ? '#1a1008' : '#ffffff'}
                    fillOpacity={1}
                    style={{ pointerEvents: 'none', fontFamily: 'sans-serif' }}
                  >
                    {TYPE_LABELS[node.type]?.[0] || '?'}
                  </text>

                  {/* Label below node */}
                  <text
                    y={r + 14}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={isSelected ? 'bold' : '600'}
                    fill={isLight ? '#2b1810' : (isHovered || isSelected ? '#f8fafc' : '#cbd5e1')}
                    style={{
                      pointerEvents: 'none',
                      fontFamily: 'serif',
                      textShadow: isLight
                        ? '0 0 3px #ffffff, 0 0 6px #ffffff, 0 1px 2px #fff9ed'
                        : '0 1px 4px rgba(0,0,0,0.8)',
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

          {/* ── Mid-edge relational note labels on highlighted edges ──────────── */}
          <g style={{ pointerEvents: 'none' }}>
            {edgeList.map((edge, i) => {
              const key = `${edge.source}|${edge.target}|${edge.kind}`;
              if (!highlightedEdgeIds.has(key)) return null;
              const s = nodes.find(n => n.id === edge.source);
              const t = nodes.find(n => n.id === edge.target);
              if (!s || !t) return null;

              // Find relational note from either endpoint
              const srcEntity = entityMap.get(edge.source) as any;
              const tgtEntity = entityMap.get(edge.target) as any;
              const noteKey1 = Object.keys(srcEntity?.relationalNotes || {}).find(k => k.endsWith(`:${edge.target}`));
              const noteKey2 = Object.keys(tgtEntity?.relationalNotes || {}).find(k => k.endsWith(`:${edge.source}`));
              const note = noteKey1 ? srcEntity.relationalNotes[noteKey1] : noteKey2 ? tgtEntity.relationalNotes[noteKey2] : null;
              if (!note) return null;

              // Midpoint on the quadratic bezier
              const dx = t.x - s.x, dy = t.y - s.y;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              const mx = (s.x + t.x) / 2 - (dy / len) * 20;
              const my = (s.y + t.y) / 2 + (dx / len) * 20;
              const color = EDGE_COLORS[edge.kind];
              const label = note.length > 30 ? note.slice(0, 28) + '…' : note;
              const approxW = label.length * 5.4 + 12;

              return (
                <g key={`rnote-${key}-${i}`} transform={`translate(${mx},${my})`}>
                  <rect
                    x={-approxW / 2}
                    y={-10}
                    width={approxW}
                    height={18}
                    rx={5}
                    fill={`${color}22`}
                    stroke={`${color}55`}
                    strokeWidth={0.8}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    y={-1}
                    fontSize={8}
                    fill={color}
                    fillOpacity={0.9}
                    style={{ fontFamily: 'sans-serif', fontStyle: 'italic' }}
                  >
                    {label}
                  </text>
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

      {/* ── Hover card (floating near hovered node) ──────────────────────────── */}
      {hoveredId && hoveredPos && !selectedId && (() => {
        const node = nodes.find(n => n.id === hoveredId);
        if (!node) return null;
        const entity = entityMap.get(hoveredId) as any;
        const description: string | undefined = entity?.description;

        // Connections with relational notes
        const connEdges = edgeList.filter(e => e.source === hoveredId || e.target === hoveredId);
        const connections = connEdges.slice(0, 5).map(edge => {
          const otherId = edge.source === hoveredId ? edge.target : edge.source;
          const other = nodes.find(n => n.id === otherId);
          const srcEnt = entityMap.get(edge.source) as any;
          const tgtEnt = entityMap.get(edge.target) as any;
          const noteKey1 = Object.keys(srcEnt?.relationalNotes || {}).find(k => k.endsWith(`:${edge.target}`));
          const noteKey2 = Object.keys(tgtEnt?.relationalNotes || {}).find(k => k.endsWith(`:${edge.source}`));
          const note = noteKey1 ? srcEnt.relationalNotes[noteKey1] : noteKey2 ? tgtEnt.relationalNotes[noteKey2] : null;
          return { otherId, other, edge, note };
        }).filter(c => c.other);

        if (!description && connections.length === 0) return null;

        const cardW = 260;
        const containerWidth = containerRef.current?.clientWidth ?? 1200;
        const containerHeight = containerRef.current?.clientHeight ?? 700;
        let left = hoveredPos.svgX + NODE_RADIUS * zoom + 14;
        let top = hoveredPos.svgY - 80;
        if (left + cardW > containerWidth - 8) left = hoveredPos.svgX - cardW - NODE_RADIUS * zoom - 14;
        if (top < 8) top = 8;
        if (top + 220 > containerHeight - 8) top = containerHeight - 228;

        return (
          <div
            className={`absolute pointer-events-none z-50 rounded-2xl border shadow-2xl p-4 flex flex-col gap-2 text-xs ${wikiPanel}`}
            style={{ left, top, width: cardW }}
          >
            {/* Node header */}
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: CATEGORY_COLORS[node.category] ?? '#94a3b8' }}
              />
              <span className="font-black text-sm truncate flex-1">{node.name}</span>
              <span className="text-[9px] opacity-50 uppercase tracking-wider flex-shrink-0">{TYPE_LABELS[node.type]}</span>
            </div>

            {/* Description snippet */}
            {description && (
              <p className="opacity-70 text-[10px] leading-relaxed border-t border-current/10 pt-1.5 line-clamp-3">
                {description.length > 130 ? description.slice(0, 128) + '…' : description}
              </p>
            )}

            {/* Connections with relational notes */}
            {connections.length > 0 && (
              <div className="border-t border-current/10 pt-1.5 space-y-1.5">
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-45 flex items-center gap-1">
                  <StickyNote size={9} /> {connEdges.length} Connection{connEdges.length !== 1 ? 's' : ''}
                </p>
                {connections.map(({ otherId, other, edge, note }) => (
                  <div key={otherId} className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: EDGE_COLORS[edge.kind] }}
                      />
                      <span className="font-semibold truncate flex-1">{other!.name}</span>
                      <span
                        className="text-[9px] opacity-50 flex-shrink-0 px-1.5 py-0.5 rounded"
                        style={{ background: `${EDGE_COLORS[edge.kind]}20`, color: EDGE_COLORS[edge.kind] }}
                      >
                        {EDGE_LABELS[edge.kind]}
                      </span>
                    </div>
                    {note && (
                      <p className="text-[9px] opacity-60 italic pl-3 leading-tight">
                        "{note.length > 65 ? note.slice(0, 63) + '…' : note}"
                      </p>
                    )}
                  </div>
                ))}
                {connEdges.length > 5 && (
                  <p className="text-[9px] opacity-35 pl-3">+{connEdges.length - 5} more…</p>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Top-left: title ─────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <h1
          className={`text-4xl sm:text-5xl font-serif font-black uppercase tracking-tighter ${isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#b91c1c]' : 'text-white'}`}
        >
          The Nexus
        </h1>
        <p className={`text-[10px] uppercase tracking-[0.35em] ml-1 mt-0.5 italic font-bold ${isLight ? 'text-[#70121e]' : 'opacity-40'}`}>
          Interactive Relationship Graph
        </p>
        {nodes.length > 0 && (
          <p className={`text-[10px] ml-1 mt-1 font-bold ${isLight ? 'text-[#2b1810]' : 'opacity-40 text-slate-400'}`}>
            {nodes.length} nodes · {edgeList.length} connections
          </p>
        )}
      </div>

      {/* ── Top-right: controls ─────────────────────────────────────────────── */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-20">
        {/* Filter panel toggle */}
        <button
          onClick={() => setFilterOpen((o) => !o)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${wikiPanel} ${
            filterOpen 
              ? (isRoyal ? 'ring-2 ring-[#70121e] bg-[#70121e] text-[#fff8e7] border-[#c8a96e]' : isWiki ? 'ring-2 ring-[#b91c1c] bg-[#b91c1c] text-white' : 'ring-2 ring-yellow-400/50 bg-yellow-400/20 text-yellow-300') 
              : isLight ? 'hover:bg-[#ede0c9] text-[#2b1810]' : 'hover:bg-white/10'
          }`}
        >
          <Filter size={13} className={isLight && !filterOpen ? 'text-[#70121e]' : ''} />
          <span>Filters</span>
        </button>

        {/* Zoom In */}
        <button
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${wikiPanel} ${
            isLight ? 'hover:bg-[#ede0c9] text-[#2b1810]' : 'hover:bg-white/10'
          }`}
          onClick={() => setZoom((z) => Math.min(4, z * 1.25))}
          title="Zoom In"
        >
          <ZoomIn size={13} className={isLight ? 'text-[#70121e]' : ''} />
          <span>Zoom In</span>
        </button>

        {/* Zoom Out */}
        <button
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${wikiPanel} ${
            isLight ? 'hover:bg-[#ede0c9] text-[#2b1810]' : 'hover:bg-white/10'
          }`}
          onClick={() => setZoom((z) => Math.max(0.15, z * 0.8))}
          title="Zoom Out"
        >
          <ZoomOut size={13} className={isLight ? 'text-[#70121e]' : ''} />
          <span>Zoom Out</span>
        </button>

        {/* Reset camera */}
        <button
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${wikiPanel} ${
            isLight ? 'hover:bg-[#ede0c9] text-[#2b1810]' : 'hover:bg-white/10'
          }`}
          onClick={resetCamera}
          title="Reset camera (100% Origin)"
        >
          <Maximize2 size={13} className={isLight ? 'text-[#70121e]' : ''} />
          <span>Reset</span>
        </button>

        {/* Zoom to fit */}
        <button
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${wikiPanel} ${
            isLight ? 'hover:bg-[#ede0c9] text-[#2b1810]' : 'hover:bg-white/10'
          }`}
          onClick={zoomToFit}
          title="Zoom to Fit (Fit all visible nodes)"
        >
          <Scan size={13} className={isLight ? 'text-[#70121e]' : ''} />
          <span>Fit View</span>
        </button>

        {/* Cluster by Category Islands */}
        <button
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${wikiPanel} ${
            isClustered
              ? (isRoyal ? 'ring-2 ring-[#70121e] bg-[#70121e] text-[#fff8e7] border-[#c8a96e]' : isWiki ? 'ring-2 ring-[#b91c1c] bg-[#b91c1c] text-white' : 'ring-2 ring-yellow-400 bg-yellow-400/20 text-yellow-300')
              : isLight ? 'hover:bg-[#ede0c9] text-[#2b1810]' : 'hover:bg-white/10'
          }`}
          onClick={() => setIsClustered(c => !c)}
          title={isClustered ? "Disable Category Islands" : "Cluster by Category Islands"}
        >
          <Layers size={13} className={isLight && !isClustered ? 'text-[#70121e]' : ''} />
          <span>{isClustered ? 'Islands (On)' : 'Islands'}</span>
        </button>

        {/* Isolate Neighbors / Focus Mode */}
        <button
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${wikiPanel} ${
            isolateNeighbors
              ? (isRoyal ? 'ring-2 ring-[#70121e] bg-[#70121e] text-[#fff8e7] border-[#c8a96e]' : isWiki ? 'ring-2 ring-[#b91c1c] bg-[#b91c1c] text-white' : 'ring-2 ring-yellow-400 bg-yellow-400/20 text-yellow-300')
              : isLight ? 'hover:bg-[#ede0c9] text-[#2b1810]' : 'hover:bg-white/10'
          }`}
          onClick={() => setIsolateNeighbors(i => !i)}
          title={isolateNeighbors ? "Focus Mode Active (Isolating active node & neighbors)" : "Enable Focus Mode (Isolate neighbors on click)"}
        >
          <Crosshair size={13} className={isLight && !isolateNeighbors ? 'text-[#70121e]' : ''} />
          <span>{isolateNeighbors ? 'Focus (On)' : 'Focus'}</span>
        </button>

        {/* Re-center on selected node */}
        {selectedId && (
          <button
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${wikiPanel} ${
              isLight ? 'hover:bg-[#ede0c9] text-[#2b1810]' : 'hover:bg-white/10'
            }`}
            onClick={() => {
              const n = nodesRef.current.find((n) => n.id === selectedId);
              if (!n) return;
              setPan({ x: dims.w / 2 - n.x * zoom, y: dims.h / 2 - n.y * zoom });
            }}
            title="Center on selected"
          >
            <Crosshair size={13} className={isLight ? 'text-[#70121e]' : ''} />
            <span>Center</span>
          </button>
        )}

        {/* Legend toggle */}
        <button
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${wikiPanel} ${
            isLight ? 'hover:bg-[#ede0c9] text-[#2b1810]' : 'hover:bg-white/10'
          }`}
          onClick={() => setShowLegend((v) => !v)}
          title="Toggle legend"
        >
          {showLegend ? <EyeOff size={13} className={isLight ? 'text-[#70121e]' : ''} /> : <Eye size={13} className={isLight ? 'text-[#70121e]' : ''} />}
          <span>{showLegend ? 'Hide Legend' : 'Legend'}</span>
        </button>

        {/* Export SVG */}
        <button
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${wikiPanel} ${
            isLight ? 'hover:bg-[#ede0c9] text-[#2b1810]' : 'hover:bg-white/10'
          }`}
          onClick={() => { if (svgRef.current) exportSvg(svgRef.current, 'nexus-graph.svg'); }}
          title="Export graph as SVG"
        >
          <Download size={13} className={isLight ? 'text-[#70121e]' : ''} />
          <span>Export SVG</span>
        </button>

        {/* Export PNG */}
        <button
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${wikiPanel} ${
            isLight ? 'hover:bg-[#ede0c9] text-[#2b1810]' : 'hover:bg-white/10'
          }`}
          onClick={() => { if (svgRef.current) exportPng(svgRef.current, 'nexus-graph.png'); }}
          title="Export graph as PNG (2× resolution)"
        >
          <Download size={13} className={isLight ? 'text-[#70121e]' : ''} />
          <span>Export PNG</span>
        </button>
      </div>

      {/* ── Filter panel ────────────────────────────────────────────────────── */}
      {filterOpen && (
        <div
          className={`absolute top-16 right-4 w-64 rounded-2xl border p-4 shadow-2xl flex flex-col gap-3 z-30 ${wikiPanel}`}
        >
          <p className={`text-[10px] uppercase tracking-widest font-black ${isLight ? 'text-[#2b1810]' : 'opacity-60'}`}>
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
                    active ? (isLight ? 'text-[#2b1810] font-black' : 'opacity-100') : (isLight ? 'text-[#2b1810]/40' : 'opacity-40')
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

          <div className={`h-px ${isLight ? 'bg-[#c8a96e]/40' : 'bg-slate-700'}`} />

          <p className={`text-[10px] uppercase tracking-widest font-black ${isLight ? 'text-[#2b1810]' : 'opacity-60'}`}>
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
                    active ? (isLight ? 'text-[#2b1810] font-bold' : 'opacity-100') : (isLight ? 'text-[#2b1810]/40' : 'opacity-40')
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

          <div className={`h-px ${isLight ? 'bg-[#c8a96e]/40' : 'bg-slate-700'}`} />

          <p className={`text-[10px] uppercase tracking-widest font-black ${isLight ? 'text-[#2b1810]' : 'opacity-60'}`}>
            Document Scope
          </p>
          <button
            onClick={() => setSuppressMinor((prev) => !prev)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
              suppressMinor
                ? (isRoyal
                    ? 'border-[#70121e] bg-[#70121e]/15 text-[#3d0a10]'
                    : isWiki
                    ? 'border-[#b91c1c] bg-[#b91c1c]/10 text-[#b91c1c]'
                    : 'border-amber-400/50 bg-amber-400/15 text-amber-200')
                : (isLight ? 'border-[#c8a96e]/40 text-[#2b1810]/70 hover:text-[#2b1810]' : 'border-current/15 opacity-60 hover:opacity-100')
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={12} className={isLight ? 'text-[#70121e]' : 'opacity-70'} />
              <span>Suppress Minor Entries</span>
            </div>
            <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${isLight ? 'bg-[#ede0c9] text-[#2b1810]' : 'bg-black/20'}`}>
              {suppressMinor ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      )}

      {/* ── Legend ──────────────────────────────────────────────────────────── */}
      {showLegend && (
        <div
          className={`absolute bottom-4 left-4 rounded-2xl border p-4 shadow-xl flex flex-col gap-2 z-20 ${wikiPanel}`}
          style={{ minWidth: 180 }}
        >
          <p className={`text-[9px] uppercase tracking-widest font-black ${isLight ? 'text-[#2b1810]' : 'opacity-50'}`}>Legend</p>
          {HIERARCHY_CONFIG.map((cat) => (
            <div key={cat.id} className={`flex items-center gap-2 text-[10px] font-semibold ${isLight ? 'text-[#2b1810]' : ''}`}>
              <span
                className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-black/10"
                style={{ background: CATEGORY_COLORS[cat.id] }}
              />
              {cat.label}
            </div>
          ))}
          <div className={`h-px mt-1 ${isLight ? 'bg-[#c8a96e]/40' : 'bg-slate-700'}`} />
          {(Object.keys(EDGE_COLORS) as EdgeKind[]).map((kind) => (
            <div key={kind} className="flex items-center gap-2 text-[10px]">
              <span
                className="w-5 h-0.5 rounded-full flex-shrink-0"
                style={{ background: EDGE_COLORS[kind] }}
              />
              <span className={isLight ? 'text-[#2b1810] font-medium' : 'opacity-70'}>{EDGE_LABELS[kind]}</span>
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
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-widest pointer-events-none transition-all ${
          isLight
            ? 'text-[#2b1810] bg-[#f5ead0]/95 px-4 py-1.5 rounded-full border border-[#c8a96e]/60 shadow-md font-serif'
            : `opacity-30 ${wikiText}`
        }`}
      >
        {Math.round(zoom * 100)}% · Scroll to zoom · Drag to pan · Click node to inspect · Double-click to open
      </div>
    </div>
  );
};
