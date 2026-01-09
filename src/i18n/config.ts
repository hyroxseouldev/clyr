/**
 * i18n Configuration
 * 다국어 지원을 위한 로케일 설정
 */

export const locales = ['ko', 'en'] as const;
export const defaultLocale = 'ko' as const;

export type Locale = (typeof locales)[number];

/**
 * 로케일 유효성 검사
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * 로케일 라벨 (언어 전환 UI용)
 */
export const localeLabels: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
};
