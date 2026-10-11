import React from 'react';
import { SmartSelect } from '../ui';
import { EntityType, WorldEntity } from '../../types';
import { useTheme } from '../../theme';

interface GroupRoleGroupProps {
    label: string;
    roleKey: string;
    entity: any;
    allEntities: WorldEntity[];
    onUpdate: (data: any) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isCustomGoverning?: boolean;
}

export const GroupRoleGroup = ({ label, roleKey, entity, allEntities, onUpdate, onCreateNew }: GroupRoleGroupProps) => {
    const { themeId, layoutMode } = useTheme();
    const isRoyal = themeId === 'royal-codex';
    const isWiki = layoutMode === 'wiki';
    const isVoyager = themeId === 'grand-voyager';

    const roles = ['leadingFigureOf', 'connectedTo', 'memberOf', 'allyOf', 'enemyOf'];
    const typeMap: Record<string, EntityType> = {
        political: 'political', organization: 'organization', religious: 'religious', magic: 'magic', science: 'science'
    };
    
    const formatLabel = (r: string) => {
        return r.replace(/([A-Z])/g, ' $1')
                .replace(/^./, s => s.toUpperCase())
                .replace(' Of', ' of')
                .replace(' To', ' to');
    };

    let containerStyle = 'bg-slate-950/40 border-slate-800/60';
    let labelStyle = 'text-[#fef08a]/80 border-slate-800/80';

    if (isRoyal) {
        containerStyle = 'bg-[#ede2cc]/60 border-[#c8a96e]/50 shadow-sm';
        labelStyle = 'text-[#3d0a10] border-[#c8a96e]/40 font-serif';
    } else if (isWiki) {
        containerStyle = 'bg-[#fcf8f2] border-[#d4c8af]';
        labelStyle = 'text-[#854d0e] border-[#d4c8af]';
    } else if (isVoyager) {
        containerStyle = 'bg-[#0b1512]/60 border-[#2dd4bf]/20';
        labelStyle = 'text-[#2dd4bf] border-[#2dd4bf]/30';
    }

    return (
        <div className={`w-full min-w-0 p-4 sm:p-5 rounded-2xl border transition-all flex flex-col ${containerStyle}`}>
            <h4 className={`text-[10px] font-black uppercase mb-4 border-b pb-2 tracking-widest break-words leading-tight ${labelStyle}`}>
                {label}
            </h4>
            <div className="flex flex-col space-y-3.5 w-full min-w-0">
                {roles.map(r => (
                    <SmartSelect 
                        key={r} 
                        all={allEntities} 
                        label={formatLabel(r)} 
                        ids={entity.groupConnections?.[roleKey]?.[r] || []} 
                        type={typeMap[roleKey]} 
                        onChange={(ids: string[]) => onUpdate({ 
                            ...entity, 
                            groupConnections: { 
                                ...entity.groupConnections, 
                                [roleKey]: { 
                                    ...entity.groupConnections?.[roleKey], 
                                    [r]: ids 
                                } 
                            } 
                        })} 
                        onCreate={onCreateNew} 
                        gridSpan={12}
                    />
                ))}
            </div>
        </div>
    );
};
