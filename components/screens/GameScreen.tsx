
import React from 'react';
import { Play, RotateCcw, Swords, Flame, Shield, Timer, Crosshair, Heart, Trophy, Flag, ArrowRight, FastForward, SkipForward, LogOut, Check, ChevronLeft } from 'lucide-react';
import GameGrid from '../GameGrid';
import { GameState } from '../../types';
import { getAllUnitTemplates } from '../../services/contentService';
import { Language, getTranslation } from '../../utils/i18n';
import { TRANSLATIONS } from '../../constants/localization';
import { getTeamSpeed } from '../../services/gameEngine';
import { recordRender } from '../../utils/performance/renderCounters';

interface GameScreenProps {
    gameState: GameState;
    battleSpeed: number;
    damageMap: Record<string, number>;
    healMap: Record<string, number>;
    lang: Language;
    actions: {
        handleNextOrReset: () => void;
        toggleSpeed: () => void;
        handleSkip: () => void;
        handleUnitDrop: (unit: any, r: number, c: number) => void;
        addUnitFromBench: (key: string) => void;
        removeUnit: (id: string) => void;
        startBattle: () => void;
        enterFormation: () => void;
        exitFormation: () => void;
        handleExit: () => void;
    };
}

const GameScreen: React.FC<GameScreenProps> = ({ 
    gameState, 
    battleSpeed, 
    damageMap, 
    healMap, 
    lang, 
    actions 
}) => {
    recordRender('GameScreen');
    const t = (key: any) => getTranslation(lang, key);
    const unitTemplates = getAllUnitTemplates();
    
    const playerUnits = gameState.units.filter(u => u.side === 'PLAYER');
    const enemyUnits = gameState.units.filter(u => u.side === 'ENEMY');
    const playerUnitCount = playerUnits.length;
    const enemyUnitCount = enemyUnits.length;

    // Calculate dynamic stats for preview
    const playerSpeed = getTeamSpeed(gameState.units, 'PLAYER');
    const enemySpeed = getTeamSpeed(gameState.units, 'ENEMY');
    
    // Header Component
    const Header = () => (
        <header className="w-full max-w-7xl flex justify-between items-center mb-4 sm:mb-6 border-b border-gray-700 pb-4 px-2">
            <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-game-player to-game-accent bg-clip-text text-transparent">
                    {t('title')}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                        <Flag size={14} />
                        <span>{t('level')} {gameState.currentLevel}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 font-bold text-xs">
                        <Trophy size={12} />
                        <span>{t('best')}: {gameState.maxLevel}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-2 sm:gap-4 items-center">
                 {gameState.phase === 'BATTLE' && (
                    <div className="flex items-center gap-2">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-gray-400">{t('turn')}</div>
                            <div className="text-2xl font-mono text-white">{gameState.turn}</div>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-800 rounded border border-gray-600 ml-2 sm:ml-4 overflow-hidden">
                            <button
                                onClick={actions.toggleSpeed}
                                className="flex items-center gap-1 hover:bg-gray-700 px-2 sm:px-3 py-1 transition-colors h-8 sm:h-9 border-r border-gray-600"
                                title="Toggle Battle Speed"
                            >
                                <FastForward size={14} className={battleSpeed > 1 ? "text-yellow-400" : "text-gray-400"} />
                                <span className="font-mono font-bold text-xs sm:text-sm w-4">{battleSpeed}x</span>
                            </button>
                            <button
                                onClick={actions.handleSkip}
                                className="flex items-center gap-1 hover:bg-gray-700 px-2 sm:px-3 py-1 transition-colors h-8 sm:h-9 text-blue-400 hover:text-blue-300"
                                title="Skip Battle"
                            >
                                <SkipForward size={14} />
                                <span className="font-bold text-xs hidden sm:inline">{t('skip')}</span>
                            </button>
                        </div>
                    </div>
                 )}

                 {/* Exit Button always available unless in battle (or can exit battle too) */}
                 {(gameState.phase === 'MATCHUP' || gameState.phase === 'FORMATION') && (
                    <button 
                        onClick={actions.handleExit}
                        className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-lg font-semibold bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500/50 transition-all text-sm sm:text-base"
                    >
                        <LogOut size={16} /> <span className="hidden sm:inline">{t('exit')}</span>
                    </button>
                 )}
            </div>
        </header>
    );

    // --- FORMATION VIEW ---
    if (gameState.phase === 'FORMATION') {
        return (
            <div className="min-h-screen bg-game-bg text-gray-200 flex flex-col items-center p-2 sm:p-4 transition-colors duration-500">
                <Header />
                <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-4 lg:gap-6 h-auto lg:h-[600px]">
                    {/* Barracks */}
                    <div className="w-full lg:w-1/3 bg-game-panel rounded-xl p-4 border border-gray-700 flex flex-col h-[300px] lg:h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Swords size={20} /> {t('barracks')}
                            </h2>
                            <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${playerUnitCount > enemyUnitCount ? 'bg-red-900 text-red-400' : 'bg-gray-800 text-green-400'}`}>
                                {playerUnitCount}/{enemyUnitCount} {t('units')}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {Object.entries(unitTemplates).map(([key, tmpl]) => {
                                const localized = TRANSLATIONS[lang].unitInfo[key as keyof typeof TRANSLATIONS['en']['unitInfo']];
                                return (
                                    <button 
                                        key={key}
                                        onClick={() => actions.addUnitFromBench(key)}
                                        disabled={playerUnitCount >= enemyUnitCount}
                                        className={`
                                            w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left group
                                            ${playerUnitCount >= enemyUnitCount 
                                                ? 'bg-gray-800 border-gray-800 opacity-50 cursor-not-allowed' 
                                                : 'bg-gray-800/50 hover:bg-gray-700 border-gray-700 hover:border-gray-600'}
                                        `}
                                    >
                                        <div className="w-10 h-10 rounded bg-game-player/20 flex items-center justify-center text-game-player group-hover:scale-110 transition-transform">
                                            {key === 'KNIGHT' && <Shield size={20} />}
                                            {key === 'BERSERKER' && <Swords size={20} />}
                                            {key === 'MAGE' && <Flame size={20} />}
                                            {key === 'ASSASSIN' && <Crosshair size={20} />}
                                            {key === 'PRIEST' && <Heart size={20} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm text-gray-200 truncate">{localized.name}</div>
                                            <div className="text-xs text-gray-500 flex gap-2 items-center">
                                                <span>{tmpl.role}</span>
                                                <span className="text-blue-300">Spd: {tmpl.stats?.speed}</span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Editor Grid */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex-1 bg-black/20 rounded-xl p-4 sm:p-8 border border-gray-800 flex flex-col items-center justify-center relative min-h-[350px]">
                             <div className="w-full aspect-square max-w-[450px]">
                                <GameGrid 
                                    units={gameState.units} 
                                    side="PLAYER" 
                                    activeUnitId={gameState.activeUnitId} 
                                    damageMap={damageMap} 
                                    healMap={healMap} 
                                    phase={gameState.phase}
                                    onUnitDrop={actions.handleUnitDrop}
                                    onUnitRemove={actions.removeUnit}
                                />
                             </div>
                             <div className="mt-4 text-gray-500 text-sm text-center">
                                {t('clickToAdd')}
                             </div>
                        </div>
                        <button 
                            onClick={actions.exitFormation}
                            className="w-full py-4 bg-game-accent hover:bg-blue-400 text-gray-900 font-bold text-xl rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Check size={24} /> {t('confirm')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- MATCHUP (VS) VIEW ---
    if (gameState.phase === 'MATCHUP') {
        return (
            <div className="min-h-screen bg-game-bg text-gray-200 flex flex-col items-center p-4 transition-colors duration-500">
                <Header />
                <div className="flex-1 w-full max-w-6xl flex flex-col items-center justify-center mb-12">
                    {/* VS Display - Side by side forced, auto height based on aspect ratio */}
                    <div className="flex flex-row items-center justify-center gap-2 sm:gap-8 w-full">
                        {/* Player Preview */}
                        <div className="flex-1 max-w-[400px] bg-game-panel/50 rounded-xl border border-gray-700 p-2 sm:p-4 flex flex-col items-center">
                            <div className="w-full aspect-square pointer-events-none">
                                <GameGrid 
                                    units={gameState.units} 
                                    side="PLAYER" 
                                    activeUnitId={null} 
                                    damageMap={{}} 
                                    healMap={{}} 
                                    phase={gameState.phase}
                                />
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-game-player text-sm sm:text-xl font-bold font-mono">
                                <Timer size={16} /> {t('spd')}: {playerSpeed}
                            </div>
                        </div>

                        {/* VS Badge */}
                        <div className="hidden sm:block relative flex-shrink-0">
                            <div className="absolute inset-0 bg-red-500 blur-3xl opacity-20 animate-pulse"></div>
                            <div className="relative text-4xl lg:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-orange-600 drop-shadow-2xl transform -skew-x-12">
                                VS
                            </div>
                        </div>
                        <div className="sm:hidden text-red-500 font-black italic text-xl flex-shrink-0">VS</div>

                         {/* Enemy Preview */}
                         <div className="flex-1 max-w-[400px] bg-game-panel/50 rounded-xl border border-gray-700 p-2 sm:p-4 flex flex-col items-center">
                            <div className="w-full aspect-square pointer-events-none">
                                <GameGrid 
                                    units={gameState.units} 
                                    side="ENEMY" 
                                    activeUnitId={null} 
                                    damageMap={{}} 
                                    healMap={{}} 
                                    phase={gameState.phase}
                                />
                            </div>
                             <div className="mt-2 flex items-center gap-2 text-game-enemy text-sm sm:text-xl font-bold font-mono">
                                <Timer size={16} /> {t('spd')}: {enemySpeed}
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-8 sm:mt-12 flex gap-4 sm:gap-6 w-full sm:w-auto max-w-lg">
                        <button 
                            onClick={actions.enterFormation}
                            className="flex-1 sm:flex-none px-6 sm:px-8 py-4 bg-gray-700 hover:bg-gray-600 border border-gray-500 text-white rounded-xl font-bold text-lg sm:text-xl flex items-center justify-center gap-3 transition-all hover:scale-105"
                        >
                            <Swords size={24} /> <span className="hidden sm:inline">{t('formation')}</span> <span className="sm:hidden">阵型</span>
                        </button>
                        <button 
                            onClick={actions.startBattle}
                            className="flex-[2] sm:flex-none px-8 sm:px-12 py-4 bg-game-accent hover:bg-blue-400 text-gray-900 rounded-xl font-bold text-xl sm:text-2xl shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] flex items-center justify-center gap-3 transition-all hover:scale-105 animate-pulse"
                        >
                             {t('battle')} <Play size={28} fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- BATTLE VIEW ---
    return (
        <div className="min-h-screen bg-game-bg text-gray-200 flex flex-col items-center p-2 sm:p-4 transition-colors duration-500">
          <Header />
    
          {/* Main Content */}
          <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-4 sm:gap-6 lg:h-[calc(100vh-100px)]">
            
            {/* Center: Battlefield */}
            <div className="flex-1 flex flex-col gap-4">
                 {/* Status Banner */}
                {(gameState.phase === 'VICTORY' || gameState.phase === 'DEFEAT') && (
                    <div className={`
                        w-full p-2 sm:p-4 rounded-xl text-center font-black text-xl sm:text-2xl tracking-widest animate-pop flex flex-col items-center justify-center
                        ${gameState.phase === 'VICTORY' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}
                    `}>
                        <div>{gameState.phase === 'VICTORY' ? t('victory') : t('defeat')}</div>
                        {gameState.phase === 'VICTORY' && <div className="text-xs sm:text-sm font-normal opacity-75 mt-1">{t('levelCleared')}</div>}
                    </div>
                )}
    
                {/* Battle Grids - Forced Side by Side, Square Aspect Ratio */}
                <div className="flex flex-row gap-2 sm:gap-4 w-full items-center justify-center">
                    {/* Player Grid */}
                    <div className="flex-1 aspect-square max-w-[500px]">
                        <GameGrid 
                            units={gameState.units} 
                            side="PLAYER" 
                            activeUnitId={gameState.activeUnitId} 
                            damageMap={damageMap}
                            healMap={healMap}
                            phase={gameState.phase}
                            onUnitDrop={actions.handleUnitDrop}
                            onUnitRemove={actions.removeUnit}
                        />
                    </div>
    
                    {/* Divider (Optional, thin line or gap) */}
                    <div className="w-px bg-gray-700/50 h-1/2 mx-0 hidden sm:block"></div>
    
                    {/* Enemy Grid */}
                    <div className="flex-1 aspect-square max-w-[500px]">
                        <GameGrid 
                            units={gameState.units} 
                            side="ENEMY" 
                            activeUnitId={gameState.activeUnitId} 
                            damageMap={damageMap}
                            healMap={healMap}
                            phase={gameState.phase}
                        />
                    </div>
                </div>
                
                {/* Battle Controls (Next/Reset) */}
                {(gameState.phase === 'VICTORY' || gameState.phase === 'DEFEAT') && (
                     <div className="flex justify-center mt-2 sm:mt-4">
                        <button 
                            onClick={actions.handleNextOrReset}
                            className={`
                                flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-lg hover:scale-105
                                ${gameState.phase === 'VICTORY' 
                                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-500/20' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}
                            `}
                        >
                            {gameState.phase === 'VICTORY' ? (
                                <>{t('nextLevel')} <ArrowRight size={24} /></>
                            ) : (
                                <><RotateCcw size={24} /> {t('tryAgain')}</>
                            )}
                        </button>
                     </div>
                )}

                {/* Active Unit Indicator */}
                {gameState.activeUnitId && (
                    <div className="bg-gray-800/80 p-2 rounded text-xs text-center text-yellow-200 border border-yellow-500/30">
                        {t('active')}: {gameState.units.find(u => u.id === gameState.activeUnitId)?.name}
                    </div>
                )}
            </div>
    
            {/* Right/Bottom Panel: Battle Log */}
            <div className="w-full lg:w-80 flex-shrink-0 h-[200px] lg:h-auto">
                <div className="bg-game-panel rounded-xl p-4 border border-gray-700 h-full flex flex-col">
                     <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t('battleLog')}</h2>
                     <div className="flex-1 overflow-y-auto space-y-2 pr-2 font-mono text-xs custom-scrollbar">
                        {gameState.logs.length === 0 && <span className="text-gray-600 italic">...</span>}
                        {gameState.logs.map((log) => (
                            <div key={log.id} className={`p-2 rounded border-l-2 ${
                                log.type === 'ATTACK' ? 'border-gray-500 bg-gray-800/30 text-gray-300' :
                                log.type === 'SKILL' ? 'border-yellow-500 bg-yellow-900/20 text-yellow-200' :
                                log.type === 'DEATH' ? 'border-red-500 bg-red-900/20 text-red-300' :
                                'border-blue-500 text-blue-300'
                            }`}>
                                <span className="opacity-50 mr-2">T{log.turn}</span>
                                {log.message}
                            </div>
                        ))}
                     </div>
                </div>
            </div>
          </div>
        </div>
    );
};

export default GameScreen;
