import type { ReactNode } from 'react';

export type ThemeTool = {
    id: string;
    name: string;
    description: string;
    href?: string;
    isExternal?: boolean;
    isComingSoon?: boolean;
    icon?: ReactNode;
    badge?: string;
};

export type ThemeSection = {
    id: string;
    title: string;
    description: string;
    tools: ThemeTool[];
};

/**
 * 사용자 시나리오 기반 섹션 구성
 */
export const THEME_SECTIONS: ThemeSection[] = [
    {
        id: 'dark-mode',
        title: 'Dark Mode',
        description: 'Light/Dark 모드 전환과 시스템 테마 동기화가 필요하다면',
        tools: [
            {
                id: 'theme-provider',
                name: 'ThemeProvider',
                description:
                    'ThemeProvider 하나로 다크모드를 지원하세요. useTheme 훅으로 테마를 제어하고, ThemeScope로 부분 테마를 적용할 수 있습니다.',
                href: '/theme/theme-provider',
                badge: 'React',
            },
        ],
    },
    {
        id: 'brand-customization',
        title: 'Brand Customization',
        description: '브랜드에 맞는 컬러, Radius, Scaling을 커스텀하고 싶다면',
        tools: [
            {
                id: 'playground',
                name: 'Theme Playground',
                description:
                    'Primary 컬러 하나로 WCAG 접근성 기준을 충족하는 11단계 팔레트를 자동 생성합니다. 실시간으로 조정하고 CSS를 복사하세요.',
                href: '/theme/playground',
                badge: 'Interactive',
            },
            {
                id: 'figma-plugin',
                name: 'Figma Plugin',
                description:
                    '디자이너를 위한 Figma 플러그인입니다. 컬러 팔레트를 생성하고 Figma 변수로 바로 등록하거나 CSS를 복사할 수 있습니다.',
                href: 'https://www.figma.com/community/plugin/1542812611331843953/vapor-color-generator',
                isExternal: true,
                badge: 'Figma',
            },
        ],
    },
    {
        id: 'advanced',
        title: 'Programmatic API',
        description: 'CI/CD 파이프라인이나 빌드 스크립트에서 테마를 생성하고 싶다면',
        tools: [
            {
                id: 'color-generator',
                name: '@vapor-ui/color-generator',
                description:
                    'OKLCH 색 공간 기반으로 WCAG 접근성을 충족하는 11단계 컬러 팔레트를 생성합니다. Figma Plugin과 Theme Playground의 핵심 엔진입니다.',
                href: 'https://www.npmjs.com/package/@vapor-ui/color-generator',
                isExternal: true,
                badge: 'npm',
            },
            {
                id: 'css-generator',
                name: '@vapor-ui/css-generator',
                description:
                    '내부적으로 @vapor-ui/color-generator를 사용하여 Color, Radius, Scaling CSS 변수를 생성합니다. 빌드 타임에 완전한 테마 CSS를 프로그래매틱하게 생성할 수 있습니다.',
                href: 'https://www.npmjs.com/package/@vapor-ui/css-generator',
                isExternal: true,
                badge: 'npm',
            },
        ],
    },
];
