export type LocalLanguage = (typeof languages)[number];

export const languages = ['en', 'fi'] as const;
export const defaultLanguage: LocalLanguage = 'en';