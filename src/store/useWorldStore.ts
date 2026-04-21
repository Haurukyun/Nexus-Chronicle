import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorldData, WorldEntity, EntityType } from '../types';

interface WorldStore {
    world: WorldData;
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;

    openTabIds: string[];
    setOpenTabIds: (update: string[] | ((prev: string[]) => string[])) => void;

    activeTabId: string | 'map' | 'trash' | 'options' | 'dashboard' | 'timeline' | 'nexus' | 'journey';
    setActiveTabId: (id: string | 'map' | 'trash' | 'options' | 'dashboard' | 'timeline' | 'nexus' | 'journey') => void;

    isWikiMode: boolean;
    setIsWikiMode: (mode: boolean) => void;

    drafts: Record<string, WorldEntity>;
    setDrafts: (update: Record<string, WorldEntity> | ((prev: Record<string, WorldEntity>) => Record<string, WorldEntity>)) => void;

    editingTabIds: string[]; // Set is not JSON serializable easily in basic persist
    setEditingTabIds: (update: string[] | ((prev: string[]) => string[])) => void;

    searchQuery: string;
    setSearchQuery: (query: string) => void;

    expandedCategories: string[];
    setExpandedCategories: (update: string[] | ((prev: string[]) => string[])) => void;

    // Actions
    handleCreate: (type: EntityType, name?: string, shouldOpen?: boolean) => string;
    handleOpenEntity: (id: string) => void;
    handleCloseTab: (id: string, e?: React.MouseEvent) => void;
    handleSaveDraft: (id: string) => void;
    handleToggleEdit: (id: string) => void;
    handleDeleteToTrash: (entity: WorldEntity) => void;
    setWorldPhase: (phase: string) => void;
    addMapConnection: (sourceId: string, targetId: string, type: any) => void;
    removeMapConnection: (id: string) => void;
}

