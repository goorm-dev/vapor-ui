import type { Resolver } from '#read/type-printer/shared';
import type { Type } from 'ts-morph';

function isReactElement(type: Type): boolean {
    const symbol = type.getSymbol() || type.getAliasSymbol();
    return symbol?.getName() === 'ReactElement';
}

/** `ReactElement<unknown, string | JSXElementConstructor<any>>` documents as plain `ReactElement`. */
export const reactElementResolver: Resolver = {
    name: 'react-element',
    resolve: (type) => (isReactElement(type) ? 'ReactElement' : null),
};
