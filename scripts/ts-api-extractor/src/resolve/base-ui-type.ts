import type { Type } from 'ts-morph';

import type { BaseUiTypeMap } from '~/models/internal';
import { resolveBaseUiType } from '~/resolve/base-ui-mapper';

export function isBaseUiType(type: Type, baseUiMap?: BaseUiTypeMap): boolean {
    if (!baseUiMap) return false;
    return resolveMappedBaseUiType(type, baseUiMap) !== null;
}

export function resolveMappedBaseUiType(type: Type, baseUiMap: BaseUiTypeMap): string | null {
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
