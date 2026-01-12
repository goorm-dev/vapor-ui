/**
 * 타입 Resolver 모듈
 *
 * ts-morph Type 객체를 실제 타입 문자열로 변환합니다.
 * import 경로 대신 실제 리터럴 값을 추출합니다.
 */
import type { Type } from 'ts-morph';

function extractPropsName(typeText: string): string | null {
    // Omit<...ComponentName.Props, "ref"> 패턴에서 Props 이름 추출
    const match = typeText.match(/["']([^"']+)["']\)\.(\w+)\.Props/);
    if (match) {
        return `${match[2]}.Props`;
    }
    return null;
}

function simplifyReactElementType(type: Type): string | null {
    const symbol = type.getSymbol() || type.getAliasSymbol();
    if (!symbol) return null;

    const name = symbol.getName();
    if (name !== 'ReactElement') return null;

    const typeArgs = type.getTypeArguments();
    if (typeArgs.length === 0) return 'ReactElement';

    const innerType = typeArgs[0];
    const innerText = innerType.getText();

    // ForwardRefExoticComponent 패턴 확인
    if (innerText.includes('ForwardRefExoticComponent')) {
        const propsName = extractPropsName(innerText);
        if (propsName) {
            return `ReactElement<${propsName}>`;
        }
    }

    return 'ReactElement';
}

export function resolveType(type: Type): string {
    if (type.isUnion()) {
        const types = type.getUnionTypes().map((t) => resolveType(t));
        // true | false → boolean으로 합치기
        const hasTrue = types.includes('true');
        const hasFalse = types.includes('false');
        if (hasTrue && hasFalse) {
            const filtered = types.filter((t) => t !== 'true' && t !== 'false');
            filtered.push('boolean');
            return filtered.join(' | ');
        }
        return types.join(' | ');
    }

    if (type.isBooleanLiteral()) {
        return type.getText();
    }

    if (type.isLiteral()) {
        const value = type.getLiteralValue();
        return typeof value === 'string' ? `"${value}"` : String(value);
    }

    if (type.isUndefined()) return 'undefined';
    if (type.isNull()) return 'null';
    if (type.isBoolean()) return 'boolean';
    if (type.isString()) return 'string';
    if (type.isNumber()) return 'number';

    // ReactElement<ComplexType> 단순화
    const simplified = simplifyReactElementType(type);
    if (simplified) return simplified;

    return type.getText();
}
