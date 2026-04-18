import { UnitTemplateMap } from '../types';

export const UNIT_TEMPLATES: UnitTemplateMap = {
  KNIGHT: {
    name: 'Iron Guard',
    role: 'TANK',
    icon: 'Shield',
    skillName: 'Fortress',
    description: 'High defense tank.',
    stats: { hp: 3500, maxHp: 3500, atk: 120, def: 80, speed: 40, critRate: 0.05, energy: 0, maxEnergy: 100 },
  },
  BERSERKER: {
    name: 'Berserker',
    role: 'WARRIOR',
    icon: 'Axe',
    skillName: 'Rage Strike',
    description: 'Balanced fighter.',
    stats: { hp: 2200, maxHp: 2200, atk: 280, def: 40, speed: 60, critRate: 0.15, energy: 0, maxEnergy: 100 },
  },
  MAGE: {
    name: 'Pyromancer',
    role: 'MAGE',
    icon: 'Flame',
    skillName: 'Fireball',
    description: 'High damage, low HP.',
    stats: { hp: 1400, maxHp: 1400, atk: 450, def: 15, speed: 55, critRate: 0.2, energy: 0, maxEnergy: 100 },
  },
  ASSASSIN: {
    name: 'Ninja',
    role: 'ASSASSIN',
    icon: 'Dagger',
    skillName: 'Shadow Step',
    description: 'Very fast, high crit.',
    stats: { hp: 1200, maxHp: 1200, atk: 350, def: 10, speed: 90, critRate: 0.4, energy: 50, maxEnergy: 100 },
  },
  PRIEST: {
    name: 'Cleric',
    role: 'SUPPORT',
    icon: 'Heart',
    skillName: 'Divine Heal',
    description: 'Heals allies.',
    stats: { hp: 1800, maxHp: 1800, atk: 150, def: 30, speed: 45, critRate: 0.1, energy: 20, maxEnergy: 100 },
  },
};
