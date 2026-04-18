
import React from 'react';
import { Settings, ChevronLeft, Globe, Palette } from 'lucide-react';
import { THEMES } from '../../constants/themes';
import { Language, getTranslation } from '../../utils/i18n';

interface SettingsScreenProps {
    lang: Language;
    setLang: (l: Language) => void;
    activeThemeId: string;
    setActiveThemeId: (id: string) => void;
    onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ lang, setLang, activeThemeId, setActiveThemeId, onBack }) => {
    const t = (key: any) => getTranslation(lang, key);

    return (
        <div className="min-h-screen bg-game-bg text-gray-200 p-8 flex justify-center items-center">
            <div className="max-w-2xl w-full bg-game-panel rounded-2xl border border-gray-700 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-game-accent flex items-center gap-3">
                        <Settings size={32} /> {t('settingsTitle')}
                    </h1>
                    <button 
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft /> {t('backToMenu')}
                    </button>
                </div>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Globe size={20} /> {t('language')}
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setLang('en')}
                                className={`p-4 rounded-xl border font-bold transition-all ${lang === 'en' ? 'bg-game-accent text-game-bg border-game-accent' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
                            >
                                English
                            </button>
                            <button 
                                onClick={() => setLang('zh')}
                                className={`p-4 rounded-xl border font-bold transition-all ${lang === 'zh' ? 'bg-game-accent text-game-bg border-game-accent' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
                            >
                                中文
                            </button>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Palette size={20} /> {t('theme')}
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {THEMES.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => setActiveThemeId(theme.id)}
                                    className={`
                                        flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all
                                        ${activeThemeId === theme.id ? 'border-game-accent bg-gray-700/50' : 'border-transparent hover:bg-gray-800'}
                                    `}
                                >
                                    <div className="w-10 h-10 rounded-full border border-gray-500 shadow-lg" style={{ backgroundColor: theme.colors.bg }}>
                                        <div className="w-full h-full rounded-full overflow-hidden flex">
                                            <div className="w-1/2 h-full" style={{ backgroundColor: theme.colors.panel }}></div>
                                            <div className="w-1/2 h-full" style={{ backgroundColor: theme.colors.accent }}></div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold">{theme.name}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;
