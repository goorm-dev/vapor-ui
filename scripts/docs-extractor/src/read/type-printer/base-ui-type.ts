import { isDeclaredInBaseUi, resolveBaseUiType } from '#read/type-printer/base-ui-mapper';
import type { BaseUiTypeMap, Resolver, ResolverContext } from '#read/type-printer/shared';
import type { Type } from 'ts-morph';

function resolveMappedBaseUiType(type: Type, baseUiMap: BaseUiTypeMap): string | null {
    const directPath = resolveBaseUiType(type, baseUiMap);
    if (directPath) return directPath;

    for (const symbol of [type.getSymbol(), type.getAliasSymbol()]) {
        if (!symbol) continue;

        const symbolName = symbol.getName();
        if (baseUiMap[symbolName]) {
            return baseUiMap[symbolName].vaporPath;
        }
    }

    return null;
}

/**
 * Base UI writes event details as `R extends string ? Detail<R> & {} : never`.
 * TypeScript evaluates that into an anonymous object with no symbol to look up,
 * but a vapor-ui alias of it resolves to the very same type object.
 */
function isNamelessObject(type: Type): boolean {
    return type.isObject() && !type.getAliasSymbol() && type.getSymbol()?.getName() === '__type';
}

function resolveByIdentity(type: Type, ctx: ResolverContext): string | null {
    const matches = Object.values(ctx.baseUiMap ?? {}).filter(
        (entry) => entry.type.compilerType === type.compilerType,
    );
    if (matches.length === 0) return null;

    return (matches.find((entry) => entry.namespace === ctx.namespace) ?? matches[0]).vaporPath;
}

function resolveNamelessBaseUiType(type: Type, ctx: ResolverContext): string | null {
    if (!isNamelessObject(type)) return null;

    const resolved = resolveByIdentity(type, ctx);
    if (!resolved && isDeclaredInBaseUi(type)) {
        ctx.reporter?.warn(
            `No public vapor-ui name for a Base UI type in ${ctx.namespace ?? 'unknown namespace'}; printing its structure: ${ctx.rawText}. Re-export it from the component namespace to print it by name.`,
        );
    }

    return resolved;
}

export const baseUiResolver: Resolver = {
    name: 'base-ui-type',
    // Single lookup: the old isBaseUiType/resolveMappedBaseUiType pair walked the map twice.
    resolve: (type, ctx) =>
        ctx.baseUiMap
            ? (resolveMappedBaseUiType(type, ctx.baseUiMap) ?? resolveNamelessBaseUiType(type, ctx))
            : null,
};
