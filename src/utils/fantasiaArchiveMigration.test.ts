import { describe, it, expect } from 'vitest';
import { zipSync, strToU8 } from 'fflate';
import {
    importFantasiaArchiveProject,
    convertFaDocToEntity,
    parseFaRawFiles,
    FA_TYPE_MAP
} from './fantasiaArchiveMigration';

describe('Fantasia Archive Project Migration', () => {
    it('correctly maps all 20 blueprint types from FA to Nexus Chronicle', () => {
        expect(FA_TYPE_MAP['characters']).toBe('character');
        expect(FA_TYPE_MAP['locations']).toBe('location');
        expect(FA_TYPE_MAP['events']).toBe('event');
        expect(FA_TYPE_MAP['races']).toBe('species');
        expect(FA_TYPE_MAP['items']).toBe('item');
        expect(FA_TYPE_MAP['skills']).toBe('ability');
        expect(FA_TYPE_MAP['professions']).toBe('occupation');
        expect(FA_TYPE_MAP['conditions']).toBe('condition');
        expect(FA_TYPE_MAP['resources']).toBe('resource');
        expect(FA_TYPE_MAP['currencies']).toBe('resource');
        expect(FA_TYPE_MAP['magic']).toBe('magic');
        expect(FA_TYPE_MAP['scienceTechnology']).toBe('science');
        expect(FA_TYPE_MAP['politicalGroups']).toBe('political');
        expect(FA_TYPE_MAP['religions']).toBe('religious');
        expect(FA_TYPE_MAP['guilds']).toBe('organization');
        expect(FA_TYPE_MAP['languages']).toBe('language');
        expect(FA_TYPE_MAP['culture']).toBe('culture');
        expect(FA_TYPE_MAP['loreNotes']).toBe('note');
        expect(FA_TYPE_MAP['myths']).toBe('myth');
        expect(FA_TYPE_MAP['chapters']).toBe('chapter');
    });

    it('parses PouchDB replication stream (NDJSON) and maps document fields', () => {
        const streamData = [
            '{"version":1,"db_type":"pouchdb"}',
            JSON.stringify({
                doc: {
                    _id: 'char_marcus_01',
                    type: 'characters',
                    extraFields: [
                        { id: 'name', value: 'Marcus the Betrayer' },
                        { id: 'description', value: 'Former champion of the Solari Legion.' },
                        { id: 'deadSwitch', value: true },
                        { id: 'finishedSwitch', value: true },
                        { id: 'minorSwitch', value: false },
                        { id: 'tags', value: ['soldier', 'traitor'] },
                        { id: 'otherNames', value: ['The Silver Fox', 'Traitor of Sol'] },
                        { id: 'spoilerNotes', value: 'Poisoned the well before departure.' },
                        {
                            id: 'parentsOfCharacter',
                            value: {
                                value: [{ _id: 'char_aurelius_01', notes: 'Adopted after the fire' }],
                                addedValues: 'Bloodline pact'
                            }
                        }
                    ]
                }
            })
        ].join('\n');

        const { docs } = parseFaRawFiles([{ name: 'characters.txt', content: streamData }]);
        expect(docs).toHaveLength(1);

        const entity = convertFaDocToEntity(docs[0]);
        expect(entity.id).toBe('char_marcus_01');
        expect(entity.name).toBe('Marcus the Betrayer');
        expect(entity.type).toBe('character');
        expect(entity.deadSwitch).toBe(true);
        expect(entity.isDead).toBe(true);
        expect(entity.finishedSwitch).toBe(true);
        expect(entity.isFinished).toBe(true);
        expect(entity.tags).toEqual(['soldier', 'traitor']);
        expect(entity.otherNames).toContain('The Silver Fox');
        expect(entity.privateNotes).toBe('Poisoned the well before departure.');
        expect((entity as any).parentsOfCharacter).toContain('char_aurelius_01');

        // Check contextual relationship notes
        expect(entity.relationalNotes['parentsOfCharacter:char_aurelius_01']).toBe('Adopted after the fire');
    });

    it('maps group affiliations to 5-type groupConnections architecture', () => {
        const faDoc = {
            _id: 'char_senator_01',
            type: 'characters',
            extraFields: [
                { id: 'name', value: 'Senator Vane' },
                {
                    id: 'leadingPoliticalLeaders',
                    value: { value: [{ _id: 'group_sol_senate' }] }
                },
                {
                    id: 'pairedBelongingOtherGroups',
                    value: { value: [{ _id: 'guild_iron_merchants' }] }
                },
                {
                    id: 'pairedEnemyRelGroup',
                    value: { value: [{ _id: 'rel_cult_of_stars' }], addedValues: 'Banned their scriptures' }
                }
            ]
        };

        const entity = convertFaDocToEntity(faDoc);
        expect(entity.groupConnections.political.leadingFigureOf).toContain('group_sol_senate');
        expect(entity.groupConnections.organization.memberOf).toContain('guild_iron_merchants');
        expect(entity.groupConnections.religious.enemyOf).toContain('rel_cult_of_stars');
        expect(entity.relationalNotes['pairedEnemyRelGroup:rel_cult_of_stars']).toBe('Banned their scriptures');
    });

    it('detects circular parent references and safely breaks them', () => {
        const rawFiles: Array<{ name: string; content: string }> = [
            {
                name: 'locations.json',
                content: JSON.stringify({
                    docs: [
                        {
                            _id: 'loc_a',
                            type: 'locations',
                            extraFields: [
                                { id: 'name', value: 'Upper Citadel' },
                                { id: 'parentDoc', value: { value: { _id: 'loc_b' } } }
                            ]
                        },
                        {
                            _id: 'loc_b',
                            type: 'locations',
                            extraFields: [
                                { id: 'name', value: 'High Spire' },
                                { id: 'parentDoc', value: { value: { _id: 'loc_a' } } }
                            ]
                        }
                    ]
                })
            }
        ];

        const result = importFantasiaArchiveProject(rawFiles, 'Test Realm');
        expect(result.success).toBe(true);
        expect(result.entities).toHaveLength(2);

        // Circular loop between loc_a and loc_b should be severed
        const hasSelfLoop = result.entities.some(e => e.parentId === e.id);
        expect(hasSelfLoop).toBe(false);
        const cycleSevered = result.entities.some(e => e.parentId === null);
        expect(cycleSevered).toBe(true);
        expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('automatically establishes reciprocal bidirectional links on import', () => {
        const rawFiles = [
            {
                name: 'family.json',
                content: JSON.stringify([
                    {
                        _id: 'char_father',
                        type: 'characters',
                        extraFields: [
                            { id: 'name', value: 'Aurelius Prime' },
                            { id: 'childOfCharacter', value: { value: [{ _id: 'char_son' }] } }
                        ]
                    },
                    {
                        _id: 'char_son',
                        type: 'characters',
                        extraFields: [
                            { id: 'name', value: 'Marcus Secundus' }
                            // Note: Marcus has no parentsOfCharacter listed in raw file
                        ]
                    }
                ])
            }
        ];

        const result = importFantasiaArchiveProject(rawFiles, 'Bloodline Realm');
        expect(result.success).toBe(true);

        const son = result.entities.find(e => e.id === 'char_son') as any;
        expect(son).toBeDefined();
        // Bidirectional sync must have populated parentsOfCharacter on the son!
        expect(son.parentsOfCharacter).toContain('char_father');
    });

    it('unpacks ZIP archives and reads project metadata from project-data.txt', () => {
        const projectDataTxt = JSON.stringify({
            projectName: 'Sovereign of Sol',
            _id: 'projectSetup'
        });

        const charactersTxt = [
            '{"version":1,"db_type":"pouchdb"}',
            JSON.stringify({
                doc: {
                    _id: 'char_empress',
                    type: 'characters',
                    extraFields: [{ id: 'name', value: 'Empress Lunaria' }]
                }
            })
        ].join('\n');

        const zipData = zipSync({
            'project-data.txt': strToU8(projectDataTxt),
            'characters.txt': strToU8(charactersTxt)
        });

        const result = importFantasiaArchiveProject(
            [{ name: 'Fantasia_Project.zip', content: zipData }],
            'Default Realm'
        );

        expect(result.success).toBe(true);
        expect(result.realmName).toBe('Sovereign of Sol');
        expect(result.entities).toHaveLength(1);
        expect(result.entities[0].name).toBe('Empress Lunaria');
    });
});
