import { describe, expect, it } from 'vitest';
import {
  getAllUnitTemplates,
  getUnitTemplate,
  getUnitTemplateKeys,
} from '../../services/contentService';

describe('contentService', () => {
  it('returns a known unit template by key', () => {
    expect(getUnitTemplate('KNIGHT')).toMatchObject({
      name: 'Iron Guard',
      role: 'TANK',
    });
  });

  it('lists all known unit template keys', () => {
    expect(getUnitTemplateKeys()).toEqual(
      expect.arrayContaining(['KNIGHT', 'BERSERKER', 'MAGE', 'ASSASSIN', 'PRIEST']),
    );
  });

  it('returns all unit templates as a keyed record', () => {
    expect(getAllUnitTemplates()).toHaveProperty('MAGE');
  });

  it('throws a clear error for an unknown unit template key', () => {
    expect(() => getUnitTemplate('UNKNOWN')).toThrowError(
      'Unknown unit template key: UNKNOWN',
    );
  });
});
