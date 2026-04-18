import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TRANSLATIONS } from '../../constants/localization';
import { useGameLogic } from '../../hooks/useGameLogic';

describe('useGameLogic', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
  });

  it('preserves the public hook contract expected by current screens', () => {
    const { result } = renderHook(() =>
      useGameLogic({
        lang: 'en',
        onExitGame: vi.fn(),
      }),
    );

    expect(Object.keys(result.current)).toEqual([
      'gameState',
      'battleSpeed',
      'damageMap',
      'healMap',
      'actions',
    ]);

    expect(Object.keys(result.current.actions)).toEqual([
      'initializeGame',
      'loadGame',
      'saveGame',
      'handleNextOrReset',
      'toggleSpeed',
      'handleSkip',
      'handleUnitDrop',
      'addUnitFromBench',
      'removeUnit',
      'startBattle',
      'enterFormation',
      'exitFormation',
      'handleExit',
    ]);
  });

  it('initializes a default player team and a random enemy team', () => {
    const { result } = renderHook(() =>
      useGameLogic({
        lang: 'en',
        onExitGame: vi.fn(),
      }),
    );

    act(() => {
      result.current.actions.initializeGame(1, 1);
    });

    const playerUnits = result.current.gameState.units.filter((unit) => unit.side === 'PLAYER');
    const enemyUnits = result.current.gameState.units.filter((unit) => unit.side === 'ENEMY');
    const localizedNames = Object.values(TRANSLATIONS.en.unitInfo).map((entry) => entry.name);

    expect(result.current.gameState.phase).toBe('MATCHUP');
    expect(playerUnits).toHaveLength(3);
    expect(enemyUnits.length).toBeGreaterThanOrEqual(3);
    expect(enemyUnits.length).toBeLessThanOrEqual(5);

    for (const unit of result.current.gameState.units) {
      expect(localizedNames).toContain(unit.name);
    }
  });

  it('enters formation mode from matchup', () => {
    const { result } = renderHook(() =>
      useGameLogic({
        lang: 'en',
        onExitGame: vi.fn(),
      }),
    );

    act(() => {
      result.current.actions.initializeGame(1, 1);
      result.current.actions.enterFormation();
    });

    expect(result.current.gameState.phase).toBe('FORMATION');
  });

  it('rejects battle start when no player units are deployed', () => {
    const { result } = renderHook(() =>
      useGameLogic({
        lang: 'en',
        onExitGame: vi.fn(),
      }),
    );

    act(() => {
      result.current.actions.initializeGame(1, 1);
    });

    act(() => {
      result.current.actions.enterFormation();
    });

    act(() => {
      result.current.gameState.units
        .filter((unit) => unit.side === 'PLAYER')
        .forEach((unit) => result.current.actions.removeUnit(unit.id));
    });

    act(() => {
      result.current.actions.exitFormation();
    });

    act(() => {
      result.current.actions.startBattle();
    });

    expect(window.alert).toHaveBeenCalledWith('Place at least one unit!');
    expect(result.current.gameState.phase).toBe('MATCHUP');
  });

  it('starts battle with computed speed data and battle logs', () => {
    const { result } = renderHook(() =>
      useGameLogic({
        lang: 'en',
        onExitGame: vi.fn(),
      }),
    );

    act(() => {
      result.current.actions.initializeGame(1, 1);
    });

    act(() => {
      result.current.actions.startBattle();
    });

    expect(result.current.gameState.phase).toBe('BATTLE');
    expect(result.current.gameState.turn).toBe(1);
    expect(result.current.gameState.playerSpeed).toBeGreaterThan(0);
    expect(result.current.gameState.enemySpeed).toBeGreaterThan(0);
    expect(result.current.gameState.logs.some((log) => log.message.includes('Battle Start!'))).toBe(
      true,
    );
  });

  it('saves and reloads the latest game state', () => {
    const { result } = renderHook(() =>
      useGameLogic({
        lang: 'en',
        onExitGame: vi.fn(),
      }),
    );

    act(() => {
      result.current.actions.initializeGame(2, 4);
      result.current.actions.enterFormation();
    });

    let saved = false;
    act(() => {
      saved = result.current.actions.saveGame();
    });

    expect(saved).toBe(true);
    expect(JSON.parse(localStorage.getItem('ng_save_data') ?? '{}')).toMatchObject({
      currentLevel: 2,
      maxLevel: 4,
      phase: 'FORMATION',
    });

    act(() => {
      result.current.actions.initializeGame(1, 1);
    });

    let loaded = false;
    act(() => {
      loaded = result.current.actions.loadGame();
    });

    expect(loaded).toBe(true);
    expect(result.current.gameState).toMatchObject({
      currentLevel: 2,
      maxLevel: 4,
      phase: 'FORMATION',
    });
  });

  it('auto-saves and calls onExitGame when exiting', () => {
    const onExitGame = vi.fn();
    const { result } = renderHook(() =>
      useGameLogic({
        lang: 'en',
        onExitGame,
      }),
    );

    act(() => {
      result.current.actions.initializeGame(2, 4);
      result.current.actions.enterFormation();
    });

    act(() => {
      result.current.actions.handleExit();
    });

    expect(JSON.parse(localStorage.getItem('ng_save_data') ?? '{}')).toMatchObject({
      currentLevel: 2,
      maxLevel: 4,
      phase: 'FORMATION',
    });
    expect(onExitGame).toHaveBeenCalledTimes(1);
  });
});
