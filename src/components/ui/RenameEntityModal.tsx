import React, { useState, useMemo } from 'react';
import { Edit3, X, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { WorldData, WorldEntity } from '../../types';
import { useTheme } from '../../theme';
import { renameEntityInWorld } from '../../utils/entityRenaming';

interface Props {
  entity: WorldEntity;
  world: WorldData;
  onConfirm: (newName: string) => void;
  onClose: () => void;
}

export const RenameEntityModal: React.FC<Props> = ({ entity, world, onConfirm, onClose }) => {
  const { themeId } = useTheme();
  const isRoyal = themeId === 'royal-codex';
  const isWiki = themeId === 'wiki';
  const isGV = themeId === 'grand-voyager';

  const [newName, setNewName] = useState(entity.name);

  const preview = useMemo(() => {
    if (!newName.trim() || newName === entity.name) return null;
    return renameEntityInWorld(world, entity.id, newName.trim());
  }, [newName, entity, world]);

  const bg = isRoyal ? 'bg-[#fbf8ef] text-[#2b1810]' : isWiki ? 'bg-white text-[#2b1810]' : isGV ? 'bg-[#1a3a3a] text-[#f5e9d0]' : 'bg-slate-900 text-slate-100';
  const border = isRoyal ? 'border-[#c8a96e]' : isWiki ? 'border-[#d4c8af]' : isGV ? 'border-teal-700' : 'border-slate-700';
  const accent = isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#b91c1c]' : isGV ? 'text-[#2dd4bf]' : 'text-[#fef08a]';
  const inputBg = isRoyal ? 'bg-[#f0e6d0] border-[#c8a96e]' : isWiki ? 'bg-[#f5f0e8] border-[#d4c8af]' : isGV ? 'bg-[#0d2929] border-teal-700' : 'bg-slate-800 border-slate-600';
  const confirmBg = isRoyal ? 'bg-[#70121e] text-[#fff8e7] hover:bg-[#8a1c28]' : isWiki ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b]' : isGV ? 'bg-teal-600 text-white hover:bg-teal-500' : 'bg-[#fef08a] text-black hover:bg-yellow-300';

  const isValid = newName.trim() !== '' && newName.trim() !== entity.name;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-md rounded-3xl border-2 ${border} ${bg} shadow-2xl p-6 space-y-5`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className={`font-serif font-black text-lg flex items-center gap-2 ${accent}`}>
            <Edit3 size={18} /> Rename &amp; Propagate
          </h2>
          <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity"><X size={18} /></button>
        </div>

        {/* Current name */}
        <div className="text-xs opacity-60 font-mono uppercase tracking-widest">Current name</div>
        <div className={`text-sm font-bold px-3 py-2 rounded-xl border ${inputBg} opacity-70`}>{entity.name}</div>

        {/* New name input */}
        <div>
          <label className="text-xs opacity-60 font-mono uppercase tracking-widest block mb-1">New name</label>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && isValid) { onConfirm(newName.trim()); } if (e.key === 'Escape') onClose(); }}
            className={`w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-current/30 ${inputBg} bg-transparent`}
            autoFocus
            placeholder="Enter new name..."
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className={`rounded-xl border p-3 text-xs space-y-1 ${border} ${preview.occurrencesPatched > 0 ? '' : 'opacity-60'}`}>
            {preview.occurrencesPatched > 0 ? (
              <>
                <div className={`flex items-center gap-1.5 font-bold ${accent}`}>
                  <AlertCircle size={12} /> Propagation preview
                </div>
                <div className="opacity-70">{preview.occurrencesPatched} wikilink occurrence{preview.occurrencesPatched !== 1 ? 's' : ''} in {preview.entitiesAffected.length} entr{preview.entitiesAffected.length !== 1 ? 'ies' : 'y'} will be updated.</div>
                {preview.entitiesAffected.slice(0, 5).map(n => <div key={n} className="font-mono opacity-50 truncate">· {n}</div>)}
                {preview.entitiesAffected.length > 5 && <div className="opacity-40 font-mono">...and {preview.entitiesAffected.length - 5} more</div>}
              </>
            ) : (
              <div className="flex items-center gap-1.5 opacity-60"><CheckCircle size={12} /> No wikilink occurrences found — only the entity name changes.</div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border ${border} opacity-60 hover:opacity-100 transition-opacity`}>Cancel</button>
          <button
            onClick={() => isValid && onConfirm(newName.trim())}
            disabled={!isValid}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-30 ${confirmBg}`}
          >
            <RefreshCw size={12} /> Rename &amp; Propagate
          </button>
        </div>
      </div>
    </div>
  );
};
