
import React, { useState, useEffect } from 'react';
import { THEMES } from './constants/themes';
import { useGameLogic } from './hooks/useGameLogic';
import MainMenu from './components/screens/MainMenu';
import SettingsScreen from './components/screens/SettingsScreen';
import HelpScreen from './components/screens/HelpScreen';
import GameScreen from './components/screens/GameScreen';
import { Language } from './utils/i18n';

type Screen = 'MENU' | 'GAME' | 'HELP' | 'SETTINGS';

const App: React.FC = () => {
  // Global App State
  const [screen, setScreen] = useState<Screen>('MENU');
  const [lang, setLang] = useState<Language>('zh');
  const [activeThemeId, setActiveThemeId] = useState<string>('midnight');

  const hasSaveFile = !!localStorage.getItem('ng_save_data');

  // Game Logic Hook
  const { gameState, battleSpeed, damageMap, healMap, actions } = useGameLogic({
      lang,
      onExitGame: () => {
          setScreen('MENU');
      }
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('ng_settings');
    if (savedSettings) {
        const { lang: l, theme: th } = JSON.parse(savedSettings);
        if (l) setLang(l);
        if (th) setActiveThemeId(th);
    }
  }, []);

  // Apply Theme
  useEffect(() => {
      const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
      const root = document.documentElement;
      root.style.setProperty('--game-bg', theme.colors.bg);
      root.style.setProperty('--game-panel', theme.colors.panel);
      root.style.setProperty('--game-accent', theme.colors.accent);
      root.style.setProperty('--game-player', theme.colors.player);
      root.style.setProperty('--game-enemy', theme.colors.enemy);
      
      localStorage.setItem('ng_settings', JSON.stringify({ lang, theme: activeThemeId }));
  }, [activeThemeId, lang]);

  // Screen Routing
  if (screen === 'MENU') {
      return (
          <MainMenu 
             lang={lang}
             hasSaveFile={hasSaveFile}
             onNewGame={() => {
                 actions.initializeGame(1, hasSaveFile ? gameState.maxLevel : 1);
                 setScreen('GAME');
             }}
             onLoadGame={() => {
                 const success = actions.loadGame();
                 if (success) setScreen('GAME');
             }}
             onSettings={() => setScreen('SETTINGS')}
             onHelp={() => setScreen('HELP')}
          />
      );
  }

  if (screen === 'SETTINGS') {
      return (
          <SettingsScreen 
            lang={lang}
            setLang={setLang}
            activeThemeId={activeThemeId}
            setActiveThemeId={setActiveThemeId}
            onBack={() => setScreen('MENU')}
          />
      );
  }

  if (screen === 'HELP') {
      return (
          <HelpScreen 
            lang={lang}
            onBack={() => setScreen('MENU')}
          />
      );
  }

  return (
    <GameScreen 
        gameState={gameState}
        battleSpeed={battleSpeed}
        damageMap={damageMap}
        healMap={healMap}
        lang={lang}
        actions={actions}
    />
  );
};

export default App;
