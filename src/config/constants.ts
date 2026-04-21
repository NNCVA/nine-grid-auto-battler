import { Unit } from './types';

export const MAX_ENERGY = 100;
export const ENERGY_GAIN_ATTACK = 25;
export const ENERGY_GAIN_HIT = 10;
export const GRID_ROWS = 3;
export const GRID_COLS = 3;

// Helper to create a unit
export const createUnit = (
  template: Partial<Unit>,
  side: 'PLAYER' | 'ENEMY',
  row: number,
  col: number
): Unit => {
  const isPlayer = side === 'PLAYER';
  const id = `${side}_${row}_${col}_${Math.random().toString(36).substr(2, 5)}`;
  
  return {
    id,
    name: 'Unknown',
    role: 'WARRIOR',
    icon: 'Sword',
    description: 'Basic unit',
    skillName: 'Slash',
    isDead: false,
    side,
    row,
    col,
    effect: null,
    ...template,
    stats: {
        hp: 1000,
        maxHp: 1000,
        atk: 100,
        def: 20,
        speed: 50,
        critRate: 0.1,
        energy: 0,
        maxEnergy: MAX_ENERGY,
        ...(template.stats || {})
    }
  };
};
