import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';

import { i18n } from '~/lib/i18n';

// hideLocale: 'default-locale' 옵션으로 기본 언어(kr)는 URL에서 숨김
// /docs → 한국어 (내부적으로 /kr/docs로 rewrite)
// /en/docs → 영어
// /kr/docs → /docs로 redirect
export default createI18nMiddleware(i18n);

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|components).*)'],
};
