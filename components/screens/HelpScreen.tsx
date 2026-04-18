
import React from 'react';
import { ChevronLeft, Shield, Swords, Flame, Crosshair, Heart, BookOpen } from 'lucide-react';
import { Language, getTranslation } from '../../utils/i18n';
import { TRANSLATIONS } from '../../constants/localization';

interface HelpScreenProps {
    lang: Language;
    onBack: () => void;
}

const HelpScreen: React.FC<HelpScreenProps> = ({ lang, onBack }) => {
    const t = (key: any) => getTranslation(lang, key);
    const roleDesc = TRANSLATIONS[lang].roleDesc;

    const ROLES = [
        { key: 'TANK', color: 'text-game-player', icon: Shield },
        { key: 'WARRIOR', color: 'text-red-400', icon: Swords },
        { key: 'MAGE', color: 'text-blue-400', icon: Flame },
        { key: 'ASSASSIN', color: 'text-yellow-400', icon: Crosshair },
        { key: 'SUPPORT', color: 'text-green-400', icon: Heart },
    ];

    return (
        <div className="min-h-screen bg-game-bg text-gray-200 p-8 flex justify-center">
            <div className="max-w-3xl w-full">
                <button 
                    onClick={onBack}
                    className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ChevronLeft /> {t('backToMenu')}
                </button>

                <h1 className="text-4xl font-bold text-game-accent mb-6">{t('manualTitle')}</h1>

                <div className="space-y-8">
                    <section className="bg-game-panel p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Swords size={20} /> {t('basics')}</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                            {(t('basicsText') as string[]).map((line, i) => (
                                <li key={i}>{line}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="bg-game-panel p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Crosshair size={20} /> {t('targeting')}</h2>
                        <div className="text-gray-300 mb-2">{(t('targetingText') as string[])[0]}</div>
                        <ol className="list-decimal list-inside space-y-1 text-gray-300">
                            {(t('targetingText') as string[]).slice(1).map((line, i) => (
                                <li key={i}>{line}</li>
                            ))}
                        </ol>
                    </section>

                    <section className="bg-game-panel p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Shield size={20} /> {t('roles')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ROLES.map(({ key, color, icon: Icon }) => (
                                <div key={key} className="p-3 bg-gray-800 rounded border border-gray-600">
                                    <div className={`${color} font-bold flex items-center gap-2`}>
                                        <Icon size={16} /> {key}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {roleDesc[key as keyof typeof roleDesc]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default HelpScreen;
