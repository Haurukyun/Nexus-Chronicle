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
                const name = prefilledName || `New ${type.charAt(0).toUpperCase() + type.slice(1)}`;

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
                set({
                    world: {
                        ...world,
                        entities: world.entities.filter(e => e.id !== entity.id),
                        trash: [...world.trash, { ...entity, lastModified: Date.now() }]
                    }
                });
                handleCloseTab(entity.id);
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
