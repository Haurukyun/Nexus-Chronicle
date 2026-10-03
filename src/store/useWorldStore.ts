import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorldData, WorldEntity, EntityType, ThemeMode, WorldPhase, UniverseArchive } from '../types';
import { downloadFileToDevice } from '../utils/nexusArchive';
import { applyBidirectionalSync, removeEntityRelationsOnDelete, reconcileAllBidirectionalRelations } from '../utils/bidirectionalSync';

export const DEFAULT_REALM_MAP = "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000";

const defaultInitialRealm: WorldData = {
    id: "realm-prime",
    name: "Aethelgard Chronicle",
    description: "The Prime Realm — an eternal dominion of arcane spires, warring guilds, and forgotten leylines.",
    createdAt: 1700000000000,
    lastModified: Date.now(),
    entities: [],
    trash: [],
    mapImage: DEFAULT_REALM_MAP,
    mapConnections: [],
    worldPhase: 'golden'
};

interface WorldStore {
    // Active world (maintained for zero-breaking backward compatibility)
    world: WorldData;
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;

    // Multi-World State
    worlds: WorldData[];
    activeWorldId: string;

    // Multi-World Actions
    createWorld: (name: string, description?: string, mapImage?: string, worldPhase?: WorldPhase) => string;
    switchWorld: (worldId: string) => void;
    duplicateWorld: (worldId: string, customName?: string) => string;
    deleteWorld: (worldId: string) => boolean;
    updateWorldDetails: (worldId: string, updates: Partial<Pick<WorldData, 'name' | 'description' | 'mapImage' | 'worldPhase'>>) => void;
    exportWorld: (worldId?: string) => void;
    exportUniverse: () => void;
    importWorldData: (payload: any, mode: 'new' | 'replace') => { success: boolean; message: string; worldId?: string };

    openTabIds: string[];
    setOpenTabIds: (update: string[] | ((prev: string[]) => string[])) => void;

    activeTabId: string | 'map' | 'trash' | 'options' | 'dashboard' | 'timeline' | 'nexus' | 'journey';
    setActiveTabId: (id: string | 'map' | 'trash' | 'options' | 'dashboard' | 'timeline' | 'nexus' | 'journey') => void;

    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
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
    updateEntityParent: (entityId: string, parentId: string | null) => void;
    updateEntityLock: (id: string, isReadOnly: boolean) => void;
    reorderAndReparentEntity: (draggedId: string, targetId: string | null, position: 'before' | 'after' | 'inside', targetType?: EntityType) => void;
    handleHealRelations: () => void;
}

const syncWorld = (state: WorldStore, nextWorld: WorldData) => {
    const updatedWorld: WorldData = {
        ...nextWorld,
        id: nextWorld.id || state.activeWorldId || defaultInitialRealm.id,
        lastModified: Date.now()
    };
    const currentWorlds = state.worlds && state.worlds.length > 0 ? state.worlds : [updatedWorld];
    const updatedWorlds = currentWorlds.map(w => w.id === updatedWorld.id ? updatedWorld : w);
    const worlds = updatedWorlds.some(w => w.id === updatedWorld.id) ? updatedWorlds : [...updatedWorlds, updatedWorld];
    return {
        world: updatedWorld,
        worlds,
        activeWorldId: updatedWorld.id
    };
};

