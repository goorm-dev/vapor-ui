/**
 * 문자열 유틸리티
 */

/**
 * PascalCase 변환
 */
export function toPascalCase(str: string): string {
    return str
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .split(' ')
        .filter((word) => word.length > 0)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

/**
 * camelCase 변환
 */
export function toCamelCase(str: string): string {
    const pascalCase = toPascalCase(str);
    return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
}

/**
 * kebab-case 변환
 */
export function toKebabCase(str: string): string {
    return str
        .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
        .replace(/^-/, '')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-');
}

/**
 * Figma 컴포넌트 이름에서 prefix 제거
 *
 * 예: "💙Button" → "Button"
 * 예: "💙Breadcrumb.Item" → "Breadcrumb.Item"
 */
export function extractComponentName(figmaName: string): string {
    // 이모지 prefix 제거
    return figmaName.replace(/^[^\w.]+/, '');
}

/**
 * 컴포넌트 이름이 복합 컴포넌트인지 확인
 *
 * 예: "Breadcrumb.Item" → true
 * 예: "Button" → false
 */
export function isCompoundComponent(componentName: string): boolean {
    return componentName.includes('.');
}

/**
 * 복합 컴포넌트 이름 분리
 *
 * 예: "Breadcrumb.Item" → ["Breadcrumb", "Item"]
 */
export function splitCompoundComponentName(componentName: string): string[] {
    return componentName.split('.');
}
