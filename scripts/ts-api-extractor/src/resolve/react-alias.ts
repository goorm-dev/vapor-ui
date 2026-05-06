import type { Type } from 'ts-morph';

import { PRESERVED_REACT_ALIASES } from '~/resolve/shared';

export function isReactAlias(type: Type): boolean {
    const aliasSymbol = type.getAliasSymbol();
    return Boolean(aliasSymbol && PRESERVED_REACT_ALIASES.has(aliasSymbol.getName()));
}

export function resolveReactAlias(type: Type): string {
    return type.getAliasSymbol()?.getName() ?? type.getText();
}
