/**
 * 타입 Resolver 모듈
 *
 * ts-morph Type 객체를 실제 타입 문자열로 변환합니다.
 * import 경로 대신 실제 리터럴 값을 추출합니다.
 */
import type { Type } from 'ts-morph';

export function resolveType(type: Type): string {
    if (type.isUnion()) {
        return type
            .getUnionTypes()
            .map((t) => resolveType(t))
            .join(' | ');
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

    return type.getText();
}