export const useWorldStore = create<WorldStore>()(
    persist(
        (set, get) => ({
            worlds: [defaultInitialRealm],
            activeWorldId: defaultInitialRealm.id,
            world: defaultInitialRealm,
            setWorld: (update) => set((state) => {
                const nextWorld = typeof update === 'function' ? update(state.world) : update;
                return syncWorld(state, nextWorld);
            }),

            openTabIds: [],
            setOpenTabIds: (update) => set((state) => ({
                openTabIds: typeof update === 'function' ? update(state.openTabIds) : update
            })),

            activeTabId: 'map',
            setActiveTabId: (id) => set({ activeTabId: id }),

            theme: 'sovereign',
            setTheme: (theme) => set({ theme, isWikiMode: theme === 'wiki' }),
            isWikiMode: false,
            setIsWikiMode: (mode) => set({ isWikiMode: mode, theme: mode ? 'wiki' : 'sovereign' }),


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
                let name = prefilledName;
                if (!name) {
                    const baseName = `New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
                    let counter = 1;
                    let candidate = baseName;
                    while (world.entities.some(e => e.name.trim().toLowerCase() === candidate.toLowerCase())) {
                        counter++;
                        candidate = `${baseName} ${counter}`;
                    }
                    name = candidate;
                }

                const newEntity: any = {
                    id, name, type, description: "",
                    lastModified: Date.now(),
                    isFinished: false,
                    orderNumber: "",
                    documentTemplate: "None",
                    extraHtmlClasses: "",
                    otherNamesAndEpithets: "",
                    tags: [], parentId: null, parentIds: [], childrenIds: [], relativeIds: [], friendIds: [], enemyIds: [], complicatedWithIds: [],
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
                                        ...(type === 'chapter' ? {
                        pairedConnectedNotes: [],
                        content: "",
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'character' ? {
                        pairedCurrentLocation: "",
                        pairedOriginLocation: "",
                        pairedDemiseLocation: "",
                        pairedMagic: [],
                        pairedTech: [],
                        skills: "",
                        titles: "",
                        sex: "",
                        age: "",
                        height: "",
                        weight: "",
                        birthDate: "",
                        deathDate: "",
                        pairedRace: [],
                        pairedProfession: [],
                        ethnicity: "",
                        powerLevel: "",
                        pairedCurrentLocationNew: [],
                        pairedOriginLocationNew: [],
                        pairedDemiseLocationNew: [],
                        pairedConditionsPositive: [],
                        pairedConditionsNegative: [],
                        pairedConditionsOther: [],
                        description: "",
                        personalityTraits: "",
                        traits: "",
                        statsList: "",
                        stats: { strength: "10", dexterity: "10", constitution: "10", intelligence: "10", wisdom: "10", charisma: "10" },
                        possessedItems: "",
                        possessedCurrencies: "",
                        knownSkills: "",
                        knownSpells: "",
                        knownLanguage: "",
                        knownMagic: "",
                        knownTech: "",
                        parentsOfCharacter: [],
                        childOfCharacter: [],
                        relativesOfCharacter: [],
                        allyResCharacter: [],
                        enemydResCharacter: [],
                        complicatedResCharacter: [],
                        pairedConnectedNotes: [],
                        pairedConnectedMyths: [],
                        pairedEvent: [],
                        pairedConnectedPlaces: [],
                        pairedLanguage: [],
                        relatedCultures: [],
                        leadingPoliticalLeaders: [],
                        pairedConnectionPolGroup: [],
                        pairedBelongingPolGroup: [],
                        pairedAllyPolGroup: [],
                        pairedEnemyPolGroup: [],
                        leadingOtherLeaders: [],
                        pairedConnectionOtherGroups: [],
                        pairedBelongingOtherGroups: [],
                        pairedAllyOtherGroups: [],
                        pairedEnemyOtherGroups: [],
                        leadingReligiousLeaders: [],
                        pairedConnectionRelGroup: [],
                        pairedBelongingRelGroup: [],
                        pairedAllyRelGroup: [],
                        pairedEnemyRelGroup: [],
                        leadingMagicalLeaders: [],
                        pairedConnectionMagicGroup: [],
                        pairedBelongingMagicGroup: [],
                        pairedAllyMagicGroup: [],
                        pairedEnemyMagicGroup: [],
                        leadingTechLeaders: [],
                        pairedConnectionTechGroup: [],
                        pairedBelongingTechGroup: [],
                        pairedAllyTechGroup: [],
                        pairedEnemyTechGroup: [],
                        pairedSkills: [],
                        pairedConnectedItems: [],
                        pairedConditionsConnected: [],
                        pairedResources: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'condition' ? {
                        features: "",
                        duration: "",
                        conditionType: "",
                        meansOfAttaining: "",
                        meansOfRemoving: "",
                        pairedConnectedConditionsPositive: [],
                        pairedConnectedConditionsNegative: [],
                        pairedConnectedConditionsOther: [],
                        statsListRequired: "",
                        description: "",
                        traditions: "",
                        pairedConnectedNotes: [],
                        pairedMyths: [],
                        pairedCharactersPositive: [],
                        pairedCharactersNegative: [],
                        pairedCharactersOther: [],
                        pairedCharactersConnected: [],
                        pairedLocationsPositive: [],
                        pairedLocationsNegative: [],
                        pairedLocationsOther: [],
                        pairedEventsPositive: [],
                        pairedEventsNegative: [],
                        pairedEventsOther: [],
                        pairedRacesPositive: [],
                        pairedRacesNegative: [],
                        pairedRacesOther: [],
                        pairedRacesPoliticalGroups: [],
                        pairedReligiousGroups: [],
                        pairedOtherGroups: [],
                        pairedMagicGroups: [],
                        pairedTechGroups: [],
                        pairedSkillsPositive: [],
                        pairedSkillsNegative: [],
                        pairedSkillsOther: [],
                        pairedItemsPositive: [],
                        pairedItemsNegative: [],
                        pairedItemsOther: [],
                        pairedItemsAfflicting: [],
                        pairedResourcesPositive: [],
                        pairedResourcesNegative: [],
                        pairedResourcesOther: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'culture' ? {
                        succedingCultures: [],
                        preceedingCultures: [],
                        creationTime: "",
                        endTIme: "",
                        traits: "",
                        population: "",
                        typeCulture: "",
                        relatedCharacters: [],
                        relatedRaces: [],
                        relatedLocations: [],
                        pairedEvents: [],
                        pairedSkills: [],
                        pairedItems: [],
                        relatedProfessions: [],
                        relatedResouces: [],
                        description: "",
                        traditions: "",
                        pairedConnectedNotes: [],
                        pairedOtherMyths: [],
                        pairedConnectedPolGroups: [],
                        pairedConnectedReligiousGroups: [],
                        pairedConnectedOtherGroups: [],
                        pairedConnectedMagicGroups: [],
                        pairedConnectedTechGroups: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'currency' ? {
                        pairedItems: [],
                        traits: "",
                        priceCurrencies: "",
                        madeFromResources: "",
                        pairedLocations: [],
                        usedByRaces: [],
                        usedInPoliticalGroups: [],
                        usedInOtherGroups: [],
                        description: "",
                        pairedConnectedNotes: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'event' ? {
                        eventType: "",
                        startDate: "",
                        endDate: "",
                        participants: "",
                        pairedCharacter: [],
                        pairedLocations: [],
                        pairedEvents: [],
                        pairedItems: [],
                        pairedRaces: [],
                        relatedCultures: [],
                        description: "",
                        pairedConnectedNotes: [],
                        pairedMyths: [],
                        connectedPolitical: [],
                        connectedOtherGroups: [],
                        connectedReligious: [],
                        connectedMagical: [],
                        connectedTech: [],
                        pairedSkills: [],
                        pairedSpells: [],
                        pairedConditionsPositive: [],
                        pairedConditionsNegative: [],
                        pairedConditionsOther: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'organization' ? {
                        leaders: "",
                        succedingOtherGroup: [],
                        preceedingOtherGroup: [],
                        creationTime: "",
                        endTIme: "",
                        headquarters: [],
                        followerName: "",
                        population: "",
                        followers: "",
                        leadingCharacters: [],
                        groupType: "",
                        localLanguages: [],
                        connectedRaces: [],
                        localCurrencies: [],
                        pairedConnectedResources: [],
                        description: "",
                        traditions: "",
                        pairedConnectedNotes: [],
                        pairedConnectedMyths: [],
                        governLocations: [],
                        connectedLocations: [],
                        connectedEvents: [],
                        pairedConnectedCultures: [],
                        pairedConnectionCharacter: [],
                        pairedBelongingCharacter: [],
                        pairedAllyCharacter: [],
                        pairedEnemyCharacter: [],
                        pairedConnectedPolGroups: [],
                        pairedAllyPolGroups: [],
                        pairedEnemyPolGroups: [],
                        pairedConnectedOtherGroups: [],
                        pairedAllyOtherGroups: [],
                        pairedEnemyOtherGroups: [],
                        pairedConnectedReligiousGroups: [],
                        pairedAllyReligiousGroups: [],
                        pairedEnemyReligiousGroups: [],
                        pairedConnectedMagicalGroups: [],
                        pairedAllyMagicalGroups: [],
                        pairedEnemyMagicalGroups: [],
                        pairedConnectedTechGroups: [],
                        pairedAllyTechGroups: [],
                        pairedEnemyTechGroups: [],
                        pairedSkills: [],
                        pairedConnectedItems: [],
                        pairedConnectedProfessions: [],
                        pairedConditions: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'item' ? {
                        pairedMagic: [],
                        pairedCurrencies: [],
                        features: "",
                        pairedItems: [],
                        relatedCultures: [],
                        pairedEvents: [],
                        pairedMyths: [],
                        priceInCurrencies: "",
                        pairedResourcesMade: [],
                        pairedResourcesProduced: [],
                        description: "",
                        traditions: "",
                        statsListRequired: "",
                        statsList: "",
                        pairedSkillsUsing: [],
                        pairedSkillsCommon: [],
                        pairedSkillsCreate: [],
                        pairedSkillsRequire: [],
                        pairedConditionsPositive: [],
                        pairedConditionsNegative: [],
                        pairedConditionsOther: [],
                        pairedConditionsAfflicting: [],
                        pairedConnectedNotes: [],
                        pairedConnectedCharacter: [],
                        pairedConnectedLocations: [],
                        pairedConnectedRaces: [],
                        pairedConnectedProfessions: [],
                        pairedConnectedPolGroups: [],
                        pairedConnectedOtherGroups: [],
                        pairedConnectedRelGroups: [],
                        pairedConnectedMagicGroups: [],
                        pairedConnectedTechGroups: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'language' ? {
                        languageFamily: [],
                        speakerCount: "",
                        predecessorLanguages: [],
                        followingLanguages: [],
                        description: "",
                        traditions: "",
                        pairedConnectedNotes: [],
                        pairedConnectedProfessions: [],
                        pairedCharacter: [],
                        pairedLocations: [],
                        usedByRaces: [],
                        usedInPoliticalGroups: [],
                        usedInOtherGroups: [],
                        usedInReligiousGroups: [],
                        usedInMagicalGroups: [],
                        usedInTechGroups: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'location' ? {
                        pairedOriginCharacters: "",
                        pairedCurrentCharacters: "",
                        pairedDemiseCharacters: "",
                        succedingLocations: [],
                        preceedingLocations: [],
                        creationTime: "",
                        endTIme: "",
                        traits: "",
                        locationType: "",
                        population: "",
                        size: "",
                        pairedLanguages: [],
                        pairedCurrencies: [],
                        relatedCultures: [],
                        connectedProfessions: [],
                        connectedResources: [],
                        neighbourLocations: [],
                        connectedLocations: [],
                        description: "",
                        traditions: "",
                        pairedOriginCharactersNew: [],
                        pairedCurrentCharactersNew: [],
                        pairedDemiseCharactersNew: [],
                        pairedConnectedCharacter: [],
                        pairedConnectedRaces: [],
                        pairedConnectedNotes: [],
                        pairedConnectedMyths: [],
                        pairedEvent: [],
                        pairedSkills: [],
                        pairedConnectedItems: [],
                        pairedConditionsPositive: [],
                        pairedConditionsNegative: [],
                        pairedConditionsOther: [],
                        governPolitical: [],
                        connectedPolitical: [],
                        governOther: [],
                        connectedOther: [],
                        governReligious: [],
                        connectedReligious: [],
                        governMagical: [],
                        connectedMagical: [],
                        governTech: [],
                        connectedTech: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'note' ? {
                        notes: "",
                        textNote: "",
                        pairedConnectedChapters: [],
                        pairedConnectedNote: [],
                        pairedConnectedMyths: [],
                        pairedConnectedCharacter: [],
                        pairedConnectedLocation: [],
                        pairedConnectedEvents: [],
                        pairedConnectedRaces: [],
                        localLanguages: [],
                        pairedConnectedCultures: [],
                        pairedConnectedPolGroups: [],
                        pairedConnectedOtherGroups: [],
                        pairedConnectedRelGroups: [],
                        pairedConnectedMagicGroups: [],
                        pairedConnectedTechGroups: [],
                        pairedConnectedSkills: [],
                        pairedConnectedItems: [],
                        pairedConnectedProfessions: [],
                        pairedConnectedConditions: [],
                        pairedConnectedResources: [],
                        localCurrencies: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'magic' ? {
                        leaders: "",
                        pairedCharacter: [],
                        pairedItems: [],
                        succedingMagicGroup: [],
                        preceedingMagicGroup: [],
                        creationTime: "",
                        endTIme: "",
                        headquarters: [],
                        followerName: "",
                        users: "",
                        followers: "",
                        leadingCharacters: [],
                        typeMagic: "",
                        formMagic: "",
                        pairedSpells: [],
                        pairedSkills: [],
                        pairedConditions: [],
                        pairedConnectedResources: [],
                        connectedRaces: [],
                        localLanguages: [],
                        description: "",
                        traditions: "",
                        pairedConnectedNotes: [],
                        pairedConnectedMyths: [],
                        governLocations: [],
                        connectedLocations: [],
                        connectedEvents: [],
                        pairedConnectedCultures: [],
                        pairedConnectionCharacter: [],
                        pairedBelongingCharacter: [],
                        pairedAllyCharacter: [],
                        pairedEnemyCharacter: [],
                        pairedConnectedPolGroups: [],
                        pairedAllyPolGroups: [],
                        pairedEnemyPolGroups: [],
                        pairedConnectedOtherGroups: [],
                        pairedAllyOtherGroups: [],
                        pairedEnemyOtherGroups: [],
                        pairedConnectedReligiousGroups: [],
                        pairedAllyReligiousGroups: [],
                        pairedEnemyReligiousGroups: [],
                        pairedConnectedMagicalGroups: [],
                        pairedAllyMagicalGroups: [],
                        pairedEnemyMagicalGroups: [],
                        pairedConnectedTechGroups: [],
                        pairedAllyTechGroups: [],
                        pairedEnemyTechGroups: [],
                        pairedConnectedItems: [],
                        pairedConnectedProfessions: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'myth' ? {
                        description: "",
                        traditions: "",
                        pairedConnectedNotes: [],
                        pairedOtherMyths: [],
                        pairedConnectedCharacter: [],
                        pairedConnectedLocations: [],
                        pairedEvents: [],
                        pairedConnectedRaces: [],
                        pairedCultures: [],
                        pairedConnectedPolGroups: [],
                        pairedConnectedOtherGroups: [],
                        pairedConnectedRelGroups: [],
                        pairedConnectedMagicGroups: [],
                        pairedConnectedTechGroups: [],
                        pairedSkills: [],
                        pairedItems: [],
                        pairedProfessions: [],
                        pairedConditions: [],
                        pairedResources: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'political' ? {
                        leaders: "",
                        succedingPolGroup: [],
                        preceedingPolGroup: [],
                        creationTime: "",
                        endTIme: "",
                        headquarters: [],
                        followerName: "",
                        population: "",
                        followers: "",
                        leadingCharacters: [],
                        formGovernment: "",
                        realedTeachings: [],
                        localLanguages: [],
                        connectedRaces: [],
                        localCurrencies: [],
                        pairedConnectedResources: [],
                        description: "",
                        traditions: "",
                        pairedConnectedNotes: [],
                        pairedConnectedMyths: [],
                        governLocations: [],
                        connectedLocations: [],
                        connectedEvents: [],
                        pairedConnectedCultures: [],
                        pairedConnectionCharacter: [],
                        pairedBelongingCharacter: [],
                        pairedAllyCharacter: [],
                        pairedEnemyCharacter: [],
                        pairedConnectedPolGroups: [],
                        pairedAllyPolGroups: [],
                        pairedEnemyPolGroups: [],
                        pairedConnectedOtherGroups: [],
                        pairedAllyOtherGroups: [],
                        pairedEnemyOtherGroups: [],
                        pairedConnectedReligiousGroups: [],
                        pairedAllyReligiousGroups: [],
                        pairedEnemyReligiousGroups: [],
                        pairedConnectedMagicalGroups: [],
                        pairedAllyMagicalGroups: [],
                        pairedEnemyMagicalGroups: [],
                        pairedConnectedTechGroups: [],
                        pairedAllyTechGroups: [],
                        pairedEnemyTechGroups: [],
                        pairedSkills: [],
                        pairedConnectedItems: [],
                        pairedConnectedProfessions: [],
                        pairedConditions: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'occupation' ? {
                        titles: "",
                        features: "",
                        professionType: "",
                        relatedProfessions: [],
                        pairedCharacter: [],
                        relatedCultures: [],
                        pairedUsedSkills: "",
                        pairedUsedItems: "",
                        commonRaces: [],
                        usedResources: [],
                        producedResources: [],
                        statsList: "",
                        description: "",
                        traditions: "",
                        pairedConnectedNotes: [],
                        pairedMyths: [],
                        connectedLocations: [],
                        localLanguages: [],
                        pairedConnectedPolGroups: [],
                        pairedConnectedReligiousGroups: [],
                        pairedConnectedOtherGroups: [],
                        pairedConnectedMagicGroups: [],
                        pairedConnectedTechGroups: [],
                        pairedConnectedSkills: [],
                        pairedConnectedItems: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'species' ? {
                        relatedRaces: [],
                        evolvedIntoRaces: [],
                        evolvedFromRaces: [],
                        memberCount: "",
                        age: "",
                        ageAdult: "",
                        ageOldest: "",
                        height: "",
                        weight: "",
                        beingType: "",
                        sentience: "",
                        pairedCharacter: [],
                        pairedConnectedPlaces: [],
                        relatedCultures: [],
                        localCurrencies: [],
                        localLanguages: [],
                        pairedSkills: [],
                        commonProfessions: [],
                        pairedProducedFromResources: [],
                        pairedUsedResourcesResources: [],
                        statsList: "",
                        strengths: "",
                        weaknesses: "",
                        traits: "",
                        pairedConditionsPositive: [],
                        pairedConditionsNegative: [],
                        pairedConditionsOther: [],
                        commonNames: "",
                        commonFamilyNames: "",
                        description: "",
                        traditions: "",
                        pairedConnectedNotes: [],
                        pairedConnectedMyths: [],
                        connectedEvents: [],
                        pairedConnectedItems: [],
                        pairedConnectedResources: [],
                        commonInPoliticalGroups: [],
                        commonInOtherGroups: [],
                        commonInReligiousGroups: [],
                        commonInMagicGroups: [],
                        commonInTechGroups: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'religious' ? {
                        leaders: "",
                        succedingRelGroup: [],
                        preceedingRelGroup: [],
                        creationTime: "",
                        endTIme: "",
                        headquarters: [],
                        followerName: "",
                        population: "",
                        followers: "",
                        leadingCharacters: [],
                        formReligion: "",
                        typeReligion: "",
                        relatedReligions: [],
                        localLanguages: [],
                        connectedRaces: [],
                        pairedConnectedResources: [],
                        description: "",
                        traditions: "",
                        pairedConnectedNotes: [],
                        pairedConnectedMyths: [],
                        governLocations: [],
                        collectedLocations: [],
                        connectedEvents: [],
                        pairedConnectedCultures: [],
                        pairedConnectionCharacter: [],
                        pairedBelongingCharacter: [],
                        pairedAllyCharacter: [],
                        pairedEnemyCharacter: [],
                        pairedConnectedPolGroups: [],
                        pairedAllyPolGroups: [],
                        pairedEnemyPolGroups: [],
                        pairedConnectedOtherGroups: [],
                        pairedAllyOtherGroups: [],
                        pairedEnemyOtherGroups: [],
                        pairedConnectedReligiousGroups: [],
                        pairedAllyReligoiusGroups: [],
                        pairedEnemyReligiousGroups: [],
                        pairedConnectedMagicGroups: [],
                        pairedAllyMagicGroups: [],
                        pairedEnemyMagicGroups: [],
                        pairedConnectedTechGroups: [],
                        pairedAllyTechGroups: [],
                        pairedEnemyTechGroups: [],
                        pairedSkills: [],
                        pairedConnectedItems: [],
                        pairedConnectedProfessions: [],
                        pairedConditions: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'resource' ? {
                        features: "",
                        priceCurrencies: "",
                        density: "",
                        hardness: "",
                        biomeType: "",
                        rarity: "",
                        resourceType: "",
                        otherStats: "",
                        relatedResources: [],
                        madeIntoResources: [],
                        madeFromResources: [],
                        connectedLocations: [],
                        relatedCultures: [],
                        usedProfessions: [],
                        producedProfessions: [],
                        pairedResourcesRequire: [],
                        pairedResourcesCreate: [],
                        pairedItemMade: [],
                        pairedItemProduced: [],
                        pairedProducedFromRaces: [],
                        pairedUsedResourcesRaces: [],
                        description: "",
                        traditions: "",
                        pairedConnectedNotes: [],
                        pairedMyths: [],
                        pairedCharacter: [],
                        pairedConnectedRaces: [],
                        pairedConditionsPositive: [],
                        pairedConditionsNegative: [],
                        pairedConditionsOther: [],
                        pairedConnectedPoliticalGroups: [],
                        pairedConnectedReligiousGroups: [],
                        pairedConnectedOtherGroups: [],
                        pairedConnectedMagicGroups: [],
                        pairedConnectedTechGroups: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'tech' ? {
                        leaders: "",
                        pairedCharacter: [],
                        succedingTechGroup: [],
                        preceedingTechGroup: [],
                        creationTime: "",
                        endTIme: "",
                        headquarters: [],
                        followerName: "",
                        population: "",
                        followers: "",
                        leadingCharacters: [],
                        typeTech: "",
                        formTech: "",
                        pairedTech: [],
                        pairedSkills: [],
                        pairedConditions: [],
                        pairedConnectedResources: [],
                        connectedRaces: [],
                        localLanguages: [],
                        description: "",
                        traditions: "",
                        pairedConnectedNotes: [],
                        pairedConnectedMyths: [],
                        governLocations: [],
                        connectedLocations: [],
                        connectedEvents: [],
                        pairedConnectedCultures: [],
                        pairedConnectionCharacter: [],
                        pairedBelongingCharacter: [],
                        pairedAllyCharacter: [],
                        pairedEnemyCharacter: [],
                        pairedConnectedPolGroups: [],
                        pairedAllyPolGroups: [],
                        pairedEnemyPolGroups: [],
                        pairedConnectedOtherGroups: [],
                        pairedAllyOtherGroups: [],
                        pairedEnemyOtherGroups: [],
                        pairedConnectedReligiousGroups: [],
                        pairedAllyReligiousGroups: [],
                        pairedEnemyReligiousGroups: [],
                        pairedConnectedMagicalGroups: [],
                        pairedAllyMagicalGroups: [],
                        pairedEnemyMagicalGroups: [],
                        pairedConnectedTechGroups: [],
                        pairedAllyTechGroups: [],
                        pairedEnemyTechGroups: [],
                        pairedConnectedItems: [],
                        pairedConnectedProfessions: [],
                        spoilerNotes: "",
                    } : {}),
                    ...(type === 'ability' ? {
                        statsListRequired: "",
                        statsListProvided: "",
                        traits: "",
                        levelSkill: "",
                        typeSkill: "",
                        pairedSkills: [],
                        prerequisiteSkills: [],
                        postrequisiteSkills: [],
                        pairedItemsCommon: [],
                        pairedItemsUsing: [],
                        pairedItemsRequire: [],
                        pairedItemsCreate: [],
                        pairedConnectedProfessions: [],
                        relatedCultures: [],
                        pairedResourcesRequire: [],
                        pairedResourcesCreate: [],
                        pairedConditionsPositive: [],
                        pairedConditionsNegative: [],
                        pairedConditionsOther: [],
                        description: "",
                        traditions: "",
                        pairedConnectedNotes: [],
                        pairedMyths: [],
                        pairedCharacterSkills: [],
                        pairedLocationsSkills: [],
                        pairedRacesSkills: [],
                        pairedEventSkills: [],
                        pairedEventSpells: [],
                        pairedPoliticalGroupsSkills: [],
                        pairedReligiousGroupsSkills: [],
                        pairedOtherGroupsSkills: [],
                        pairedMagicGroupsSkills: [],
                        pairedTechGroupsSkills: [],
                        spoilerNotes: "",
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

                set((state) => syncWorld(state, {
                    ...state.world,
                    entities: [...state.world.entities, newEntity]
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
                set((state) => {
                    const { drafts, world, editingTabIds } = state;
                    if (!drafts[id]) return state;

                    const draft = { ...drafts[id] };
                    // Safety: An entity can NEVER be its own parent
                    if (draft.parentId === id) {
                        draft.parentId = null;
                    }
                    // Safety: Parent must exist, have the same entity type, and not form a circular loop
                    if (draft.parentId) {
                        const parent = world.entities.find(e => e.id === draft.parentId);
                        if (!parent || parent.type !== draft.type) {
                            draft.parentId = null;
                        } else {
                            let cur: WorldEntity | undefined = parent;
                            const visited = new Set<string>([id]);
                            while (cur && cur.parentId) {
                                if (visited.has(cur.id) || cur.parentId === id) {
                                    draft.parentId = null; // Break circular dependency
                                    break;
                                }
                                visited.add(cur.id);
                                cur = world.entities.find(e => e.id === cur?.parentId);
                            }
                        }
                    }

                    const prevEntity = world.entities.find(e => e.id === id);
                    const savedEntity: WorldEntity = { ...draft, lastModified: Date.now() };

                    // Apply bidirectional relationship synchronization across all connected entities.
                    // Running inside set() guarantees we always operate on the freshest store state.
                    const { entities: syncedEntities, drafts: syncedDrafts } = applyBidirectionalSync(
                        savedEntity,
                        prevEntity,
                        world.entities,
                        drafts
                    );

                    const newDrafts = syncedDrafts ? { ...syncedDrafts } : { ...drafts };
                    delete newDrafts[id];

                    const newEditing = editingTabIds.filter(tid => tid !== id);

                    return {
                        ...syncWorld(state, { ...world, entities: syncedEntities }),
                        drafts: newDrafts,
                        editingTabIds: newEditing
                    };
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
                const { world, drafts, handleCloseTab } = get();
                // Safely reparent any children of the deleted entity so they are NEVER orphaned or lost from the tree
                const safeParent = entity.parentId || null;
                const reparentedEntities = world.entities
                    .filter(e => e.id !== entity.id)
                    .map(e => e.parentId === entity.id ? { ...e, parentId: safeParent } : e);

                // Clean up any bidirectional relation pointers to this deleted entity
                const { entities: cleanedEntities, drafts: cleanedDrafts } = removeEntityRelationsOnDelete(
                    entity.id,
                    reparentedEntities,
                    drafts
                );

                set((state) => ({
                    ...syncWorld(state, {
                        ...state.world,
                        entities: cleanedEntities,
                        trash: [...state.world.trash, { ...entity, lastModified: Date.now() }]
                    }),
                    drafts: cleanedDrafts || state.drafts
                }));
                handleCloseTab(entity.id);
            },
            setWorldPhase: (phase) => {
                set((state) => syncWorld(state, { ...state.world, worldPhase: phase as any }));
            },
            addMapConnection: (sourceId, targetId, type) => {
                const id = crypto.randomUUID();
                set((state) => syncWorld(state, { 
                    ...state.world, 
                    mapConnections: [...(state.world.mapConnections || []), { id, sourceId, targetId, type }] 
                }));
            },
            removeMapConnection: (id) => set((state) => syncWorld(state, {
                ...state.world,
                mapConnections: state.world.mapConnections.filter(c => c.id !== id)
            })),

            updateEntityLock: (id, isReadOnly) => set((state) => syncWorld(state, {
                ...state.world,
                entities: state.world.entities.map(e => 
                    e.id === id ? { ...e, isReadOnly, lastModified: Date.now() } : e
                )
            })),

            updateEntityParent: (entityId, parentId) => set((state) => {
                if (entityId === parentId) return state; // Prevent self-parenting
                return syncWorld(state, {
                    ...state.world,
                    entities: state.world.entities.map(e => 
                        e.id === entityId ? { ...e, parentId } : e
                    )
                });
            }),

            reorderAndReparentEntity: (draggedId, targetId, position, targetType) => set((state) => {
                const { world } = state;
                const dragged = world.entities.find(e => e.id === draggedId);
                if (!dragged) return state;

                // Prevent dragging onto self
                if (targetId && draggedId === targetId) return state;

                if (targetId) {
                    const target = world.entities.find(e => e.id === targetId);
                    if (!target) return state;

                    // STRICT TYPE CHECK: Entities can ONLY belong under or be placed adjacent to the SAME type!
                    if (dragged.type !== target.type) return state;

                    // Circular dependency guard: target cannot be a descendant of dragged
                    let cur: WorldEntity | undefined = target;
                    while (cur && cur.parentId) {
                        if (cur.parentId === draggedId) return state; // Cycle prevented
                        cur = world.entities.find(e => e.id === cur?.parentId);
                    }
                } else if (targetType) {
                    // STRICT TYPE CHECK: Cannot drop onto a different type header!
                    if (dragged.type !== targetType) return state;
                }

                const newEntities = [...world.entities];
                const draggedIdx = newEntities.findIndex(e => e.id === draggedId);
                if (draggedIdx === -1) return state;
                const [removed] = newEntities.splice(draggedIdx, 1);

                const updatedEntity: WorldEntity = { ...removed };

                if (!targetId) {
                    // Dropped onto category / type header (unparent to root of its own type)
                    updatedEntity.parentId = null;
                    newEntities.push(updatedEntity);
                } else {
                    const target = newEntities.find(e => e.id === targetId);
                    if (!target) return state;

                    const targetIdx = newEntities.findIndex(e => e.id === targetId);

                    if (position === 'inside') {
                        updatedEntity.parentId = target.id;
                        newEntities.splice(targetIdx + 1, 0, updatedEntity);
                    } else if (position === 'before') {
                        updatedEntity.parentId = target.parentId || null;
                        newEntities.splice(targetIdx, 0, updatedEntity);
                    } else { // 'after'
                        updatedEntity.parentId = target.parentId || null;
                        newEntities.splice(targetIdx + 1, 0, updatedEntity);
                    }
                }

                return syncWorld(state, {
                    ...world,
                    entities: newEntities
                });
            }),

            // Multi-World Actions
            createWorld: (name, description, mapImage, worldPhase = 'golden') => {
                const newId = crypto.randomUUID();
                const newRealm: WorldData = {
                    id: newId,
                    name: name.trim() || 'Untitled Realm',
                    description: description?.trim() || '',
                    createdAt: Date.now(),
                    lastModified: Date.now(),
                    entities: [],
                    trash: [],
                    mapImage: mapImage || DEFAULT_REALM_MAP,
                    mapConnections: [],
                    worldPhase
                };
                set((state) => ({
                    worlds: [...state.worlds, newRealm],
                    world: newRealm,
                    activeWorldId: newId,
                    openTabIds: [],
                    drafts: {},
                    editingTabIds: [],
                    searchQuery: '',
                    activeTabId: 'dashboard'
                }));
                return newId;
            },

            switchWorld: (worldId) => {
                const state = get();
                const targetWorld = state.worlds.find(w => w.id === worldId);
                if (!targetWorld) return;
                set({
                    world: targetWorld,
                    activeWorldId: targetWorld.id,
                    openTabIds: [],
                    drafts: {},
                    editingTabIds: [],
                    searchQuery: '',
                    activeTabId: 'dashboard'
                });
            },

            duplicateWorld: (worldId, customName) => {
                const source = get().worlds.find(w => w.id === worldId) || get().world;
                const newId = crypto.randomUUID();
                const clonedWorld: WorldData = {
                    ...JSON.parse(JSON.stringify(source)),
                    id: newId,
                    name: customName?.trim() || `${source.name} (Fork)`,
                    createdAt: Date.now(),
                    lastModified: Date.now()
                };
                set((state) => ({
                    worlds: [...state.worlds, clonedWorld],
                    world: clonedWorld,
                    activeWorldId: newId,
                    openTabIds: [],
                    drafts: {},
                    editingTabIds: [],
                    searchQuery: '',
                    activeTabId: 'dashboard'
                }));
                return newId;
            },

            deleteWorld: (worldId) => {
                const state = get();
                if (!state.worlds || state.worlds.length <= 1) {
                    return false;
                }
                const remaining = state.worlds.filter(w => (w.id || '') !== worldId);
                if (remaining.length === state.worlds.length) {
                    return false;
                }
                const isDeletingActive = state.activeWorldId === worldId;
                const nextActive = isDeletingActive ? remaining[0] : state.world;
                set({
                    worlds: remaining,
                    world: nextActive,
                    activeWorldId: nextActive.id,
                    openTabIds: isDeletingActive ? [] : state.openTabIds,
                    drafts: isDeletingActive ? {} : state.drafts,
                    editingTabIds: isDeletingActive ? [] : state.editingTabIds,
                    activeTabId: isDeletingActive ? 'dashboard' : state.activeTabId
                });
                return true;
            },

            updateWorldDetails: (worldId, updates) => {
                set((state) => {
                    const updatedWorlds = state.worlds.map(w => {
                        if (w.id === worldId) {
                            return { ...w, ...updates, lastModified: Date.now() };
                        }
                        return w;
                    });
                    const activeUpdated = state.activeWorldId === worldId
                        ? { ...state.world, ...updates, lastModified: Date.now() }
                        : state.world;
                    return {
                        worlds: updatedWorlds,
                        world: activeUpdated
                    };
                });
            },

            exportWorld: (worldId) => {
                const targetId = worldId || get().activeWorldId;
                const targetWorld = get().worlds.find(w => w.id === targetId) || get().world;
                const blob = new Blob([JSON.stringify(targetWorld, null, 2)], { type: 'application/json' });
                const fileName = `${targetWorld.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_realm_chronicle.json`;
                downloadFileToDevice(blob, fileName, 'application/json');
            },

            exportUniverse: () => {
                const state = get();
                const archive: UniverseArchive = {
                    version: 1,
                    exportedAt: Date.now(),
                    activeWorldId: state.activeWorldId,
                    worlds: state.worlds
                };
                const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
                const fileName = `nexus_universe_archive_${new Date().toISOString().slice(0, 10)}.json`;
                downloadFileToDevice(blob, fileName, 'application/json');
            },

            importWorldData: (payload: any, mode: 'new' | 'replace') => {
                try {
                    // Check if it's a universe archive
                    if (payload && Array.isArray(payload.worlds) && payload.version === 1) {
                        const importedWorlds: WorldData[] = payload.worlds.map((w: any) => ({
                            ...w,
                            id: w.id || crypto.randomUUID(),
                            entities: Array.isArray(w.entities) ? w.entities : [],
                            trash: Array.isArray(w.trash) ? w.trash : [],
                            mapConnections: Array.isArray(w.mapConnections) ? w.mapConnections : [],
                            worldPhase: w.worldPhase || 'golden'
                        }));
                        if (importedWorlds.length === 0) {
                            return { success: false, message: 'Archive contains no valid realms.' };
                        }
                        if (mode === 'replace') {
                            const first = importedWorlds[0];
                            set({
                                worlds: importedWorlds,
                                world: first,
                                activeWorldId: first.id,
                                openTabIds: [],
                                drafts: {},
                                editingTabIds: [],
                                activeTabId: 'dashboard'
                            });
                            return { success: true, message: `Successfully restored ${importedWorlds.length} realms into the archive.`, worldId: first.id };
                        } else {
                            let firstNewId: string | undefined;
                            set((state) => {
                                const newWorlds = [...state.worlds];
                                for (const iw of importedWorlds) {
                                    if (!newWorlds.some(w => w.id === iw.id)) {
                                        newWorlds.push(iw);
                                        if (!firstNewId) firstNewId = iw.id;
                                    } else {
                                        const newId = crypto.randomUUID();
                                        newWorlds.push({ ...iw, id: newId, name: `${iw.name} (Imported)` });
                                        if (!firstNewId) firstNewId = newId;
                                    }
                                }
                                return { worlds: newWorlds };
                            });
                            return { success: true, message: `Appended ${importedWorlds.length} realms to your archive.`, worldId: firstNewId };
                        }
                    }

                    // Single realm JSON
                    if (!payload || !payload.name || !Array.isArray(payload.entities)) {
                        return { success: false, message: 'Invalid realm data format. Must include "name" and "entities".' };
                    }

                    const importedRealm: WorldData = {
                        ...payload,
                        id: mode === 'new' ? crypto.randomUUID() : (payload.id || get().activeWorldId || crypto.randomUUID()),
                        name: payload.name,
                        description: payload.description || '',
                        createdAt: payload.createdAt || Date.now(),
                        lastModified: Date.now(),
                        entities: Array.isArray(payload.entities) ? payload.entities : [],
                        trash: Array.isArray(payload.trash) ? payload.trash : [],
                        mapImage: payload.mapImage || DEFAULT_REALM_MAP,
                        mapConnections: Array.isArray(payload.mapConnections) ? payload.mapConnections : [],
                        worldPhase: payload.worldPhase || 'golden'
                    };

                    if (mode === 'new') {
                        set((state) => ({
                            worlds: [...state.worlds, importedRealm],
                            world: importedRealm,
                            activeWorldId: importedRealm.id,
                            openTabIds: [],
                            drafts: {},
                            editingTabIds: [],
                            activeTabId: 'dashboard'
                        }));
                        return { success: true, message: `Realm "${importedRealm.name}" imported as a new campaign!`, worldId: importedRealm.id };
                    } else {
                        get().setWorld(importedRealm);
                        return { success: true, message: `Realm "${importedRealm.name}" updated successfully!`, worldId: importedRealm.id };
                    }
                } catch (e: any) {
                    return { success: false, message: e?.message || 'Error processing realm file.' };
                }
            },

            handleHealRelations: () => {
                set((state) => {
                    const healedEntities = reconcileAllBidirectionalRelations(state.world.entities);
                    return syncWorld(state, { ...state.world, entities: healedEntities });
                });
            }
        }),
        {
            name: 'nexus-chronicle-storage',
            partialize: (state) => ({
                worlds: state.worlds,
                activeWorldId: state.activeWorldId,
                world: state.world,
                theme: state.theme,
                isWikiMode: state.isWikiMode
            }),
            onRehydrateStorage: () => (state) => {
                if (!state) return;
                let activeId = state.activeWorldId;
                let worlds = state.worlds;
                let currentWorld = state.world;

                if (!currentWorld?.id) {
                    currentWorld = { ...(currentWorld || defaultInitialRealm), id: crypto.randomUUID() };
                }

                if (!Array.isArray(worlds) || worlds.length === 0) {
                    worlds = [currentWorld];
                    activeId = currentWorld.id;
                } else {
                    worlds = worlds.map(w => ({
                        ...w,
                        id: w.id || crypto.randomUUID(),
                        entities: Array.isArray(w.entities) ? w.entities : [],
                        trash: Array.isArray(w.trash) ? w.trash : [],
                        mapConnections: Array.isArray(w.mapConnections) ? w.mapConnections : [],
                        worldPhase: w.worldPhase || 'golden'
                    }));
                    if (!activeId || !worlds.some(w => w.id === activeId)) {
                        activeId = worlds[0].id;
                        currentWorld = worlds[0];
                    } else {
                        const matched = worlds.find(w => w.id === activeId);
                        if (matched) currentWorld = matched;
                    }
                }

                // Automatically heal and reconcile any one-way legacy relationships across all realms
                currentWorld = {
                    ...currentWorld,
                    entities: reconcileAllBidirectionalRelations(currentWorld.entities)
                };
                worlds = worlds.map(w => ({
                    ...w,
                    entities: reconcileAllBidirectionalRelations(w.entities)
                }));

                useWorldStore.setState({
                    worlds,
                    activeWorldId: activeId,
                    world: currentWorld
                });
            }
        }
    )
);

// Auto-sync dev snapshot during local development without any production overhead
if (import.meta.env.DEV && typeof window !== 'undefined') {
    let syncTimer: any = null;
    useWorldStore.subscribe((state) => {
        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(() => {
            try {
                const payload = JSON.stringify({
                    timestamp: new Date().toISOString(),
                    world: state.world,
                    activeWorldId: state.activeWorldId,
                    theme: state.theme,
                    activeTabId: state.activeTabId,
                }, null, 2);
                fetch('/__dev_state', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload
                }).catch(() => { /* silent dev sync */ });
            } catch {
                /* ignore */
            }
        }, 1000);
    });
}

