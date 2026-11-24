import { describe, it, expect } from 'vitest';
import { 
    detectContinuityIssues, 
    getEntityContinuityIssues, 
    getContinuitySummary 
} from './continuityDetector';
import { WorldData, Character, Event as WorldEvent, Location } from '../types';

describe('Continuity Conflict Detector', () => {
    it('returns empty array when world has no entities or no conflicts', () => {
        const cleanWorld: WorldData = {
            id: 'clean-realm',
            name: 'Valoria',
            worldPhase: 'golden',
            entities: [
                {
                    id: 'char_1',
                    type: 'character',
                    name: 'Arthur',
                    birthDate: '1000',
                    deathDate: '1070'
                } as Character,
                {
                    id: 'event_1',
                    type: 'event',
                    name: 'Coronation',
                    startDate: '1025',
                    endDate: '1025',
                    pairedCharacter: ['char_1']
                } as WorldEvent
            ]
        } as any;

        const issues = detectContinuityIssues(cleanWorld);
        expect(issues).toHaveLength(0);

        const summary = getContinuitySummary(issues);
        expect(summary.total).toBe(0);
        expect(summary.criticalCount).toBe(0);
    });

    it('detects inverted character lifespan (born after demise)', () => {
        const world: WorldData = {
            id: 'world_1',
            name: 'Chronos',
            entities: [
                {
                    id: 'char_inv',
                    type: 'character',
                    name: 'Merlin Paradox',
                    birthDate: '1500',
                    deathDate: '1420'
                } as Character
            ]
        } as any;

        const issues = detectContinuityIssues(world);
        expect(issues.some(i => i.id.startsWith('inverted-lifespan') && i.severity === 'critical')).toBe(true);
    });

    it('detects inverted event duration (end before start)', () => {
        const world: WorldData = {
            id: 'world_1',
            name: 'Chronos',
            entities: [
                {
                    id: 'ev_inv',
                    type: 'event',
                    name: 'War of Inversion',
                    startDate: '2050',
                    endDate: '2010'
                } as WorldEvent
            ]
        } as any;

        const issues = detectContinuityIssues(world);
        expect(issues.some(i => i.id.startsWith('inverted-event-duration') && i.severity === 'critical')).toBe(true);
    });

    it('detects posthumous event participation', () => {
        const world: WorldData = {
            id: 'world_1',
            name: 'Chronos',
            entities: [
                {
                    id: 'char_dead',
                    type: 'character',
                    name: 'Fallen King',
                    birthDate: '1000',
                    deathDate: '1050'
                } as Character,
                {
                    id: 'ev_future',
                    type: 'event',
                    name: 'Siege of Aethelgard',
                    startDate: '1100',
                    pairedCharacter: ['char_dead']
                } as WorldEvent
            ]
        } as any;

        const issues = detectContinuityIssues(world);
        const posthumous = issues.find(i => i.id.startsWith('posthumous-event-part'));
        expect(posthumous).toBeDefined();
        expect(posthumous?.severity).toBe('warning');
        expect(posthumous?.relatedEntityName).toBe('Fallen King');
    });

    it('detects pre-natal event participation', () => {
        const world: WorldData = {
            id: 'world_1',
            name: 'Chronos',
            entities: [
                {
                    id: 'char_young',
                    type: 'character',
                    name: 'Future Hero',
                    birthDate: '1200',
                    deathDate: '1280'
                } as Character,
                {
                    id: 'ev_past',
                    type: 'event',
                    name: 'Ancient Cataclysm',
                    startDate: '1050',
                    pairedCharacter: ['char_young']
                } as WorldEvent
            ]
        } as any;

        const issues = detectContinuityIssues(world);
        const prenatal = issues.find(i => i.id.startsWith('prenatal-event-part'));
        expect(prenatal).toBeDefined();
        expect(prenatal?.severity).toBe('warning');
    });

    it('detects parent born after or concurrently with child', () => {
        const world: WorldData = {
            id: 'world_1',
            name: 'Chronos',
            entities: [
                {
                    id: 'parent_young',
                    type: 'character',
                    name: 'Young Parent',
                    birthDate: '1050'
                } as Character,
                {
                    id: 'child_old',
                    type: 'character',
                    name: 'Older Child',
                    birthDate: '1020',
                    parentsOfCharacter: ['parent_young']
                } as Character
            ]
        } as any;

        const issues = detectContinuityIssues(world);
        const parentConflict = issues.find(i => i.id.startsWith('parent-born-after-child'));
        expect(parentConflict).toBeDefined();
        expect(parentConflict?.severity).toBe('critical');
    });

    it('detects self-referential kinship paradox', () => {
        const world: WorldData = {
            id: 'world_1',
            name: 'Chronos',
            entities: [
                {
                    id: 'char_self',
                    type: 'character',
                    name: 'Narcissus',
                    parentsOfCharacter: ['char_self']
                } as Character
            ]
        } as any;

        const issues = detectContinuityIssues(world);
        const selfRef = issues.find(i => i.id.startsWith('self-ref-parent'));
        expect(selfRef).toBeDefined();
        expect(selfRef?.severity).toBe('critical');
    });

    it('detects circular ancestry loop (A -> B -> A)', () => {
        const world: WorldData = {
            id: 'world_1',
            name: 'Chronos',
            entities: [
                {
                    id: 'char_a',
                    type: 'character',
                    name: 'Ancestor A',
                    parentsOfCharacter: ['char_b']
                } as Character,
                {
                    id: 'char_b',
                    type: 'character',
                    name: 'Ancestor B',
                    parentsOfCharacter: ['char_a']
                } as Character
            ]
        } as any;

        const issues = detectContinuityIssues(world);
        const cycle = issues.find(i => i.id.startsWith('ancestry-cycle'));
        expect(cycle).toBeDefined();
        expect(cycle?.severity).toBe('critical');
    });

    it('detects deceased character listed as active living resident of a location', () => {
        const world: WorldData = {
            id: 'world_1',
            name: 'Chronos',
            entities: [
                {
                    id: 'char_deceased',
                    type: 'character',
                    name: 'Lord Vaelin',
                    deathDate: '1400',
                    deadSwitch: true
                } as Character,
                {
                    id: 'loc_citadel',
                    type: 'location',
                    name: 'Obsidian Citadel',
                    pairedCurrentCharactersNew: ['char_deceased']
                } as Location
            ]
        } as any;

        const issues = detectContinuityIssues(world);
        const residentIssue = issues.find(i => i.id.startsWith('deceased-current-resident'));
        expect(residentIssue).toBeDefined();
        expect(residentIssue?.severity).toBe('info');
    });

    it('detects dangling links to missing records', () => {
        const world: WorldData = {
            id: 'world_1',
            name: 'Chronos',
            entities: [
                {
                    id: 'char_wanderer',
                    type: 'character',
                    name: 'Lost Wanderer',
                    pairedCurrentLocationNew: ['non_existent_loc_uuid']
                } as Character
            ]
        } as any;

        const issues = detectContinuityIssues(world);
        const dangling = issues.find(i => i.id.startsWith('dangling-ref'));
        expect(dangling).toBeDefined();
        expect(dangling?.category).toBe('broken_link');
    });

    it('correctly filters issues for a single entity via getEntityContinuityIssues', () => {
        const world: WorldData = {
            id: 'world_1',
            name: 'Chronos',
            entities: [
                {
                    id: 'char_x',
                    type: 'character',
                    name: 'Hero X',
                    birthDate: '1500',
                    deathDate: '1400'
                } as Character,
                {
                    id: 'char_y',
                    type: 'character',
                    name: 'Hero Y',
                    birthDate: '1000',
                    deathDate: '1080'
                } as Character
            ]
        } as any;

        const issuesForX = getEntityContinuityIssues('char_x', world);
        expect(issuesForX).toHaveLength(1);
        expect(issuesForX[0].entityId).toBe('char_x');

        const issuesForY = getEntityContinuityIssues('char_y', world);
        expect(issuesForY).toHaveLength(0);
    });

    it('summarizes metrics correctly across categories and severities', () => {
        const issues = [
            { id: '1', severity: 'critical', category: 'lifespan' },
            { id: '2', severity: 'warning', category: 'chronology' },
            { id: '3', severity: 'warning', category: 'event' },
            { id: '4', severity: 'info', category: 'broken_link' },
        ] as any;

        const summary = getContinuitySummary(issues);
        expect(summary.total).toBe(4);
        expect(summary.criticalCount).toBe(1);
        expect(summary.warningCount).toBe(2);
        expect(summary.infoCount).toBe(1);
        expect(summary.byCategory.lifespan).toBe(1);
        expect(summary.byCategory.chronology).toBe(1);
        expect(summary.byCategory.event).toBe(1);
        expect(summary.byCategory.broken_link).toBe(1);
    });
});
