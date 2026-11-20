import React, { useState, useMemo } from 'react';
import {
  BookOpen, Plus, Trash2, Edit3, Calendar, MapPin, Users, 
  Star, ChevronDown, ChevronRight, Save, X, Hash, Search
} from 'lucide-react';
import { WorldData, SessionLog, WorldEntity } from '../types';
import { useWorldStore } from '../store/useWorldStore';
import { useTheme } from '../theme';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';

interface Props {
  world: WorldData;
  onNavigate: (id: string) => void;
}

export const SessionLogView: React.FC<Props> = ({ world, onNavigate }) => {
  const { themeId, layoutMode } = useTheme();
  const { addSessionLog, updateSessionLog, deleteSessionLog } = useWorldStore();
  
  const isRoyal = themeId === 'royal-codex';
  const isWiki = layoutMode === 'wiki';
  const isGV = themeId === 'grand-voyager';
  const isLight = isRoyal || isWiki;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const blankForm = () => ({
    sessionNumber: ((world.sessionLogs || []).reduce((max, s) => Math.max(max, s.sessionNumber || 0), 0)) + 1,
    realDate: new Date().toISOString().slice(0, 10),
    inGameDate: '',
    title: '',
    summary: '',
    characterIds: [] as string[],
    locationIds: [] as string[],
    milestones: [] as string[],
    newMilestone: '',
  });
  const [form, setForm] = useState(blankForm);

  const logs = useMemo(() => {
    const all = [...(world.sessionLogs || [])].sort((a, b) => b.sessionNumber - a.sessionNumber);
    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase();
    return all.filter(l => 
      l.title.toLowerCase().includes(q) || 
      (l.summary || '').toLowerCase().includes(q) ||
      (l.inGameDate || '').toLowerCase().includes(q) ||
      (l.milestones || []).some(m => m.toLowerCase().includes(q))
    );
  }, [world.sessionLogs, searchQuery]);

  const characters = useMemo(() => world.entities.filter(e => e.type === 'character'), [world.entities]);
  const locations = useMemo(() => world.entities.filter(e => e.type === 'location'), [world.entities]);

  // Theme classes
  const bg = isRoyal ? 'bg-[#fbf8ef] text-[#2b1810]' : isWiki ? 'bg-[#fdfcf0] text-[#2b1810]' : isGV ? 'bg-[#0f2a2a] text-[#f5e9d0]' : 'bg-slate-950 text-slate-100';
  const cardBg = isRoyal ? 'bg-[#f7f0e1] border-[#c8a96e]' : isWiki ? 'bg-white border-[#d4c8af]' : isGV ? 'bg-[#1a3a3a] border-teal-800' : 'bg-slate-900 border-slate-700';
  const accent = isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#b91c1c]' : isGV ? 'text-[#2dd4bf]' : 'text-[#fef08a]';
  const accentBg = isRoyal ? 'bg-[#70121e] text-[#fff8e7]' : isWiki ? 'bg-[#b91c1c] text-white' : isGV ? 'bg-teal-600 text-white' : 'bg-[#fef08a] text-black';
  const inputCls = isRoyal ? 'bg-[#f0e6d0] border-[#c8a96e] text-[#2b1810] placeholder-[#c8a96e]/50' : isWiki ? 'bg-[#f5f0e8] border-[#d4c8af] text-[#2b1810]' : isGV ? 'bg-[#0d2929] border-teal-700 text-[#f5e9d0]' : 'bg-slate-800 border-slate-600 text-slate-100';

  const saveNew = () => {
    if (!form.title.trim()) return;
    const newId = addSessionLog({
      sessionNumber: form.sessionNumber,
      realDate: form.realDate,
      inGameDate: form.inGameDate || undefined,
      title: form.title.trim(),
      summary: form.summary || undefined,
      characterIds: form.characterIds,
      locationIds: form.locationIds,
      milestones: form.milestones,
    });
    setShowNewForm(false);
    setExpandedId(newId);
    setForm(blankForm());
  };

  const startEdit = (log: SessionLog) => {
    setForm({ 
      sessionNumber: log.sessionNumber,
      realDate: log.realDate,
      inGameDate: log.inGameDate || '',
      title: log.title,
      summary: log.summary || '',
      characterIds: [...(log.characterIds || [])],
      locationIds: [...(log.locationIds || [])],
      milestones: [...(log.milestones || [])],
      newMilestone: ''
    });
    setEditingId(log.id);
  };

  const saveEdit = () => {
    if (!editingId || !form.title.trim()) return;
    updateSessionLog(editingId, {
      sessionNumber: form.sessionNumber,
      realDate: form.realDate,
      inGameDate: form.inGameDate || undefined,
      title: form.title.trim(),
      summary: form.summary || undefined,
      characterIds: form.characterIds,
      locationIds: form.locationIds,
      milestones: form.milestones,
    });
    setEditingId(null);
  };

  const toggleCharacter = (id: string) => {
    setForm(f => ({
      ...f,
      characterIds: f.characterIds.includes(id) ? f.characterIds.filter(x => x !== id) : [...f.characterIds, id]
    }));
  };

  const toggleLocation = (id: string) => {
    setForm(f => ({
      ...f,
      locationIds: f.locationIds.includes(id) ? f.locationIds.filter(x => x !== id) : [...f.locationIds, id]
    }));
  };

  const addMilestone = () => {
    const m = form.newMilestone.trim();
    if (!m) return;
    setForm(f => ({ ...f, milestones: [...f.milestones, m], newMilestone: '' }));
  };

  const removeMilestone = (i: number) => {
    setForm(f => ({ ...f, milestones: f.milestones.filter((_, idx) => idx !== i) }));
  };

  const FormPanel = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className={`rounded-3xl border-2 p-5 space-y-4 shadow-xl ${cardBg}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1 ${accent}`}>Session Number</label>
          <input 
            type="number" 
            value={form.sessionNumber} 
            onChange={e => setForm(f => ({ ...f, sessionNumber: Number(e.target.value) }))} 
            className={`w-full px-3 py-2 rounded-xl border text-sm outline-none font-bold ${inputCls}`} 
          />
        </div>
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1 ${accent}`}>Real Date</label>
          <input 
            type="date" 
            value={form.realDate} 
            onChange={e => setForm(f => ({ ...f, realDate: e.target.value }))} 
            className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${inputCls}`} 
          />
        </div>
      </div>
      <div>
        <label className={`text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1 ${accent}`}>Session Title</label>
        <input 
          type="text" 
          value={form.title} 
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
          placeholder="e.g. The Siege of Iron Citadel, Trial by Fire..." 
          className={`w-full px-3 py-2 rounded-xl border text-sm outline-none font-bold ${inputCls}`} 
        />
      </div>
      <div>
        <label className={`text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1 ${accent}`}>In-Game / Fantasy Calendar Date (Optional)</label>
        <input 
          type="text" 
          value={form.inGameDate} 
          onChange={e => setForm(f => ({ ...f, inGameDate: e.target.value }))} 
          placeholder="e.g. 14th of Sunwane, Year 420 of the Third Age..." 
          className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${inputCls}`} 
        />
      </div>
      <div>
        <label className={`text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1 ${accent}`}>
          Session Chronicle / Notes (Markdown & [[Wikilinks]] supported)
        </label>
        <textarea 
          value={form.summary} 
          onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} 
          placeholder="Write session events, party discussions, combat outcomes, NPC discoveries..." 
          rows={5} 
          className={`w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none font-mono ${inputCls}`} 
        />
      </div>
      {/* Attending Characters */}
      {characters.length > 0 && (
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest opacity-60 block mb-2 ${accent}`}>Attending Characters</label>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
            {characters.map(c => (
              <button 
                key={c.id} 
                type="button" 
                onClick={() => toggleCharacter(c.id)} 
                className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                  form.characterIds.includes(c.id) 
                    ? accentBg + ' border-transparent shadow-sm' 
                    : 'border-current/20 opacity-50 hover:opacity-100'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Key Locations */}
      {locations.length > 0 && (
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest opacity-60 block mb-2 ${accent}`}>Visited Locations</label>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
            {locations.map(l => (
              <button 
                key={l.id} 
                type="button" 
                onClick={() => toggleLocation(l.id)} 
                className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                  form.locationIds.includes(l.id) 
                    ? accentBg + ' border-transparent shadow-sm' 
                    : 'border-current/20 opacity-50 hover:opacity-100'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Quest Milestones */}
      <div>
        <label className={`text-[10px] font-black uppercase tracking-widest opacity-60 block mb-2 ${accent}`}>Quest Milestones Achieved</label>
        <div className="space-y-1.5 mb-2">
          {form.milestones.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-current/10">
              <Star size={11} className={`${accent} shrink-0`} />
              <span className="flex-1 font-medium">{m}</span>
              <button type="button" onClick={() => removeMilestone(i)} className="opacity-40 hover:opacity-100 p-0.5"><X size={12} /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={form.newMilestone} 
            onChange={e => setForm(f => ({ ...f, newMilestone: e.target.value }))} 
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMilestone(); } }} 
            placeholder="Add milestone (e.g. Uncovered the sunken tome, Negotiated truce with Elves)..." 
            className={`flex-1 px-3 py-1.5 rounded-xl border text-xs outline-none ${inputCls}`} 
          />
          <button type="button" onClick={addMilestone} className={`px-4 py-1.5 rounded-xl text-xs font-bold ${accentBg}`}>Add</button>
        </div>
      </div>
      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-current/10">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-current/20 opacity-60 hover:opacity-100">Cancel</button>
        <button type="button" onClick={onSave} disabled={!form.title.trim()} className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-30 shadow-md ${accentBg}`}>
          <Save size={13} /> Save Session Record
        </button>
      </div>
    </div>
  );

  const getEntityById = (id: string) => world.entities.find(e => e.id === id);

  return (
    <div className={`flex flex-col h-full rounded-[2.5rem] border-4 overflow-hidden ${cardBg} ${bg} shadow-2xl`}>
      {/* Header */}
      <div className={`px-6 py-5 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
        isRoyal ? 'border-[#c8a96e]/40 bg-[#f5ead0]' : isWiki ? 'border-[#d4c8af] bg-[#f7f3ea]' : isGV ? 'border-teal-800 bg-[#0c2222]' : 'border-slate-800 bg-slate-900/60'
      }`}>
        <div>
          <h1 className={`font-serif font-black text-2xl sm:text-3xl flex items-center gap-2.5 tracking-tight uppercase ${accent}`}>
            <BookOpen size={24} /> Session Codex
          </h1>
          <p className="text-xs opacity-60 mt-0.5 font-serif italic">Campaign session logs, real-world dates & quest milestones</p>
        </div>
        <button 
          onClick={() => { setShowNewForm(true); setEditingId(null); setForm(blankForm()); }} 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all ${accentBg}`}
        >
          <Plus size={15} /> Log New Session
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className={`px-6 py-3 border-b flex items-center gap-3 shrink-0 ${
        isRoyal ? 'border-[#c8a96e]/30 bg-[#f9f4e8]' : isWiki ? 'border-[#d4c8af] bg-[#fdfcf0]' : isGV ? 'border-teal-800/60 bg-[#0e2727]' : 'border-slate-800/80 bg-slate-950/40'
      }`}>
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Search sessions by title, milestones, summary..." 
            className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs outline-none ${inputCls}`} 
          />
        </div>
        <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest hidden sm:block">
          {logs.length} session{logs.length !== 1 ? 's' : ''} recorded
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {showNewForm && <FormPanel onSave={saveNew} onCancel={() => setShowNewForm(false)} />}

        {logs.length === 0 && !showNewForm && (
          <div className="flex flex-col items-center justify-center py-24 opacity-40 text-center">
            <BookOpen size={56} className="mb-4 opacity-40" />
            <p className="font-serif text-xl font-bold">No campaign sessions recorded yet</p>
            <p className="text-xs mt-1.5 opacity-70 max-w-sm">
              Log your gaming sessions with real-world dates, in-game calendar progression, attending party characters, and quest milestones.
            </p>
          </div>
        )}

        {logs.map(log => {
          if (editingId === log.id) return <FormPanel key={log.id} onSave={saveEdit} onCancel={() => setEditingId(null)} />;
          const isExpanded = expandedId === log.id;
          const attendees = (log.characterIds || []).map(id => getEntityById(id)).filter(Boolean) as WorldEntity[];
          const keyLocs = (log.locationIds || []).map(id => getEntityById(id)).filter(Boolean) as WorldEntity[];
          return (
            <div 
              key={log.id} 
              className={`rounded-2xl border p-5 space-y-3 transition-all shadow-sm hover:shadow-md ${cardBg}`}
            >
              <div className="flex items-start justify-between gap-3">
                <button 
                  className="flex items-center gap-3 flex-1 text-left group" 
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono tracking-tight shrink-0 ${accentBg}`}>
                    Session #{log.sessionNumber}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif font-black text-base sm:text-lg group-hover:underline transition-all">
                      {log.title}
                    </h3>
                  </div>
                  {isExpanded ? <ChevronDown size={16} className="opacity-40 shrink-0" /> : <ChevronRight size={16} className="opacity-40 shrink-0" />}
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => startEdit(log)} 
                    className="p-2 opacity-50 hover:opacity-100 rounded-lg hover:bg-black/10 transition-all" 
                    title="Edit Session"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => { 
                      if (confirm(`Delete session log #${log.sessionNumber}: "${log.title}"?`)) {
                        deleteSessionLog(log.id); 
                      }
                    }} 
                    className="p-2 opacity-50 hover:opacity-100 text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all" 
                    title="Delete Session"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Meta pills */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono opacity-70">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-current/10">
                  <Calendar size={11} className={accent} /> {log.realDate}
                </span>
                {log.inGameDate && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-current/10">
                    <Hash size={11} className={accent} /> {log.inGameDate}
                  </span>
                )}
                {attendees.length > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-current/10">
                    <Users size={11} className={accent} /> {attendees.length} character{attendees.length !== 1 ? 's' : ''}
                  </span>
                )}
                {keyLocs.length > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-current/10">
                    <MapPin size={11} className={accent} /> {keyLocs.length} location{keyLocs.length !== 1 ? 's' : ''}
                  </span>
                )}
                {(log.milestones || []).length > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-current/10 font-bold">
                    <Star size={11} className={accent} /> {log.milestones.length} milestone{log.milestones.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="pt-3 space-y-4 border-t border-current/15 animate-in fade-in duration-150">
                  {log.summary && (
                    <div className="text-xs leading-relaxed p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-current/10">
                      <MarkdownRenderer 
                        content={log.summary} 
                        allEntities={world.entities} 
                        onNavigate={onNavigate} 
                        isWikiMode={isWiki} 
                        className="text-xs" 
                      />
                    </div>
                  )}

                  {attendees.length > 0 && (
                    <div>
                      <div className={`text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 flex items-center gap-1.5 ${accent}`}>
                        <Users size={12} /> Attending Characters
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {attendees.map(c => (
                          <button 
                            key={c.id} 
                            onClick={() => onNavigate(c.id)} 
                            className={`px-3 py-1 rounded-full text-xs font-bold border border-current/20 hover:scale-105 transition-all ${accentBg}`}
                            title={`Open ${c.name} codex record`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {keyLocs.length > 0 && (
                    <div>
                      <div className={`text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 flex items-center gap-1.5 ${accent}`}>
                        <MapPin size={12} /> Visited Locations
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {keyLocs.map(l => (
                          <button 
                            key={l.id} 
                            onClick={() => onNavigate(l.id)} 
                            className={`px-3 py-1 rounded-full text-xs font-bold border border-current/20 hover:scale-105 transition-all ${accentBg}`}
                            title={`Open ${l.name} map/codex record`}
                          >
                            {l.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(log.milestones || []).length > 0 && (
                    <div>
                      <div className={`text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 flex items-center gap-1.5 ${accent}`}>
                        <Star size={12} /> Quest Milestones
                      </div>
                      <div className="space-y-1.5">
                        {log.milestones.map((m, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-current/10">
                            <Star size={12} className={`${accent} mt-0.5 shrink-0 fill-current`} />
                            <span className="font-medium">{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
