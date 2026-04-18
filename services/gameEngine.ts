
import { Unit, DamageResult, BattleLogEntry } from '../types';
import { MAX_ENERGY } from '../constants';

// Calculate standard damage
export const calculateDamage = (attacker: Unit, defender: Unit, isSkill: boolean): DamageResult => {
  let rawDamage = attacker.stats.atk;
  
  // Skill Multiplier (simplified)
  if (isSkill) {
    rawDamage *= 2.5; 
  }

  // Defense reduction
  const damageReduction = defender.stats.def * 0.5;
  let finalDamage = Math.max(1, rawDamage - damageReduction);

  // Role Advantages
  if (attacker.role === 'MAGE' && defender.role === 'TANK') finalDamage *= 1.2;
  if (attacker.role === 'ASSASSIN' && defender.role === 'MAGE') finalDamage *= 1.5;

  // Crit calculation
  const isCrit = Math.random() < attacker.stats.critRate;
  if (isCrit) {
    finalDamage *= 1.5;
  }

  // Variance (+/- 5%)
  const variance = (Math.random() * 0.1) - 0.05;
  finalDamage = Math.max(1, Math.floor(finalDamage * (1 + variance)));

  return {
    damage: finalDamage,
    isCrit,
    isKill: finalDamage >= defender.stats.hp
  };
};

export const calculateHeal = (attacker: Unit, isSkill: boolean): DamageResult => {
  let rawHeal = attacker.stats.atk * 1.2; // Base heal
  
  if (isSkill) {
    rawHeal *= 2.0; 
  }

  // Crit calculation for heal
  const isCrit = Math.random() < attacker.stats.critRate;
  if (isCrit) {
    rawHeal *= 1.5;
  }

  // Variance
  const variance = (Math.random() * 0.1) - 0.05;
  const finalHeal = Math.floor(rawHeal * (1 + variance));

  return {
    damage: finalHeal, // Reusing damage field for heal amount
    isCrit,
    isKill: false
  };
};

/**
 * Finding the target logic (Aoqi Style)
 * 1. Same row priority.
 * 2. If same row has units, pick the front-most unit.
 * 3. If same row is empty, check adjacent rows (prioritize closest row index).
 * 4. Pick front-most in that row.
 */
export const findTarget = (attacker: Unit, allUnits: Unit[]): Unit | null => {
  const enemies = allUnits.filter(u => u.side !== attacker.side && !u.isDead);
  if (enemies.length === 0) return null;

  // 1. Check same row
  const sameRowEnemies = enemies.filter(u => u.row === attacker.row);
  if (sameRowEnemies.length > 0) {
    if (attacker.side === 'PLAYER') {
       // Player attacks Right (lowest col index of enemy?)
       // In our grid: Player 0,1,2 | Enemy 0,1,2
       // "Front" for Player is Col 2. "Front" for Enemy is Col 0.
       // Player attacks Enemy's "Front" (Col 0).
       return sameRowEnemies.sort((a, b) => a.col - b.col)[0];
    } else {
      // Enemy attacks Player's "Front" (Col 2).
      return sameRowEnemies.sort((a, b) => b.col - a.col)[0];
    }
  }

  // 2. Adjacent rows
  // Sort remaining enemies by row distance, then by "frontline" logic
  return enemies.sort((a, b) => {
    const distA = Math.abs(a.row - attacker.row);
    const distB = Math.abs(b.row - attacker.row);
    
    if (distA !== distB) return distA - distB; // Closest row first

    // Same distance, pick frontline
    if (attacker.side === 'PLAYER') {
      return a.col - b.col;
    } else {
      return b.col - a.col;
    }
  })[0];
};

export const findHealTarget = (healer: Unit, allUnits: Unit[]): Unit | null => {
  const allies = allUnits.filter(u => u.side === healer.side && !u.isDead);
  if (allies.length === 0) return null;

  // Prioritize lowest HP percentage
  return allies.sort((a, b) => {
    const pctA = a.stats.hp / a.stats.maxHp;
    const pctB = b.stats.hp / b.stats.maxHp;
    return pctA - pctB;
  })[0];
};

// Calculate total speed for a side
export const getTeamSpeed = (units: Unit[], side: 'PLAYER' | 'ENEMY'): number => {
  return units
    .filter(u => u.side === side && !u.isDead)
    .reduce((sum, u) => sum + u.stats.speed, 0);
};

