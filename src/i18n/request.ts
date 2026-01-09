/**
 * i18n Request Configuration
 * next-intl의 서버 사이드 로케일 감지 설정
 */

import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // `requestLocale`이 없으면 기본 로케일 사용
  let locale = await requestLocale;

  // 유효하지 않은 로케일이면 기본 로케일로 대체
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
