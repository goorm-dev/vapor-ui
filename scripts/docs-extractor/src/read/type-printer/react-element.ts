import type { Resolver, ResolverContext } from '#read/type-printer/shared';
import type { Type } from 'ts-morph';

function isReactElement(type: Type): boolean {
    const symbol = type.getSymbol() || type.getAliasSymbol();
    return symbol?.getName() === 'ReactElement';
}

/**
 * `ReactElement<Menu.Portal.Props, string | JSXElementConstructor<any>>` reads
 * `ReactElement<Menu.Portal.Props>`: only the props argument says anything, and
 * an `unknown` one is dropped too.
 */
function resolveReactElement(type: Type, ctx: ResolverContext): string {
    const [props] = type.getTypeArguments();
    if (!props || props.isUnknown() || props.isAny()) return 'ReactElement';

    const propsText = ctx.resolveType(props, ctx.baseUiMap, ctx.contextNode, ctx.reporter);
    return `ReactElement<${propsText}>`;
}

export const reactElementResolver: Resolver = {
    name: 'react-element',
    resolve: (type, ctx) => (isReactElement(type) ? resolveReactElement(type, ctx) : null),
};