// Turn Order Logic
export const getTurnOrder = (units: Unit[], playerSpeed: number, enemySpeed: number): string[] => {
  const aliveUnits = units.filter(u => !u.isDead);
  
  // Sort Player Units: Priority Col Descending (2->0), Row Ascending (0->2)
  const playerUnits = aliveUnits
    .filter(u => u.side === 'PLAYER')
    .sort((a, b) => {
      // Primary: Col Descending (2 is front for Player)
      if (a.col !== b.col) return b.col - a.col;
      // Secondary: Row Ascending (0 is top)
      return a.row - b.row;
    });
    
  // Sort Enemy Units: Priority Col Ascending (0->2), Row Ascending (0->2)
  const enemyUnits = aliveUnits
    .filter(u => u.side === 'ENEMY')
    .sort((a, b) => {
      // Primary: Col Ascending (0 is front for Enemy)
      if (a.col !== b.col) return a.col - b.col;
      // Secondary: Row Ascending (0 is top)
      return a.row - b.row;
    });

  // Determine who goes first based on fixed total speed (Player wins ties)
  const isPlayerFirst = playerSpeed >= enemySpeed;

  const queue: string[] = [];
  const maxLen = Math.max(playerUnits.length, enemyUnits.length);

  for (let i = 0; i < maxLen; i++) {
    if (isPlayerFirst) {
      if (playerUnits[i]) queue.push(playerUnits[i].id);
      if (enemyUnits[i]) queue.push(enemyUnits[i].id);
    } else {
      if (enemyUnits[i]) queue.push(enemyUnits[i].id);
      if (playerUnits[i]) queue.push(playerUnits[i].id);
    }
  }
  
  return queue;
};

// --- SKIP BATTLE LOGIC ---
export const simulateBattle = (
  initialUnits: Unit[],
  initialTurn: number,
  playerSpeed: number,
  enemySpeed: number,
  currentLogs: BattleLogEntry[]
): { units: Unit[], logs: BattleLogEntry[], phase: 'VICTORY' | 'DEFEAT', finalTurn: number } => {
  // Deep clone units to avoid mutating state directly
  const units = JSON.parse(JSON.stringify(initialUnits)) as Unit[];
  const logs = [...currentLogs];
  let turn = initialTurn;
  let queue: string[] = [];

  // Safety break to prevent infinite loops
  let loopCount = 0;
  const MAX_LOOPS = 2000;

  while (loopCount < MAX_LOOPS) {
    loopCount++;

    const playerAlive = units.some((u: Unit) => u.side === 'PLAYER' && !u.isDead);
    const enemyAlive = units.some((u: Unit) => u.side === 'ENEMY' && !u.isDead);

    if (!playerAlive || !enemyAlive) {
      return {
        units,
        logs,
        phase: !playerAlive ? 'DEFEAT' : 'VICTORY',
        finalTurn: turn
      };
    }

    // Refresh queue if empty
    if (queue.length === 0) {
      turn++;
      queue = getTurnOrder(units, playerSpeed, enemySpeed);
      if (queue.length === 0) break; // Should not happen if units are alive
    }

    const attackerId = queue.shift();
    if (!attackerId) continue;

    // Find attacker in our local cloned units
    const attacker = units.find((u: Unit) => u.id === attackerId);
    if (!attacker || attacker.isDead) continue;

    const isSupport = attacker.role === 'SUPPORT';
    const target = isSupport
        ? findHealTarget(attacker, units)
        : findTarget(attacker, units);

    if (!target) continue;

    const isSkill = attacker.stats.energy >= attacker.stats.maxEnergy;
    let result: DamageResult;

    if (isSupport) {
        result = calculateHeal(attacker, isSkill);
    } else {
        result = calculateDamage(attacker, target, isSkill);
    }

    // Update Attacker Energy
    attacker.stats.energy = isSkill ? 0 : Math.min(MAX_ENERGY, attacker.stats.energy + 25);

    // Update Target
    if (isSupport) {
         target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + result.damage);
    } else {
         target.stats.hp = Math.max(0, target.stats.hp - result.damage);
         if (target.stats.hp === 0) target.isDead = true;
         target.stats.energy = Math.min(MAX_ENERGY, target.stats.energy + 10);
    }

    // Add simplified log
    let logMsg = '';
    if (isSupport) {
        logMsg = `${attacker.name} healed ${target.name} for ${result.damage}`;
    } else {
        logMsg = `${attacker.name} hit ${target.name} for ${result.damage}`;
    }
    
    logs.unshift({
        id: `skip-${loopCount}`,
        turn: turn,
        message: logMsg,
        type: isSkill ? 'SKILL' : (target.isDead ? 'DEATH' : 'ATTACK')
    });
  }

  // Fallback
  return { units, logs, phase: 'DEFEAT', finalTurn: turn };
};
