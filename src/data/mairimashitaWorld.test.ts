import { describe, it, expect } from 'vitest';
import { mairimashitaWorld } from './mairimashitaWorld';
import { ALL_ENTITY_TYPES } from '../utils/realmConfig';
import { detectContinuityIssues } from '../utils/continuityDetector';

describe('Mairimashita! Iruma-kun Reference World Dataset', () => {
  it('contains at least 2 entities for every single one of the 21 entity categories', () => {
    const countsByType: Record<string, number> = {};
    for (const entity of mairimashitaWorld.entities) {
      countsByType[entity.type] = (countsByType[entity.type] || 0) + 1;
    }

    // Check all 21 categories
    for (const type of ALL_ENTITY_TYPES) {
      const count = countsByType[type] || 0;
      expect(
        count,
        `Expected at least 2 entries for category "${type}", found ${count}`
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it('populates rich lore and specific fields for characters', () => {
    const iruma = mairimashitaWorld.entities.find(e => e.id === 'char-iruma-suzuki') as any;
    expect(iruma).toBeDefined();
    expect(iruma.name).toBe('Suzuki Iruma');
    expect(iruma.type).toBe('character');
    expect(iruma.powerLevel).toBe('Rank 5 (He)');
    expect(iruma.statBlockMode).toBe('rpg-d20');
    expect(iruma.stats.strength).toBeDefined();
    expect(iruma.customStats.length).toBeGreaterThan(0);
    expect(iruma.personalityTraits).toContain('kindness');
    expect(iruma.allyResCharacter.length).toBeGreaterThanOrEqual(2);
  });

  it('populates rich location and event fields', () => {
    const babyls = mairimashitaWorld.entities.find(e => e.id === 'loc-babyls-school') as any;
    expect(babyls).toBeDefined();
    expect(babyls.locationType).toBe('Magical Academy');
    expect(babyls.population).toBeDefined();

    const duel = mairimashitaWorld.entities.find(e => e.id === 'evt-ceremony-duel') as any;
    expect(duel).toBeDefined();
    expect(duel.eventType).toBe('Formal Academic Duel');
    expect(duel.startDate).toBeDefined();
  });

  it('passes continuity conflict detection without critical errors', () => {
    const issues = detectContinuityIssues(mairimashitaWorld);
    const criticals = issues.filter(i => i.severity === 'critical');
    expect(criticals).toHaveLength(0);
  });
});
