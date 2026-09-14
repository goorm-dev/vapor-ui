import type { Type } from 'ts-morph';

import type { Resolver, ResolverContext } from '~/infrastructure/ts-morph/type-printer/shared';

function isUnionWithFunction(type: Type): boolean {
    return (
        type.isUnion() &&
        type.getUnionTypes().some((member) => member.getCallSignatures().length > 0)
    );
}

function resolveUnionWithFunction(type: Type, ctx: ResolverContext): string {
    return type
        .getUnionTypes()
        .map((member) => {
            const resolved = ctx.resolveType(member, ctx.baseUiMap, ctx.contextNode, ctx.reporter);
            return member.getCallSignatures().length > 0 ? `(${resolved})` : resolved;
        })
        .join(' | ');
}

export const unionWithFunctionResolver: Resolver = {
    name: 'union-with-function',
    resolve: (type, ctx) =>
        isUnionWithFunction(type) ? resolveUnionWithFunction(type, ctx) : null,
};
