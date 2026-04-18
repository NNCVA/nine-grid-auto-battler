import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GameScreen from '../../components/screens/GameScreen';
import { createUnit } from '../../constants';
import {
  enableRenderCounters,
  getRenderCountsSnapshot,
  resetRenderCounters,
} from '../../utils/performance/renderCounters';

const baseActions = {
  handleNextOrReset: vi.fn(),
  toggleSpeed: vi.fn(),
  handleSkip: vi.fn(),
  handleUnitDrop: vi.fn(),
  addUnitFromBench: vi.fn(),
  removeUnit: vi.fn(),
  startBattle: vi.fn(),
  enterFormation: vi.fn(),
  exitFormation: vi.fn(),
  handleExit: vi.fn(),
};

const createGameState = () => ({
  phase: 'BATTLE' as const,
  turn: 1,
  units: [
    createUnit({ name: 'Knight', role: 'TANK' }, 'PLAYER', 1, 1),
    createUnit({ name: 'Mage', role: 'MAGE' }, 'ENEMY', 1, 0),
  ],
  activeUnitId: null,
  logs: [],
  playerSpeed: 50,
  enemySpeed: 40,
  currentLevel: 1,
  maxLevel: 1,
});

describe('battle rendering', () => {
  beforeEach(() => {
    enableRenderCounters(true);
    resetRenderCounters();
  });

  afterEach(() => {
    enableRenderCounters(false);
    resetRenderCounters();
  });

  it('does not rerender battlefield grids and units when only battle speed changes', () => {
    const gameState = createGameState();
    const damageMap = {};
    const healMap = {};

    const { rerender } = render(
      React.createElement(GameScreen, {
        gameState,
        battleSpeed: 1,
        damageMap,
        healMap,
        lang: 'en',
        actions: baseActions,
      }),
    );

    const initialCounts = getRenderCountsSnapshot();

    rerender(
      React.createElement(GameScreen, {
        gameState,
        battleSpeed: 2,
        damageMap,
        healMap,
        lang: 'en',
        actions: baseActions,
      }),
    );

    const finalCounts = getRenderCountsSnapshot();

    expect(finalCounts.GameScreen).toBe(initialCounts.GameScreen + 1);
    expect(finalCounts['GameGrid:PLAYER']).toBe(initialCounts['GameGrid:PLAYER']);
    expect(finalCounts['GameGrid:ENEMY']).toBe(initialCounts['GameGrid:ENEMY']);
    expect(finalCounts.BattleUnit).toBe(initialCounts.BattleUnit);
  });
});
