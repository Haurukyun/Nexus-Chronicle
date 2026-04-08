import React from 'react';
import { CodexHeader, WikiHeader } from './ViewerHeaders';
import { CharacterStatBlock } from './CharacterStatBlock';
import { WikiInfobox } from './WikiInfobox';
import { FieldRow, LinksDisplay } from '../ui';
import { EntityViewerProps, Character, EntityType } from '../../types';
import { TYPE_LABELS } from '../../constants';

export const EntityViewer = ({ entity, allEntities, onEdit, onDelete, onNavigate, onFocusMap, isWikiMode }: EntityViewerProps) => {
    const isChar = entity.type === 'character';
    const char = entity as Character;

    const MainView = () => (
        <div className={`flex ${isWikiMode ? 'flex-row gap-12' : 'flex-col lg:flex-row gap-12'}`}>
            <div className="flex-1 space-y-12">
                <section className={`${isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}`}>
                    <h2 className={`text-4xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28]' : 'text-[#fef08a]'} mb-2 uppercase tracking-tight`}>{isChar ? 'Biography' : 'Overview'}</h2>
                    {isWikiMode && <div className="h-[2px] w-full bg-[#e69a28] mb-6" />}

                    <p className={`text-lg leading-relaxed ${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.description || "The entry is currently silent."}</p>
                </section>

                {isWikiMode && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <LinksDisplay label="Lore Connections" ids={char.loreNoteIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Mythic Roots" ids={char.mythIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Event Ties" ids={char.eventIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                )}

                {!isWikiMode && (
                    <div className="space-y-8">
                        <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                            <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Vital Records</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                <FieldRow label="Titles" value={char.titles} isWikiMode={false} />
                                <FieldRow label="Sex" value={char.sex} isWikiMode={false} />
                                <FieldRow label="Ethnicity" value={char.ethnicity} isWikiMode={false} />
                                <FieldRow label="Species" value={char.speciesIds?.map((id: string) => allEntities.find(e => e.id === id)?.name).filter(Boolean).join(', ')} isWikiMode={false} />
                                <FieldRow label="Occupation" value={char.occupationIds?.map((id: string) => allEntities.find(e => e.id === id)?.name).filter(Boolean).join(', ')} isWikiMode={false} />
                                <FieldRow label="Combat Rating" value={char.combatRating} isWikiMode={false} />
                                <FieldRow label="Height" value={char.height} isWikiMode={false} />
                                <FieldRow label="Weight" value={char.weight} isWikiMode={false} />
                                <FieldRow label="Birth" value={char.dateOfBirth} isWikiMode={false} />
                                <FieldRow label="Death" value={char.dateOfDeath} isWikiMode={false} />
                                <FieldRow label="Origin" value={allEntities.find(e => e.id === char.placeOfOriginId)?.name} isWikiMode={false} />
                                <FieldRow label="Residence" value={char.placeOfResidenceId} isWikiMode={false} />
                                <FieldRow label="Demise" value={char.placeOfDemiseId} isWikiMode={false} />
                                <FieldRow label="Other Info" value={char.otherBasicInfo} isWikiMode={false} />
                                <FieldRow label="Traits" value={char.traitsAndCharacteristics} isWikiMode={false} />
                                <FieldRow label="Features" value={char.unusualFeatures} isWikiMode={false} />
                                <FieldRow label="Equipment" value={char.equipment} isWikiMode={false} />
                                <FieldRow label="Wealth" value={char.wealth} isWikiMode={false} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <LinksDisplay label="Lore Connections" ids={char.loreNoteIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Mythic Roots" ids={char.mythIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Event Ties" ids={char.eventIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Locations" ids={char.locationIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Cultures" ids={char.cultureIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Parent Entities" ids={char.parentIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Child Entities" ids={char.childrenIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Known Skills" ids={char.skillIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Known Spells" ids={char.spellIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Languages" ids={char.languageIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Magical Teachings" ids={char.magicalTeachingIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Technologies" ids={char.technologyIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Boons" ids={char.affectedByBoonsIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Afflictions" ids={char.affectedByAfflictionsIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Other Conditions" ids={char.affectedByOtherConditionsIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        </div>

                        {entity.privateNotes && (
                            <div className="bg-rose-500/5 border border-rose-900/20 p-8 rounded-2xl">
                                <h3 className="text-xs font-black uppercase mb-4 tracking-widest text-rose-500">DM Confidential Notes</h3>
                                <p className="text-rose-200/70 font-mono text-sm whitespace-pre-wrap">{entity.privateNotes}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isWikiMode ? (
                <div className="lg:w-80 shrink-0">
                    {isChar ? (
                        <CharacterStatBlock entity={entity} allEntities={allEntities} onNavigate={onNavigate} hideName={true} />
                    ) : (
                        <WikiInfobox entity={entity} allEntities={allEntities} onNavigate={onNavigate} onFocusMap={onFocusMap} />
                    )}

                    {isChar && (
                        <div className="p-4 mt-6 bg-[#fcf5e9] border border-[#d4c8af]/60 rounded-sm">
                            <h4 className="text-[10px] font-black text-[#854d0e] uppercase border-b border-[#d4c8af] pb-1 mb-3">Relations</h4>
                            <div className="gap-1">
                                <LinksDisplay label="Locations" ids={char.locationIds} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="tag" />
                                <LinksDisplay label="Members" ids={(entity as any).memberOf} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="tag" />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <aside className="lg:w-80 shrink-0 space-y-6">
                    {isChar && <CharacterStatBlock entity={entity} allEntities={allEntities} onNavigate={onNavigate} />}
                    <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 h-fit sticky top-10">
                        <h3 className="text-[10px] font-black text-[#fef08a] uppercase tracking-[0.4em] mb-6 border-b border-slate-800/60 pb-3">Record Vitals</h3>
                        <div className="space-y-6">
                            <FieldRow label="Type" value={TYPE_LABELS[entity.type as EntityType]} isWikiMode={false} />
                            {isChar && <FieldRow label="Age" value={char.age} isWikiMode={false} />}
                            <FieldRow label="Status" value={entity.status || (entity.isDead ? 'Lost' : 'Active')} isWikiMode={false} />
                            <FieldRow label="Belongs Under" value={entity.belongsUnderId} isWikiMode={false} />
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );

    return (
        <article className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {isWikiMode ? (
                <WikiHeader entity={entity} onEdit={onEdit} onDelete={onDelete} />
            ) : (
                <CodexHeader entity={entity} onEdit={onEdit} onDelete={onDelete} />
            )}
            <MainView />
        </article>
    );
};
