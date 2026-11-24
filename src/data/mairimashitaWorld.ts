import { WorldData, Character, Location, Event, Species, Language, Culture, Chapter, Note, Myth, PoliticalGroup, Religion, Organization, Magic, Tech, Ability, Item, Occupation, Condition, Resource, Currency } from '../types';

/**
 * Mairimashita! Iruma-kun (Welcome to Demon School! Iruma-kun) - Reference Test Realm
 * Complete, rich, lore-accurate universe demonstrating every category and field in Nexus Chronicle.
 */
export const mairimashitaWorld: WorldData = {
  id: 'realm-mairimashita-iruma-kun',
  name: 'Netherworld (Makai) — Babyls Chronicle',
  description: 'The vibrant, chaotic Netherworld (Makai) ruled by demons. At Babyls Demon School, human boy Suzuki Iruma conceals his humanity while forging unbreakable bonds, raising his demon rank, and rising toward the vacant Demon King throne.',
  createdAt: 1700000000000,
  lastModified: 1710000000000,
  worldPhase: 'golden',
  trash: [],
  mapImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
  mapConnections: [
    {
      id: 'conn-babyls-mansion',
      sourceId: 'loc-babyls-school',
      targetId: 'loc-sullivan-mansion',
      type: 'magic',
      label: 'Grand Flying Carriage Way'
    },
    {
      id: 'conn-babyls-walter',
      sourceId: 'loc-babyls-school',
      targetId: 'loc-walter-park',
      type: 'trade',
      label: 'Magical Transit Rail'
    }
  ],
  sidebarGroupOrder: ['story', 'world', 'groups', 'details'],
  hiddenFields: {},
  factionRelations: [
    {
      id: 'rel-seitokai-misfits',
      factionAId: 'pol-babyls-student-council',
      factionBId: 'org-misfit-class',
      tension: 75,
      notes: 'Ameri secretly protects and supervises the Abnormal Class.',
      lastUpdated: 1710000000000
    },
    {
      id: 'rel-sixfingers-crowns',
      factionAId: 'rel-six-fingers',
      factionBId: 'pol-thirteen-crowns',
      tension: -90,
      notes: 'The Six Fingers conspire under Baal to overthrow the Thirteen Crowns and revert Makai to primordial chaos.',
      lastUpdated: 1710000000000
    }
  ],
  sessionLogs: [
    {
      id: 'sess-harvest-festival-climax',
      sessionNumber: 1,
      realDate: '2024-03-15',
      inGameDate: 'Year 667, Month of Demon',
      title: 'Harvest Festival Climax: Bloom of the Legend Leaf',
      summary: 'Iruma and Shax Lied secure the Seed of the Legendary Leaf and bloom the colossal World Tree, earning the title of Young King.',
      characterIds: ['char-iruma-suzuki', 'char-asmodeus-alice', 'char-valac-clara', 'char-azazel-ameri'],
      locationIds: ['loc-babyls-school'],
      milestones: ['Ameri awarded Iruma Daleth (Rank 4)', 'Naberius Kallego acknowledged the triumph'],
      createdAt: 1700000000000,
      lastModified: 1710000000000
    }
  ],
  plotThreads: [
    {
      id: 'plot-demon-king-succession',
      title: 'The Prophecy of the Demon King',
      status: 'open',
      description: 'Who will succeed Derkila? The missing Demon King left behind his Royal One, the Ring of Solomon, and a prophecy awaiting one from another realm.',
      linkedEntityIds: ['char-iruma-suzuki', 'item-solomon-ring', 'myth-demon-king-derkila', 'pol-thirteen-crowns'],
      clues: [],
      createdAt: 1700000000000,
      lastModified: 1710000000000
    }
  ],
  entities: [
    // ==========================================
    // 1. STORY / LORE: CHAPTERS
    // ==========================================
    {
      id: 'chap-1-demon-school',
      name: 'Act I: Iruma-kun at Demon School',
      type: 'chapter',
      tags: ['arc', 'babyls', 'origin'],
      description: 'Human youth Suzuki Iruma is sold to Lord Sullivan, enters Babyls Demon School, accidentally recites the forbidden taboo spell Cherusil, and defeats Asmodeus Alice in a duel.',
      lastModified: 1710000000000,
      order: '1',
      eventIds: ['evt-ceremony-duel'],
      locationIds: ['loc-babyls-school'],
      spoilerNotes: 'Iruma’s crisis evasion reflex makes him untouchable even to noble flame magic.'
    } as Chapter,
    {
      id: 'chap-2-royal-one',
      name: 'Act II: The Misfit Class & Royal One',
      type: 'chapter',
      tags: ['arc', 'misfits', 'derkila'],
      description: 'Facing eviction and disbelief, the Misfit Class unites to secure approval from every faculty professor to reopen the Royal One, the legendary chamber of Demon King Derkila.',
      lastModified: 1710000000000,
      order: '2',
      locationIds: ['loc-royal-one'],
      spoilerNotes: 'Kallego placed nearly impossible requirements, but Iruma’s wicked phase unlocked collective demonic motivation.'
    } as Chapter,

    // ==========================================
    // 1. STORY / LORE: LORE NOTES
    // ==========================================
    {
      id: 'note-demon-king-prophecy',
      name: 'The Demon King Prophecy',
      type: 'note',
      tags: ['prophecy', 'royalty', 'lore'],
      description: 'Ancient decree inscribed upon the Netherworld obelisk regarding the ascension of the next Demon King: "He shall make all demons his servants, he shall heal all demonkind, he descends from an otherworldly realm, wearing the golden ring of Solomon..."',
      lastModified: 1710000000000,
      pairedConnectedCharacter: ['char-iruma-suzuki'],
      pairedConnectedItems: ['item-solomon-ring'],
      spoilerNotes: 'Every single line matches Iruma’s exact circumstances as a human from Earth.'
    } as Note,
    {
      id: 'note-wicked-phase',
      name: 'Wicked Phase (Evil Cycle) Anatomy',
      type: 'note',
      tags: ['biology', 'stress', 'instinct'],
      description: 'A biological safety release mechanism in demons. When stress accumulates beyond normal thresholds, a demon enters their Evil Cycle, amplifying destructive impulses, mana potency, and ruthless charisma.',
      lastModified: 1710000000000,
      pairedConditionsOther: ['cond-wicked-phase'],
      spoilerNotes: 'Ali-san simulated a false Wicked Phase inside Iruma using the Ring of Gluttony.'
    } as Note,

    // ==========================================
    // 1. STORY / LORE: MYTHS / LEGENDS
    // ==========================================
    {
      id: 'myth-demon-king-derkila',
      name: 'The Legend of Demon King Derkila',
      type: 'myth',
      tags: ['myth', 'derkila', 'legend'],
      description: 'The supreme ruler who unified the Netherworld through charismatic whimsy, boundless mana, and awe-inspiring magic. Hundreds of years ago, Derkila vanished without naming an heir, leaving Makai in an uneasy peace presided over by the 13 Crowns.',
      lastModified: 1710000000000,
      pairedConnectedLocations: ['loc-royal-one'],
      spoilerNotes: 'Derkila’s mana residue still lives inside the Ring of Solomon and within Babyls itself.'
    } as Myth,
    {
      id: 'myth-origin-solomon-ring',
      name: 'The Genesis of the Ring of Gluttony',
      type: 'myth',
      tags: ['relic', 'solomon', 'gluttony'],
      description: 'Forged during the primordial era of Makai, this ravenous ring feeds relentlessly on magical aura and can expand into the avatar Alicred. Said to choose only the prophesied bearer.',
      lastModified: 1710000000000,
      pairedConnectedItems: ['item-solomon-ring'],
      spoilerNotes: 'Alicred (Ali-san) is an anagram for Derkila.'
    } as Myth,

    // ==========================================
    // 2. WORLD: CHARACTERS
    // ==========================================
    {
      id: 'char-iruma-suzuki',
      name: 'Suzuki Iruma',
      type: 'character',
      tags: ['protagonist', 'human', 'student', 'misfits'],
      otherNamesAndEpithets: 'Iruma-kun, Irumi, Young King',
      titles: 'Grandson of Sullivan, Rank He (5), Young King of Harvest Festival',
      sex: 'Male',
      age: '15',
      height: '158 cm',
      weight: '49 kg',
      birthDate: 'October 4',
      deathDate: '',
      isDead: false,
      deadSwitch: false,
      powerLevel: 'Rank 5 (He)',
      statBlockMode: 'rpg-d20',
      stats: {
        strength: '12 (+1)',
        dexterity: '20 (+5)',
        constitution: '16 (+3)',
        intelligence: '14 (+2)',
        wisdom: '18 (+4)',
        charisma: '19 (+4)'
      },
      customStats: [
        { id: 'cs-evasion', label: 'Crisis Evasion', value: '100', max: '100' },
        { id: 'cs-mana', label: 'Ring Mana Charge', value: '85', max: '100' },
        { id: 'cs-appetite', label: 'Feast Capacity', value: '999', max: '1000' }
      ],
      personalityTraits: 'Overwhelming kindness, inability to refuse requests ("Please, I beg of you!"), godlike evasion instinct, boundless appetite.',
      traits: 'No demonic horns or wings; wears the golden Ring of Solomon on his right hand.',
      description: 'A 15-year-old human sold by his negligent parents to the demon lord Sullivan. Welcomed as Sullivan’s cherished grandson, Iruma attends Babyls Demon School under strict warning that demons will devour him if his human identity is revealed. Through boundless empathy and sheer survival reflex, he wins over rival demons and repeatedly shifts the fate of the Netherworld.',
      notes: 'Mastered demonic archery under Bachiko Barbatos.',
      privateNotes: 'Human blood heals demons instantly, as revealed during the Guardian of the Cut exam.',
      spoilerNotes: 'The Ring of Solomon contains Alicred, who shares a direct bond with Derkila’s legacy.',
      pairedRace: ['spc-human'],
      pairedProfession: ['occ-babyls-student'],
      pairedCurrentLocationNew: ['loc-sullivan-mansion'],
      pairedOriginLocationNew: ['loc-human-world'],
      allyResCharacter: ['char-asmodeus-alice', 'char-valac-clara', 'char-azazel-ameri', 'char-sullivan'],
      enemydResCharacter: ['char-kiriwo-amy'],
      pairedBelongingOtherGroups: ['org-misfit-class', 'org-magitools-battler'],
      pairedConnectedItems: ['item-solomon-ring', 'item-hatsukoi-memory'],
      pairedSkills: ['abl-cherusil', 'abl-pandoroola'],
      pairedConditionsPositive: ['cond-absolute-evasion'],
      pairedConditionsOther: ['cond-wicked-phase'],
      coordinates: { x: 380, y: 440 }
    } as Character,
    {
      id: 'char-asmodeus-alice',
      name: 'Asmodeus Alice (Azz-kun)',
      type: 'character',
      tags: ['noble', 'fire', 'valedictorian', 'misfits'],
      otherNamesAndEpithets: 'Azz-kun, Flame of Asmodeus',
      titles: 'Valedictorian of Freshman Class, Rank Daleth (4)',
      sex: 'Male',
      age: '15',
      height: '178 cm',
      weight: '62 kg',
      birthDate: 'June 6',
      powerLevel: 'Rank 4 (Daleth)',
      statBlockMode: 'rpg-d20',
      stats: {
        strength: '16 (+3)',
        dexterity: '18 (+4)',
        constitution: '15 (+2)',
        intelligence: '18 (+4)',
        wisdom: '14 (+2)',
        charisma: '18 (+4)'
      },
      personalityTraits: 'Fiercely dignified, aristocratic, fanatically loyal to Iruma, explosive temper toward anyone who disrespects his master.',
      traits: 'Silky pink-lilac hair, noble crimson coat, aristocratic flame aura.',
      description: 'The genius scion of the noble Asmodeus family. Defeated by Iruma in a German suplex duel during the entrance ceremony, he pledged eternal fealty to Iruma as his sworn lord and closest confidant.',
      pairedRace: ['spc-demon'],
      pairedProfession: ['occ-babyls-student'],
      pairedCurrentLocationNew: ['loc-babyls-school'],
      allyResCharacter: ['char-iruma-suzuki', 'char-valac-clara'],
      pairedBelongingOtherGroups: ['org-misfit-class'],
      pairedSkills: ['abl-phoenix-blast'],
      coordinates: { x: 420, y: 460 }
    } as Character,
    {
      id: 'char-valac-clara',
      name: 'Valac Clara',
      type: 'character',
      tags: ['chaos', 'bloodline', 'misfits'],
      otherNamesAndEpithets: 'Clara-chan, Chaos Gremlin',
      titles: 'Rank Daleth (4), Valac Troublemaker',
      sex: 'Female',
      age: '15',
      height: '155 cm',
      weight: '45 kg',
      birthDate: 'May 5',
      powerLevel: 'Rank 4 (Daleth)',
      statBlockMode: 'custom',
      customStats: [
        { id: 'cs-chaos', label: 'Chaos Energy', value: '100', max: '100' },
        { id: 'cs-pocket', label: 'Toybox Replicas', value: '1000', max: '1000' }
      ],
      personalityTraits: 'Inexhaustible energy, erratic, eccentric, unconditionally affectionate, playful.',
      traits: 'Two sentient green slippers named Connor and Murf on her feet; dual apron pockets that replicate anything seen.',
      description: 'A green-haired demon girl from the eccentric Valac clan. Shunned by others as an annoying weirdo until Iruma accepted her unconditionally without exploiting her Toy Box bloodline ability.',
      pairedRace: ['spc-demon'],
      pairedProfession: ['occ-babyls-student'],
      pairedCurrentLocationNew: ['loc-babyls-school'],
      allyResCharacter: ['char-iruma-suzuki', 'char-asmodeus-alice'],
      pairedBelongingOtherGroups: ['org-misfit-class'],
      coordinates: { x: 340, y: 460 }
    } as Character,
    {
      id: 'char-azazel-ameri',
      name: 'Azazel Ameri',
      type: 'character',
      tags: ['student-council', 'president', 'manga-lover'],
      otherNamesAndEpithets: 'Student Council President, Noble Fox',
      titles: 'President of Babyls Student Council, Rank Vav (6)',
      sex: 'Female',
      age: '17',
      height: '190 cm',
      weight: '68 kg',
      birthDate: 'July 19',
      powerLevel: 'Rank 6 (Vav)',
      statBlockMode: 'rpg-d20',
      stats: {
        strength: '19 (+4)',
        dexterity: '16 (+3)',
        constitution: '18 (+4)',
        intelligence: '16 (+3)',
        wisdom: '15 (+2)',
        charisma: '20 (+5)'
      },
      personalityTraits: 'Stern, commanding, heroic, secretly romantic, swoons over shojo manga read to her by Iruma.',
      traits: 'Tall, imposing demonic stature with reddish-orange fox ears, golden eyes, and horned mantle.',
      description: 'The formidable president of the Babyls Student Council. Discovered Iruma’s human literacy and uses secret reading sessions of the forbidden human scripture "First Love Memories" as private dates.',
      pairedRace: ['spc-demon'],
      pairedProfession: ['occ-babyls-student'],
      pairedCurrentLocationNew: ['loc-babyls-school'],
      allyResCharacter: ['char-iruma-suzuki'],
      pairedBelongingPolGroup: ['pol-babyls-student-council'],
      pairedConnectedItems: ['item-hatsukoi-memory'],
      coordinates: { x: 450, y: 390 }
    } as Character,
    {
      id: 'char-sullivan',
      name: 'Lord Sullivan',
      type: 'character',
      tags: ['headmaster', 'thirteen-crowns', 'grandfather'],
      otherNamesAndEpithets: 'Grandpa, Archdemon Sullivan',
      titles: 'Headmaster of Babyls, Three Great Demons, Rank Tet (9)',
      sex: 'Male',
      age: 'Centuries old',
      height: '160 cm',
      weight: '55 kg',
      powerLevel: 'Rank 9 (Tet)',
      personalityTraits: 'Doting, ecstatic grandfather to Iruma, goofy, yet possesses chilling, godlike authority as one of the Three Great Demons.',
      traits: 'Small bald demon with curved goat horns and grand purple robes, capable of halting time itself.',
      description: 'One of the Three Great Demons of the Netherworld and candidate for the Demon King throne. Bought Iruma’s contract from human parents to fulfill his lifelong dream of having a doting grandson.',
      pairedRace: ['spc-demon'],
      pairedProfession: ['occ-babyls-professor'],
      pairedCurrentLocationNew: ['loc-sullivan-mansion'],
      relativesOfCharacter: ['char-iruma-suzuki'],
      pairedBelongingPolGroup: ['pol-thirteen-crowns'],
      coordinates: { x: 260, y: 310 }
    } as Character,
    {
      id: 'char-kallego-naberius',
      name: 'Naberius Kallego',
      type: 'character',
      tags: ['faculty', 'strict', 'familiar'],
      otherNamesAndEpithets: 'Guard Dog of Babyls, Fluffy Chick Familiar',
      titles: 'Head Teacher of Babyls, Rank Cheth (8)',
      sex: 'Male',
      age: '32',
      height: '182 cm',
      powerLevel: 'Rank 8 (Cheth)',
      personalityTraits: 'Strict, solemn, obsessed with discipline and protocol, utterly hates chaos, constantly frustrated by Iruma.',
      traits: 'Sharp dark suit, slicked black hair; transforms into a cute round winged chick when summoned as Iruma’s familiar.',
      description: 'The terrifying chief educator of Babyls who became Iruma’s summoned familiar by accident due to Iruma using Sullivan’s crest blood paper.',
      pairedRace: ['spc-demon'],
      pairedProfession: ['occ-babyls-professor'],
      pairedCurrentLocationNew: ['loc-babyls-school'],
      allyResCharacter: ['char-sullivan'],
      complicatedResCharacter: ['char-iruma-suzuki'],
      coordinates: { x: 390, y: 380 }
    } as Character,

    // ==========================================
    // 2. WORLD: LOCATIONS
    // ==========================================
    {
      id: 'loc-babyls-school',
      name: 'Babyls Demon School',
      type: 'location',
      tags: ['academy', 'makai', 'primary'],
      locationType: 'Magical Academy',
      population: '6,666 Students & Faculty',
      size: 'Massive Floating Mountain Spire',
      creationTime: 'Era of Derkila',
      traits: 'Soaring spires, gothic ramparts, flying arenas, protected by barrier wards.',
      description: 'The most prestigious institution of higher education in the Netherworld, educating young demons through rigorous curricula, battler activities, and ranking exams.',
      pairedCurrentCharactersNew: ['char-iruma-suzuki', 'char-asmodeus-alice', 'char-valac-clara', 'char-azazel-ameri', 'char-kallego-naberius'],
      governOther: ['org-misfit-class', 'pol-babyls-student-council'],
      neighbourLocations: ['loc-royal-one', 'loc-sullivan-mansion'],
      coordinates: { x: 400, y: 400 }
    } as Location,
    {
      id: 'loc-royal-one',
      name: 'The Royal One',
      type: 'location',
      tags: ['sanctum', 'derkila', 'classroom'],
      locationType: 'Demon King Sanctum & Classroom',
      population: '13 Students (Misfits)',
      size: 'Grand Obsidian Hall',
      creationTime: 'Pre-Vanishing Era',
      traits: 'Gilded stained glass, massive throne, Derkila’s lingering magical signature.',
      description: 'The legendary classroom of Demon King Derkila, sealed for centuries until the Misfit Class earned the right to occupy it.',
      pairedCurrentCharactersNew: ['char-iruma-suzuki', 'char-asmodeus-alice', 'char-valac-clara'],
      governOther: ['org-misfit-class'],
      connectedLocations: ['loc-babyls-school'],
      coordinates: { x: 420, y: 410 }
    } as Location,
    {
      id: 'loc-walter-park',
      name: 'Walter Park & Uraboros Prison',
      type: 'location',
      tags: ['amusement', 'prison', 'fortress'],
      locationType: 'Magical Theme Park & Subterranean Fortress',
      population: 'Tens of thousands of visitors',
      size: 'Sprawling Megaplex',
      creationTime: 'Modern Makai Era',
      traits: 'Fabulous rollercoasters and attractions above; high-security subterranean prison Uraboros below.',
      description: 'A colossal entertainment complex created by the Walter corporation, targeted in a coordinated assault by the Six Fingers terrorist cell.',
      pairedConnectedCharacter: ['char-iruma-suzuki', 'char-asmodeus-alice'],
      governReligious: ['rel-six-fingers'],
      coordinates: { x: 620, y: 550 }
    } as Location,
    {
      id: 'loc-sullivan-mansion',
      name: 'Sullivan’s Estate',
      type: 'location',
      tags: ['residence', 'luxury', 'sanctuary'],
      locationType: 'Grand Aristocratic Castle',
      population: 'Sullivan, Opera, Iruma, and household staff',
      size: 'Multi-tiered Palace and Grounds',
      creationTime: 'Ancient Makai Era',
      traits: 'Extravagant chambers, endless feasts prepared by Opera, protected by high-tier wards.',
      description: 'The serene and grand residence of Lord Sullivan where Iruma spends his tranquil domestic life.',
      pairedCurrentCharactersNew: ['char-iruma-suzuki', 'char-sullivan'],
      connectedLocations: ['loc-babyls-school'],
      coordinates: { x: 250, y: 300 }
    } as Location,

    // ==========================================
    // 2. WORLD: EVENTS
    // ==========================================
    {
      id: 'evt-ceremony-duel',
      name: 'Babyls Entrance Ceremony & Suplex Duel',
      type: 'event',
      tags: ['ceremony', 'duel', 'turning-point'],
      eventType: 'Formal Academic Duel',
      startDate: 'Year 666, Spring Day 1',
      endDate: 'Year 666, Spring Day 1',
      participants: 'Entire Freshman Cohort',
      color: '#e11d48',
      description: 'Iruma chants Sullivan’s written taboo spell Cherusil upon the podium without stumbling, provoking valedictorian Asmodeus Alice to challenge him to a duel. Iruma evades all fireballs and accidentally German-suplexes Asmodeus.',
      pairedCharacter: ['char-iruma-suzuki', 'char-asmodeus-alice'],
      pairedLocations: ['loc-babyls-school'],
      pairedSkills: ['abl-cherusil']
    } as Event,
    {
      id: 'evt-harvest-festival',
      name: 'The Babyls Harvest Festival (Shukakusai)',
      type: 'event',
      tags: ['exam', 'survival', 'tournament'],
      eventType: '66-Hour Wilderness Survival Exam',
      startDate: 'Year 667, Autumn Day 10',
      endDate: 'Year 667, Autumn Day 13',
      participants: 'All First-Year Students',
      color: '#eab308',
      description: 'First-year students are cast into the treacherous Babyls forest to gather survival points. Iruma and Shax Lied cultivate the mythical Legendary Leaf, blossoming it into the World Tree.',
      pairedCharacter: ['char-iruma-suzuki', 'char-asmodeus-alice', 'char-valac-clara'],
      pairedLocations: ['loc-babyls-school'],
      pairedItems: ['res-legendary-leaf-seed']
    } as Event,
    {
      id: 'evt-walter-park-incident',
      name: 'The Walter Park Siege',
      type: 'event',
      tags: ['attack', 'terror', 'defense'],
      eventType: 'Terrorist Infiltration & Defense Battle',
      startDate: 'Year 666, Summer Break',
      endDate: 'Year 666, Summer Break',
      participants: 'The Six Fingers, Misfit Class, Babyls Teachers',
      color: '#7c3aed',
      description: 'The Six Fingers orchestrate a diversion with three giant fusion composite beasts while breaking out Kiriwo from Uraboros prison. Iruma absorbs a mountain-destroying flare using the Ring of Gluttony.',
      pairedCharacter: ['char-iruma-suzuki', 'char-asmodeus-alice'],
      pairedLocations: ['loc-walter-park'],
      pairedItems: ['item-solomon-ring']
    } as Event,

    // ==========================================
    // 2. WORLD: SPECIES / RACES
    // ==========================================
    {
      id: 'spc-demon',
      name: 'Demon (Akuma)',
      type: 'species',
      tags: ['native', 'mana', 'dominant'],
      description: 'The sentient humanoid inhabitants of the Netherworld. Characterized by horns, bat-like wings, spade tails, distinct bloodline abilities, and internal mana cores.',
      lastModified: 1710000000000,
      pairedConnectedCharacter: ['char-asmodeus-alice', 'char-valac-clara', 'char-azazel-ameri', 'char-sullivan', 'char-kallego-naberius'],
      pairedConnectedLocations: ['loc-babyls-school', 'loc-sullivan-mansion']
    } as Species,
    {
      id: 'spc-human',
      name: 'Human (Ningen)',
      type: 'species',
      tags: ['mythical', 'forbidden', 'otherworld'],
      description: 'Extradimensional beings from the Human World. In demon lore, humans are considered mythical delicacies, but human blood actually possesses extraordinary healing and life-restoration properties.',
      lastModified: 1710000000000,
      pairedConnectedCharacter: ['char-iruma-suzuki'],
      spoilerNotes: 'Demon society sings the Babyls school anthem boasting about devouring humans.'
    } as Species,

    // ==========================================
    // 2. WORLD: LANGUAGES
    // ==========================================
    {
      id: 'lang-makai-script',
      name: 'Demonic Script (Makai-go)',
      type: 'language',
      tags: ['official', 'runes', 'magic'],
      description: 'The universal language and glyph writing system of the Netherworld, employed for spell formulas, textbooks, and royal edicts.',
      lastModified: 1710000000000,
      pairedConnectedLocations: ['loc-babyls-school']
    } as Language,
    {
      id: 'lang-japanese-human',
      name: 'Human Tongue (Japanese)',
      type: 'language',
      tags: ['human', 'secret', 'manga'],
      description: 'The native tongue of Suzuki Iruma. Unreadable to demons except through Iruma’s vocal translation of "First Love Memories".',
      lastModified: 1710000000000,
      pairedConnectedCharacter: ['char-iruma-suzuki', 'char-azazel-ameri'],
      pairedConnectedItems: ['item-hatsukoi-memory']
    } as Language,

    // ==========================================
    // 2. WORLD: CULTURES / ARTS
    // ==========================================
    {
      id: 'cul-demonic-nobility',
      name: 'The 13 Ranks of Demonic Nobility (Alef to Yodh)',
      type: 'culture',
      tags: ['hierarchy', 'ranks', 'social'],
      description: 'The foundational social hierarchy of Makai, ranking demons from Rank 1 (Alef) to Rank 10 (Yodh / Demon King) based on power, ambition, and merit.',
      lastModified: 1710000000000,
      pairedConnectedCharacter: ['char-iruma-suzuki', 'char-sullivan']
    } as Culture,
    {
      id: 'cul-battler-culture',
      name: 'Demonic Battler Culture (Clubs & Fraternities)',
      type: 'culture',
      tags: ['school', 'clubs', 'battler'],
      description: 'Tradition within Babyls where students form collaborative Battlers to pursue specialized magical apparatus research, broadcast journalism, or student leadership.',
      lastModified: 1710000000000,
      pairedConnectedLocations: ['loc-babyls-school']
    } as Culture,

    // ==========================================
    // 3. GROUPS / TEACHINGS: POLITICAL
    // ==========================================
    {
      id: 'pol-thirteen-crowns',
      name: 'The Thirteen Crowns (13-nin no Kanmuri)',
      type: 'political',
      tags: ['government', 'rulers', 'crowns'],
      description: 'The high council of 13 paramount demon lords presiding over Netherworld governance, law, and defense in the continued absence of the Demon King.',
      lastModified: 1710000000000,
      leadingCharacters: ['char-sullivan'],
      governLocations: ['loc-babyls-school']
    } as PoliticalGroup,
    {
      id: 'pol-babyls-student-council',
      name: 'Babyls Student Council (Seitokai)',
      type: 'political',
      tags: ['students', 'order', 'leadership'],
      description: 'The elite student administrative and disciplinary organization at Babyls led by Azazel Ameri, maintaining order with steel resolve.',
      lastModified: 1710000000000,
      leadingCharacters: ['char-azazel-ameri'],
      connectedLocations: ['loc-babyls-school']
    } as PoliticalGroup,

    // ==========================================
    // 3. GROUPS / TEACHINGS: RELIGIOUS
    // ==========================================
    {
      id: 'rel-devotees-derkila',
      name: 'Devotees of the Missing King (Derkila’s Will)',
      type: 'religious',
      tags: ['tradition', 'messianic', 'royal'],
      description: 'Traditionalists throughout the Netherworld who honor the memory of Derkila and patiently await the prophesied bearer of Solomon’s Ring.',
      lastModified: 1710000000000,
      pairedConnectedMyths: ['myth-demon-king-derkila']
    } as Religion,
    {
      id: 'rel-six-fingers',
      name: 'The Six Fingers (Roku-shiki)',
      type: 'religious',
      tags: ['cult', 'terrorist', 'chaos'],
      description: 'Fanatical syndicate operating in the shadows of Makai under Lord Baal, striving to dismantle peace and return all demons to their chaotic primordial origins.',
      lastModified: 1710000000000,
      pairedEnemyOtherGroups: ['org-misfit-class', 'pol-thirteen-crowns'],
      connectedLocations: ['loc-walter-park']
    } as Religion,

    // ==========================================
    // 3. GROUPS / TEACHINGS: ORGANIZATIONS
    // ==========================================
    {
      id: 'org-misfit-class',
      name: 'The Misfit Class (Abnormal Class)',
      type: 'organization',
      tags: ['class', 'misfits', 'royal-one'],
      description: 'Babyls Class 1-A, consisting of 13 eccentric, rebellious, yet extraordinarily talented demons who earned residency in the sacred Royal One.',
      lastModified: 1710000000000,
      leadingCharacters: ['char-iruma-suzuki'],
      pairedBelongingCharacter: ['char-iruma-suzuki', 'char-asmodeus-alice', 'char-valac-clara'],
      connectedLocations: ['loc-royal-one']
    } as Organization,
    {
      id: 'org-magitools-battler',
      name: 'Magical Apparatus Battler (Magitools)',
      type: 'organization',
      tags: ['battler', 'invention', 'research'],
      description: 'A student club founded to innovate magical apparatus, allowing demons with low mana capacity to cast advanced spells through clever engineering.',
      lastModified: 1710000000000,
      pairedBelongingCharacter: ['char-iruma-suzuki'],
      connectedLocations: ['loc-babyls-school']
    } as Organization,

    // ==========================================
    // 3. GROUPS / TEACHINGS: MAGIC GROUPS
    // ==========================================
    {
      id: 'mag-sullivan-circle',
      name: 'Sullivan’s Arcane Circle',
      type: 'magic',
      tags: ['archmages', 'high-sorcery', 'temporal'],
      description: 'The ancient esoteric circle of elder mages capable of planetary-scale spatial barriers, absolute matter transfiguration, and temporal distortion.',
      lastModified: 1710000000000,
      leadingCharacters: ['char-sullivan']
    } as Magic,
    {
      id: 'mag-bloodline-circle',
      name: 'Bloodline Magic Heritage Guild',
      type: 'magic',
      tags: ['bloodline', 'clans', 'lineage'],
      description: 'The collective families guarding their hereditary magic (Asmodeus pyrokinesis, Valac toy creation, Azazel physical augmentation).',
      lastModified: 1710000000000,
      pairedConnectedRaces: ['spc-demon']
    } as Magic,

    // ==========================================
    // 3. GROUPS / TEACHINGS: SCIENCE GROUPS
    // ==========================================
    {
      id: 'sci-beastology-dept',
      name: 'Demon World Ecology & Beastology Division',
      type: 'science',
      tags: ['ecology', 'chimeras', 'familiars'],
      description: 'Babyls research department dedicated to documenting chimeric monsters, valley dragons, and familiar summoning pacts.',
      lastModified: 1710000000000,
      connectedLocations: ['loc-babyls-school']
    } as Tech,
    {
      id: 'sci-botany-dept',
      name: 'Netherworld Botanical Institute',
      type: 'science',
      tags: ['botany', 'flora', 'legendary-leaf'],
      description: 'Scientists cataloging hazardous carnivorous plants and mythical arboreal seeds throughout the diverse Makai wilderness.',
      lastModified: 1710000000000,
      connectedLocations: ['loc-babyls-school']
    } as Tech,

    // ==========================================
    // 3. GROUPS / TEACHINGS: TECHNOLOGIES
    // ==========================================
    {
      id: 'tech-gyphone',
      name: 'Demonic Communicator (Gyphone)',
      type: 'tech',
      tags: ['communications', 'smartphone', 'gadget'],
      description: 'Magical handheld smartphones featuring bat wings and demonic antennas, widely used across Makai for text messaging, devilnet browsing, and streaming.',
      lastModified: 1710000000000,
      connectedLocations: ['loc-babyls-school', 'loc-sullivan-mansion']
    } as Tech,
    {
      id: 'tech-barrier-generators',
      name: 'Babyls Aegis Ward Generators',
      type: 'tech',
      tags: ['defense', 'wards', 'shields'],
      description: 'Massive arcane pylons encircling Babyls to repel wild valley beasts and neutralize aerial intrusions.',
      lastModified: 1710000000000,
      connectedLocations: ['loc-babyls-school']
    } as Tech,

    // ==========================================
    // 4. DETAILS: SKILLS / SPELLS
    // ==========================================
    {
      id: 'abl-cherusil',
      name: 'Cherusil (Transmutation Chant)',
      type: 'ability',
      tags: ['spell', 'chant', 'taboo'],
      typeSkill: 'Matter Transmutation',
      levelSkill: 'Taboo / Forbidden',
      description: 'An ancient chant of absolute transfiguration. If mispronounced, the caster’s body violently explodes; if cast accurately, it transfigures matter cleanly.',
      lastModified: 1710000000000,
      pairedCharacterSkills: ['char-iruma-suzuki', 'char-sullivan'],
      pairedEventSpells: ['evt-ceremony-duel']
    } as Ability,
    {
      id: 'abl-pandoroola',
      name: 'Pandoroola (Bow of Gluttony)',
      type: 'ability',
      tags: ['archery', 'devastating', 'gluttony'],
      typeSkill: 'Concentrated Mana Arrow',
      levelSkill: 'High Tier',
      description: 'Iruma’s signature archery technique taught by Bachiko. Fires a concentrated black-gold arrow of devouring energy from his manifested magical bow.',
      lastModified: 1710000000000,
      pairedCharacterSkills: ['char-iruma-suzuki'],
      pairedItemsUsing: ['item-solomon-ring']
    } as Ability,
    {
      id: 'abl-phoenix-blast',
      name: 'Fire Magic: Phoenix Lance',
      type: 'ability',
      tags: ['flame', 'asmodeus', 'nobility'],
      typeSkill: 'Elemental Pyrokinesis',
      levelSkill: 'Advanced',
      description: 'Asmodeus Alice’s signature blue flame lance, incinerating targets with pinpoint aristocratic grace.',
      lastModified: 1710000000000,
      pairedCharacterSkills: ['char-asmodeus-alice']
    } as Ability,

    // ==========================================
    // 4. DETAILS: ITEMS
    // ==========================================
    {
      id: 'item-solomon-ring',
      name: 'The Ring of Gluttony (Solomon’s Ring)',
      type: 'item',
      tags: ['relic', 'ring', 'gluttony'],
      features: 'Golden demonic ring with an eye aperture and hunger avatar Alicred.',
      description: 'Legendary ring discovered by Iruma during the ranking placement exam. Feeds on ambient mana and discharges it in versatile spell forms.',
      lastModified: 1710000000000,
      pairedConnectedCharacter: ['char-iruma-suzuki'],
      pairedSkillsUsing: ['abl-pandoroola']
    } as Item,
    {
      id: 'item-hatsukoi-memory',
      name: 'First Love Memories (Hatsukoi Memory)',
      type: 'item',
      tags: ['manga', 'sacred-text', 'romance'],
      features: 'Multi-volume human shojo manga series inherited by the Azazel household as ancient scriptures.',
      description: 'Cherished romantic manga from the human world that Ameri believes to be ancient sacred prophetic texts, deciphered exclusively by Iruma.',
      lastModified: 1710000000000,
      pairedConnectedCharacter: ['char-azazel-ameri', 'char-iruma-suzuki']
    } as Item,

    // ==========================================
    // 4. DETAILS: OCCUPATIONS
    // ==========================================
    {
      id: 'occ-babyls-student',
      name: 'Babyls Academy Student',
      type: 'occupation',
      tags: ['student', 'academic', 'apprentice'],
      description: 'Enrolled pupils pursuing rank elevation from Alef (1) through Yodh (10) across a six-year magical curriculum.',
      lastModified: 1710000000000,
      pairedConnectedProfessions: ['char-iruma-suzuki', 'char-asmodeus-alice', 'char-valac-clara', 'char-azazel-ameri']
    } as Occupation,
    {
      id: 'occ-babyls-professor',
      name: 'Babyls Faculty Professor',
      type: 'occupation',
      tags: ['faculty', 'educator', 'high-rank'],
      description: 'Licensed senior demon educators tasked with instructing and disciplining dangerous young demons.',
      lastModified: 1710000000000,
      pairedConnectedProfessions: ['char-kallego-naberius', 'char-sullivan']
    } as Occupation,

    // ==========================================
    // 4. DETAILS: CONDITIONS
    // ==========================================
    {
      id: 'cond-wicked-phase',
      name: 'Wicked Phase (Evil Cycle State)',
      type: 'condition',
      tags: ['instinct', 'charismatic', 'aggressive'],
      description: 'Temporary transformation brought by intense demonic stress release, inverting a demon’s manners into ruthless, magnetic swagger.',
      lastModified: 1710000000000,
      pairedConnectedCharacter: ['char-iruma-suzuki']
    } as Condition,
    {
      id: 'cond-absolute-evasion',
      name: 'Overwhelming Crisis Evasion Reflex',
      type: 'condition',
      tags: ['boon', 'survival', 'reflex'],
      description: 'Condition born from surviving endless mortal peril throughout childhood, allowing the body to reactively dodge all oncoming physical and magical threats.',
      lastModified: 1710000000000,
      pairedConnectedCharacter: ['char-iruma-suzuki']
    } as Condition,

    // ==========================================
    // 4. DETAILS: RESOURCES / MATERIALS
    // ==========================================
    {
      id: 'res-mana-crystals',
      name: 'Mana Crystals (Madou-ishi)',
      type: 'resource',
      tags: ['mineral', 'mana', 'fuel'],
      description: 'Luminescent gemstone nodes mined from the volcanic fissures of Makai, utilized to charge magical apparatus and stabilize teleportation circles.',
      lastModified: 1710000000000,
      connectedLocations: ['loc-babyls-school']
    } as Resource,
    {
      id: 'res-legendary-leaf-seed',
      name: 'Seed of the Legendary Leaf',
      type: 'resource',
      tags: ['botany', 'mythical', 'seed'],
      description: 'Mythical botanical seed buried deep within the Babyls forest, blooming into the colossal World Tree when nourished with genuine affection.',
      lastModified: 1710000000000,
      pairedConnectedNotes: ['note-demon-king-prophecy']
    } as Resource,

    // ==========================================
    // 4. DETAILS: CURRENCIES
    // ==========================================
    {
      id: 'cur-makai-gella',
      name: 'Demonic Credits (Gella)',
      type: 'currency',
      tags: ['money', 'coins', 'economy'],
      description: 'The standard gold-embossed currency circulating across the Netherworld economy.',
      lastModified: 1710000000000,
      connectedLocations: ['loc-walter-park', 'loc-babyls-school']
    } as Currency,
    {
      id: 'cur-babyls-points',
      name: 'Babyls Merit Points (CP)',
      type: 'currency',
      tags: ['academic', 'points', 'tokens'],
      description: 'School currency awarded for academic excellence, battler rankings, and festival victories, redeemable at the Babyls cafeteria and school store.',
      lastModified: 1710000000000,
      connectedLocations: ['loc-babyls-school']
    } as Currency
  ]
};
