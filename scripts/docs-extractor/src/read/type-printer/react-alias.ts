import type { Resolver } from '#read/type-printer/shared';
import { PRESERVED_REACT_ALIASES } from '#read/type-printer/shared';
import type { Type } from 'ts-morph';

export function isPreservedReactAlias(type: Type): boolean {
    const aliasSymbol = type.getAliasSymbol();
    return Boolean(aliasSymbol && PRESERVED_REACT_ALIASES.has(aliasSymbol.getName()));
}

/** `ReactNode` prints by name; a generic alias keeps its arguments, e.g. `React.Ref<HTMLDivElement>`. */
export const reactAliasResolver: Resolver = {
    name: 'react-alias',
    resolve: (type, ctx) => {
        if (!isPreservedReactAlias(type)) return null;
        if (type.getAliasTypeArguments().length > 0) return ctx.rawText;
        return type.getAliasSymbol()?.getName() ?? ctx.rawText;
    },
};
