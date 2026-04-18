
import React from 'react';
import { Play, Swords, BookOpen, Settings } from 'lucide-react';
import { Language, getTranslation } from '../../utils/i18n';

interface MainMenuProps {
    lang: Language;
    hasSaveFile: boolean;
    onNewGame: () => void;
    onLoadGame: () => void;
    onSettings: () => void;
    onHelp: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ lang, hasSaveFile, onNewGame, onLoadGame, onSettings, onHelp }) => {
    const t = (key: any) => getTranslation(lang, key);

    return (
        <div className="min-h-screen bg-game-bg text-gray-200 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-game-panel to-game-bg opacity-50"></div>
            <div className="z-10 text-center space-y-8 max-w-md w-full">
                <div className="mb-12">
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-game-player to-game-accent drop-shadow-lg mb-2">
                        {t('title')}
                    </h1>
                    <h2 className="text-3xl font-light tracking-[0.3em] text-white">{t('subtitle')}</h2>
                </div>
                
                <div className="space-y-4">
                    <button 
                        onClick={onNewGame}
                        className="w-full py-4 bg-game-accent/20 hover:bg-game-accent/40 border border-game-accent/50 text-game-accent font-bold text-xl rounded-lg transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(122,162,247,0.3)] flex items-center justify-center gap-3"
                    >
                        <Swords size={24} /> {t('newGame')}
                    </button>

                    <button 
                        onClick={onLoadGame}
                        disabled={!hasSaveFile}
                        className={`
                            w-full py-4 border font-bold text-xl rounded-lg transition-all flex items-center justify-center gap-3
                            ${hasSaveFile 
                            ? 'bg-green-500/20 hover:bg-green-500/40 border-green-500/50 text-green-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(74,222,128,0.3)]' 
                            : 'bg-gray-800/50 border-gray-700 text-gray-600 cursor-not-allowed'}
                        `}
                    >
                        <Play size={24} fill={hasSaveFile ? "currentColor" : "none"} /> {t('continue')}
                    </button>
                    
                    <button 
                        onClick={onSettings}
                        className="w-full py-4 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600 text-gray-300 font-bold text-xl rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-3"
                    >
                        <Settings size={24} /> {t('settings')}
                    </button>

                    <button 
                        onClick={onHelp}
                        className="w-full py-4 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600 text-gray-300 font-bold text-xl rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-3"
                    >
                        <BookOpen size={24} /> {t('help')}
                    </button>
                </div>

                <div className="text-xs text-gray-600 mt-12 font-mono">
                    {t('version')}
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
