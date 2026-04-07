import type { Type } from 'ts-morph';

import type { ResolverContext } from '~/resolve/shared';

export function isUnionWithFunction(type: Type): boolean {
    return (
        type.isUnion() &&
        type.getUnionTypes().some((member) => member.getCallSignatures().length > 0)
    );
}

export function resolveUnionWithFunction(type: Type, ctx: ResolverContext): string {
    return type
        .getUnionTypes()
        .map((member) => {
            const resolved = ctx.resolveType(member, ctx.baseUiMap, ctx.contextNode, ctx.verbose);
            return member.getCallSignatures().length > 0 ? `(${resolved})` : resolved;
        })
        .join(' | ');
}
