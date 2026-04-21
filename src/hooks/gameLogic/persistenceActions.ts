import { GameState } from '../../types';

const SAVE_KEY = 'ng_save_data';

export const saveGameState = (gameState: GameState): boolean => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    return true;
  } catch (error) {
    console.error('Save failed', error);
    return false;
  }
};

export const loadGameState = (): GameState | null => {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);

    if (!savedData) {
      return null;
    }

    return JSON.parse(savedData) as GameState;
  } catch (error) {
    console.error('Load failed', error);
    return null;
  }
};

export const persistExitGameState = (gameState: GameState) => {
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
};
