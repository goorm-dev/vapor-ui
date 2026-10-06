import type { Resolver } from '#read/type-printer/shared';
import { isObjectLike, printProperties } from '#read/type-printer/type-definition';
import { ts } from 'ts-morph';

/**
 * An object with no name, such as the `data` Base UI writes into `sideOffset`, is
 * printed property by property on one line, so named unions of values inside are
 * expanded as at the top level. TypeScript's own text would keep them by name.
 */
export const anonymousObjectResolver: Resolver = {
    name: 'anonymous-object',
    resolve: (type, ctx) => {
        const symbol = type.getSymbol();
        const location = ctx.contextNode ?? symbol?.getDeclarations()[0];
        if (
            !location ||
            !isObjectLike(type) ||
            type.getAliasSymbol() ||
            symbol?.getName() !== ts.InternalSymbolName.Type
        ) {
            return null;
        }

        const properties = printProperties(type, location, ctx);
        return properties.length > 0 ? `{ ${properties.join(' ')} }` : '{}';
    },
};
