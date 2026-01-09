/**
 * i18n Routing Configuration
 * next-intl의 라우팅 설정
 */

import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // 지원하는 로케일 목록
  locales: ['ko', 'en'],

  // 기본 로케일
  defaultLocale: 'ko',

  // URL에 로케일 항상 표시 (/ko/..., /en/...)
  localePrefix: 'always',
});

// 라우팅 헬퍼 함수 (Link, redirect, useRouter 등)
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
