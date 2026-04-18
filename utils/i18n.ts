
import { TRANSLATIONS } from '../constants/localization';

export type Language = 'en' | 'zh';

export const getTranslation = <K extends keyof typeof TRANSLATIONS['en']>(lang: Language, key: K): typeof TRANSLATIONS['en'][K] => {
    return (TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key]) as typeof TRANSLATIONS['en'][K];
};
