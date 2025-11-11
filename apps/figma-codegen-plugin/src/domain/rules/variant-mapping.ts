/**
 * Variant → Props 매핑 규칙
 *
 * PRD 2.1 참조: Figma Variant를 React Props로 매핑
 */

import type { ComponentProperties } from '../types';

/**
 * Variant 매핑 규칙
 */
export interface VariantRule {
    figmaProperty: string;
    reactProp?: string;
    valueTransform?: (value: string) => unknown;
    exclude?: boolean;
}

/**
 * 컴포넌트별 Variant 매핑 규칙
 */
export const VARIANT_MAPPING_RULES: Record<string, VariantRule[]> = {
    Button: [
        {
            figmaProperty: 'size',
            reactProp: 'size',
            valueTransform: (value: string) => value.toLowerCase(),
        },
        {
            figmaProperty: 'colorPalette',
            reactProp: 'colorPalette',
            valueTransform: (value: string) => value.toLowerCase(),
        },
        {
            figmaProperty: 'variant',
            reactProp: 'variant',
            valueTransform: (value: string) => value.toLowerCase(),
        },
        {
            figmaProperty: 'disabled',
            reactProp: 'disabled',
            valueTransform: toBoolean,
        },
        {
            figmaProperty: 'State',
            exclude: true, // 인터랙션 상태는 제외
        },
    ],
    Breadcrumb: [
        {
            figmaProperty: 'size',
            reactProp: 'size',
            valueTransform: (value: string) => value.toLowerCase(),
        },
    ],
    'Breadcrumb.Item': [
        {
            figmaProperty: 'current',
            reactProp: 'current',
            valueTransform: toBoolean,
        },
    ],
};

/**
 * 문자열을 Boolean으로 변환
 */
function toBoolean(value: string): boolean {
    return value === 'true' || value === 'True' || value === 'TRUE';
}

/**
 * camelCase 변환
 */
function toCamelCase(str: string): string {
    return str
        .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
        .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

/**
 * Variant Props 추출
 *
 * @param properties - Figma Component Properties
 * @param componentName - 컴포넌트 이름
 * @returns React Props 객체
 */
export function extractVariantProps(
    properties: ComponentProperties | undefined,
    componentName: string,
): Record<string, unknown> {
    if (!properties) {
        return {};
    }

    const props: Record<string, unknown> = {};
    const rules = VARIANT_MAPPING_RULES[componentName] || [];

    for (const [key, prop] of Object.entries(properties)) {
        if (prop.type !== 'VARIANT') continue;

        // 매핑 규칙 찾기
        const rule = rules.find((r) => r.figmaProperty === key);

        // 제외 대상인 경우 스킵
        if (rule?.exclude) continue;

        // Props 이름 결정
        const propName = rule?.reactProp ?? toCamelCase(key);

        // 값 변환
        const propValue = rule?.valueTransform
            ? rule.valueTransform(String(prop.value))
            : prop.value;

        props[propName] = propValue;
    }

    return props;
}
