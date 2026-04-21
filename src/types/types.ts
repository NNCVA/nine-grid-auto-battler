
export type Role = 'TANK' | 'WARRIOR' | 'MAGE' | 'ASSASSIN' | 'SUPPORT';

export interface UnitStats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  speed: number;
  critRate: number; // 0-1
  energy: number;
  maxEnergy: number;
}

export interface Unit {
  id: string;
  name: string;
  role: Role;
  icon: string;
  stats: UnitStats;
  description: string;
  skillName: string;
  isDead: boolean;
  side: 'PLAYER' | 'ENEMY';
  row: number; // 0-2
  col: number; // 0-2
  effect?: 'STUN' | 'BUFF' | 'SHIELD' | null;
}

export type UnitTemplate = Partial<Unit>;
export type UnitTemplateMap = Record<string, UnitTemplate>;

export interface BattleLogEntry {
  id: string;
  turn: number;
  message: string;
  type: 'ATTACK' | 'SKILL' | 'DEATH' | 'INFO';
}

export interface GameState {
  phase: 'MATCHUP' | 'FORMATION' | 'BATTLE' | 'VICTORY' | 'DEFEAT';
  turn: number;
  units: Unit[];
  activeUnitId: string | null;
  logs: BattleLogEntry[];
  playerSpeed: number;
  enemySpeed: number;
  currentLevel: number;
  maxLevel: number;
}

export interface DamageResult {
  damage: number;
  isCrit: boolean;
  isKill: boolean;
}
