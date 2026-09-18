import type { Type } from 'ts-morph';

import type { Resolver } from '~/infrastructure/ts-morph/type-printer/shared';
import { PRESERVED_REACT_ALIASES } from '~/infrastructure/ts-morph/type-printer/shared';

function isReactAlias(type: Type): boolean {
    const aliasSymbol = type.getAliasSymbol();
    return Boolean(aliasSymbol && PRESERVED_REACT_ALIASES.has(aliasSymbol.getName()));
}

function resolveReactAlias(type: Type): string {
    return type.getAliasSymbol()?.getName() ?? type.getText();
}

export const reactAliasResolver: Resolver = {
    name: 'react-alias',
    resolve: (type) => (isReactAlias(type) ? resolveReactAlias(type) : null),
};