export const useWorldStore = create<WorldStore>()(
    persist(
        (set, get) => ({
            world: { 
                name: "New Realm", entities: [], trash: [], 
                mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000",
                mapConnections: [],
                worldPhase: 'golden'
            },
            setWorld: (update) => set((state) => ({
                world: typeof update === 'function' ? update(state.world) : update
            })),

            openTabIds: [],
            setOpenTabIds: (update) => set((state) => ({
                openTabIds: typeof update === 'function' ? update(state.openTabIds) : update
            })),

            activeTabId: 'map',
            setActiveTabId: (id) => set({ activeTabId: id }),

            isWikiMode: false,
            setIsWikiMode: (mode) => set({ isWikiMode: mode }),

            drafts: {},
            setDrafts: (update) => set((state) => ({
                drafts: typeof update === 'function' ? update(state.drafts) : update
            })),

            editingTabIds: [],
            setEditingTabIds: (update) => set((state) => ({
                editingTabIds: typeof update === 'function' ? update(state.editingTabIds) : update
            })),

            searchQuery: '',
            setSearchQuery: (query) => set({ searchQuery: query }),

            expandedCategories: ['world'],
            setExpandedCategories: (update) => set((state) => ({
                expandedCategories: typeof update === 'function' ? update(state.expandedCategories) : update
            })),

            // Actions implementation
            handleCreate: (type, prefilledName, shouldOpen = true) => {
                const id = crypto.randomUUID();
                const world = get().world;
                const name = prefilledName || prompt(`Enter ${type} name:`, `New ${type}`);
                if (!name) return "";

                const newEntity: any = {
                    id, name, type, description: "",
                    lastModified: Date.now(),
                    isFinished: false,
                    orderNumber: "",
                    documentTemplate: "None",
                    extraHtmlClasses: "",
                    otherNamesAndEpithets: "",
                    tags: [], parentIds: [], childrenIds: [], relativeIds: [], friendIds: [], enemyIds: [], complicatedWithIds: [],
                    loreNoteIds: [],
                    mythIds: [],
                    eventIds: [],
                    locationIds: [],
                    cultureIds: [],
                    groupConnections: {
                        political: { leadingFigureOf: [], connectedTo: [], memberOf: [], allyOf: [], enemyOf: [] },
                        organization: { leadingFigureOf: [], connectedTo: [], memberOf: [], allyOf: [], enemyOf: [] },
                        religious: { leadingFigureOf: [], connectedTo: [], memberOf: [], allyOf: [], enemyOf: [] },
                        magic: { leadingFigureOf: [], connectedTo: [], memberOf: [], allyOf: [], enemyOf: [] },
                        science: { leadingFigureOf: [], connectedTo: [], memberOf: [], allyOf: [], enemyOf: [] },
                    },
                    detailSkillIds: [],
                    detailItemIds: [],
                    detailConditionIds: [],
                    detailResourceIds: [],
                    // Character specific defaults
                    ...(type === 'character' ? {
                        placeOfResidenceId: [], placeOfOriginId: [], placeOfDemiseId: [],
                        speciesIds: [], occupationIds: [],
                        affectedByBoonsIds: [], affectedByAfflictionsIds: [], affectedByOtherConditionsIds: [],
                        skillIds: [], spellIds: [], languageIds: [], magicalTeachingIds: [], technologyIds: [],
                        equipmentIds: [], wealthIds: [],
                        stats: { strength: "10", dexterity: "10", constitution: "10", intelligence: "10", wisdom: "10", charisma: "10" }
                    } : {}),
                    // Location specific defaults
                    ...(type === 'location' ? {
                        precedingLocationIds: [], succeedingLocationIds: [],
                        localLanguageIds: [], localCurrencyIds: [], localCultureIds: [],
                        commonOccupationIds: [], localResourceIds: [], localSpeciesIds: [],
                        originatedCharacterIds: [], livingCharacterIds: [], deceasedCharacterIds: [], connectedCharacterIds: [],
                        neighbouringLocationIds: [], otherConnectedLocationIds: [],
                        traditionsAndCustoms: "",
                        governingGroupConnections: {
                            political: { leadingFigureOf: [], connectedTo: [], memberOf: [], allyOf: [], enemyOf: [] },
                            organization: { leadingFigureOf: [], connectedTo: [], memberOf: [], allyOf: [], enemyOf: [] },
                            religious: { leadingFigureOf: [], connectedTo: [], memberOf: [], allyOf: [], enemyOf: [] },
                            magic: { leadingFigureOf: [], connectedTo: [], memberOf: [], allyOf: [], enemyOf: [] },
                            science: { leadingFigureOf: [], connectedTo: [], memberOf: [], allyOf: [], enemyOf: [] },
                        }
                    } : {})
                };

                set((state) => ({
                    world: { ...state.world, entities: [...state.world.entities, newEntity] }
                }));

                if (shouldOpen) {
                    get().handleOpenEntity(id);
                    get().handleToggleEdit(id);
                }
                return id;
            },

            handleOpenEntity: (id) => {
                const openTabIds = get().openTabIds;
                if (!openTabIds.includes(id)) {
                    set({ openTabIds: [...openTabIds, id] });
                }
                set({ activeTabId: id });
            },

            handleCloseTab: (id, e) => {
                if (e) e.stopPropagation();
                const { openTabIds, drafts, editingTabIds, activeTabId } = get();

                if (drafts[id] && !confirm("You have unsaved changes. Close anyway?")) {
                    return;
                }

                const newTabs = openTabIds.filter(tid => tid !== id);
                set({ openTabIds: newTabs });

                const newDrafts = { ...drafts };
                delete newDrafts[id];
                set({ drafts: newDrafts });

                const newEditing = editingTabIds.filter(tid => tid !== id);
                set({ editingTabIds: newEditing });

                if (activeTabId === id) {
                    set({ activeTabId: newTabs.length > 0 ? newTabs[newTabs.length - 1] : 'map' });
                }
            },

            handleSaveDraft: (id) => {
                const { drafts, world, editingTabIds } = get();
                if (!drafts[id]) return;

                const updatedEntities = world.entities.map(e => e.id === id ? { ...drafts[id], lastModified: Date.now() } : e);

                const newDrafts = { ...drafts };
                delete newDrafts[id];

                const newEditing = editingTabIds.filter(tid => tid !== id);

                set({
                    world: { ...world, entities: updatedEntities },
                    drafts: newDrafts,
                    editingTabIds: newEditing
                });
            },

            handleToggleEdit: (id) => {
                const { editingTabIds, activeTabId, drafts, world } = get();
                const targetId = id || (activeTabId as string);

                if (editingTabIds.includes(targetId)) {
                    const newEditing = editingTabIds.filter(tid => tid !== targetId);
                    const newDrafts = { ...drafts };
                    delete newDrafts[targetId];
                    set({ editingTabIds: newEditing, drafts: newDrafts });
                } else {
                    const newEditing = [...editingTabIds, targetId];
                    const baseEntity = world.entities.find(e => e.id === targetId);
                    if (baseEntity) {
                        set({
                            editingTabIds: newEditing,
                            drafts: { ...drafts, [targetId]: { ...baseEntity } }
                        });
                    }
                }
            },

            handleDeleteToTrash: (entity) => {
                const { world, handleCloseTab } = get();
                if (confirm(`Send "${entity.name}" to the trash?`)) {
                    set({
                        world: {
                            ...world,
                            entities: world.entities.filter(e => e.id !== entity.id),
                            trash: [...world.trash, { ...entity, lastModified: Date.now() }]
                        }
                    });
                    handleCloseTab(entity.id);
                }
            },
            setWorldPhase: (phase) => {
                set((state) => ({ world: { ...state.world, worldPhase: phase as any } }));
            },
            addMapConnection: (sourceId, targetId, type) => {
                const id = crypto.randomUUID();
                set((state) => ({ 
                    world: { 
                        ...state.world, 
                        mapConnections: [...(state.world.mapConnections || []), { id, sourceId, targetId, type }] 
                    } 
                }));
            },
            removeMapConnection: (id) => {
                set((state) => ({ 
                    world: { 
                        ...state.world, 
                        mapConnections: (state.world.mapConnections || []).filter(c => c.id !== id) 
                    } 
                }));
            }
        }),
        {
            name: 'nexus-chronicle-storage',
            partialize: (state) => ({
                world: state.world,
                isWikiMode: state.isWikiMode
            }),
        }
    )
);
