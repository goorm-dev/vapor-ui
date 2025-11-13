/**
 * 컴포넌트 명세 상수
 *
 * Vapor-UI 컴포넌트의 기본 스펙 정의
 */

/**
 * Figma 컴포넌트 이름 prefix
 */
export const FIGMA_COMPONENT_PREFIX = '💙';

/**
 * Figma 레이어 이름 prefix
 */
export const FIGMA_LAYER_PREFIX = {
    INTERACTION: '🔶InteractionLayer',
    CONTENT: '🟨',
    ICON: '❤️',
} as const;

/**
 * Vapor-UI 패키지
 */
export const VAPOR_UI_PACKAGE = '@vapor-ui/core';
export const VAPOR_UI_ICONS_PACKAGE = '@vapor-ui/icons';

/**
 * 알려진 Vapor-UI 컴포넌트 목록
 */
export const KNOWN_COMPONENTS = [
    'Button',
    'Breadcrumb',
    'Dialog',
    'Tabs',
    'TextInput',
    'Checkbox',
    'Radio',
    'Select',
    'Card',
    'Badge',
    'Avatar',
    'Text',
] as const;

export type KnownComponent = (typeof KNOWN_COMPONENTS)[number];
