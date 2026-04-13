import React from 'react';
import { SmartSelect } from '../ui';
import { EntityType, WorldEntity } from '../../types';

interface GroupRoleGroupProps {
    label: string;
    roleKey: string;
    isWikiMode: boolean;
    entity: any;
    allEntities: WorldEntity[];
    onUpdate: (data: any) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
}

export const GroupRoleGroup = ({ label, roleKey, isWikiMode, entity, allEntities, onUpdate, onCreateNew }: GroupRoleGroupProps) => {
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

    return (
        <div className={`lg:col-span-3 p-6 rounded-3xl border ${isWikiMode ? 'bg-[#fef9c3]/10 border-[#d4c8af]' : 'bg-slate-950/30 border-slate-800/40'}`}>
            <h4 className="text-[10px] font-black uppercase text-slate-500 mb-6 border-b pb-2 tracking-widest">{label}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {roles.map(r => (
                    <SmartSelect key={r} isWikiMode={isWikiMode} all={allEntities} label={formatLabel(r)} ids={entity.groupConnections[roleKey][r]} type={typeMap[roleKey]} onChange={(ids: string[]) => onUpdate({ ...entity, groupConnections: { ...entity.groupConnections, [roleKey]: { ...entity.groupConnections[roleKey], [r]: ids } } })} onCreate={onCreateNew} />
                ))}
            </div>
        </div>
    );
};
