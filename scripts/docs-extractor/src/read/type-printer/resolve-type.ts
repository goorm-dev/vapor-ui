import { baseUiResolver } from '#read/type-printer/base-ui-type';
import { functionTypeResolver } from '#read/type-printer/function-type';
import { primitiveResolver } from '#read/type-printer/primitive';
import { reactAliasResolver } from '#read/type-printer/react-alias';
import { reactElementResolver } from '#read/type-printer/react-element';
import {
    type PrintOptions,
    type Resolver,
    type ResolverContext,
    TYPE_FORMAT_FLAGS,
} from '#read/type-printer/shared';
import { unionWithFunctionResolver } from '#read/type-printer/union';
import type { Type } from 'ts-morph';

/**
 * Order matters: the first resolver that claims the type wins. Narrow, cheap
 * checks come before the ones that walk the type graph.
 */
const RESOLVERS: Resolver[] = [
    reactAliasResolver,
    primitiveResolver,
    reactElementResolver,
    functionTypeResolver,
    unionWithFunctionResolver,
    baseUiResolver,
];

export function resolveType(type: Type, options: PrintOptions = {}): string {
    const { baseUiMap, contextNode, reporter, namespace } = options;
    const rawText = contextNode ? type.getText(contextNode, TYPE_FORMAT_FLAGS) : type.getText();
    const ctx: ResolverContext = {
        rawText,
        baseUiMap,
        contextNode,
        reporter,
        namespace,
        resolveType,
    };

    for (const resolver of RESOLVERS) {
        const resolved = resolver.resolve(type, ctx);

        if (resolved !== null) {
            reporter?.debug(`resolveType: "${rawText}" -> ${resolver.name}`);
            return resolved;
        }
    }

    reporter?.debug(`resolveType: "${rawText}" -> fallback`);
    return rawText;
}
