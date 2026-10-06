import { resolveBaseUiType } from '#read/type-printer/base-ui-mapper';
import type { BaseUiTypeMap, Resolver } from '#read/type-printer/shared';
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

export const baseUiResolver: Resolver = {
    name: 'base-ui-type',
    // Single lookup: the old isBaseUiType/resolveMappedBaseUiType pair walked the map twice.
    resolve: (type, ctx) => (ctx.baseUiMap ? resolveMappedBaseUiType(type, ctx.baseUiMap) : null),
};
