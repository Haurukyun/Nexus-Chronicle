import React from 'react';
import { create } from 'zustand';
import { WorldData, WorldEntity, EntityType } from '../types';

interface WorldStore {
    world: WorldData;
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
    
    openTabIds: string[];
    setOpenTabIds: (update: string[] | ((prev: string[]) => string[])) => void;

    activeTabId: string | 'map' | 'trash' | 'options';
    setActiveTabId: (id: string | 'map' | 'trash' | 'options') => void;

    isWikiMode: boolean;
    setIsWikiMode: (mode: boolean) => void;

    drafts: Record<string, WorldEntity>;
    setDrafts: (update: Record<string, WorldEntity> | ((prev: Record<string, WorldEntity>) => Record<string, WorldEntity>)) => void;

    editingTabIds: Set<string>;
    setEditingTabIds: (update: Set<string> | ((prev: Set<string>) => Set<string>)) => void;

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
}

export const useWorldStore = create<WorldStore>((set, get) => ({
    world: { name: "New Realm", entities: [], trash: [], mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000" },
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

    editingTabIds: new Set<string>(),
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
            tags: [], parentIds: [], childrenIds: [],
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
            }
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

        const newEditing = new Set(editingTabIds);
        newEditing.delete(id);
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
        
        const newEditing = new Set(editingTabIds);
        newEditing.delete(id);

        set({
            world: { ...world, entities: updatedEntities },
            drafts: newDrafts,
            editingTabIds: newEditing
        });
    },

    handleToggleEdit: (id) => {
        const { editingTabIds, activeTabId, drafts, world } = get();
        const targetId = id || (activeTabId as string);
        const newEditing = new Set(editingTabIds);
        
        if (newEditing.has(targetId)) {
            newEditing.delete(targetId);
            const newDrafts = { ...drafts };
            delete newDrafts[targetId];
            set({ editingTabIds: newEditing, drafts: newDrafts });
        } else {
            newEditing.add(targetId);
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
        if (confirm(`Send "${entity.name}" to the trash?`)) {
            const { world, handleCloseTab } = get();
            set({
                world: {
                    ...world,
                    entities: world.entities.filter(e => e.id !== entity.id),
                    trash: [...world.trash, { ...entity, lastModified: Date.now() }]
                }
            });
            handleCloseTab(entity.id);
        }
    }
}));
