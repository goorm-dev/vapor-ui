import type { Type } from 'ts-morph';

import type { Resolver } from '~/infrastructure/ts-morph/type-printer/shared';

function isPrimitive(type: Type): boolean {
    return (
        type.isBooleanLiteral() ||
        type.isLiteral() ||
        type.isUndefined() ||
        type.isNull() ||
        type.isBoolean() ||
        type.isString() ||
        type.isNumber()
    );
}

function resolvePrimitive(type: Type): string {
    if (type.isBooleanLiteral()) return type.getText();
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

export const primitiveResolver: Resolver = {
    name: 'primitive',
    resolve: (type) => (isPrimitive(type) ? resolvePrimitive(type) : null),
};
