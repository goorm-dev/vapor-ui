import { baseUiResolver } from '#read/type-printer/base-ui-type';
import { functionTypeResolver } from '#read/type-printer/function-type';
import { importedTypeResolver } from '#read/type-printer/imported-type';
import { primitiveResolver } from '#read/type-printer/primitive';
import { reactAliasResolver } from '#read/type-printer/react-alias';
import { reactElementResolver } from '#read/type-printer/react-element';
import { refTypeResolver } from '#read/type-printer/ref-type';
import {
    type BaseUiTypeMap,
    type Resolver,
    type ResolverContext,
    TYPE_FORMAT_FLAGS,
    simplifyForwardRefType,
    simplifyReactElementGeneric,
} from '#read/type-printer/shared';
import { unionWithFunctionResolver } from '#read/type-printer/union';
import type { Reporter } from '#reporter';
import { type Node, type Type } from 'ts-morph';

/**
 * Order matters: the first resolver that claims the type wins. Narrow, cheap
 * checks come before the ones that walk the type graph.
 */
const RESOLVERS: Resolver[] = [
    refTypeResolver,
    reactAliasResolver,
    primitiveResolver,
    reactElementResolver,
    functionTypeResolver,
    unionWithFunctionResolver,
    baseUiResolver,
    importedTypeResolver,
];

export function resolveType(
    type: Type,
    baseUiMap?: BaseUiTypeMap,
    contextNode?: Node,
    reporter?: Reporter,
): string {
    const rawText = contextNode ? type.getText(contextNode, TYPE_FORMAT_FLAGS) : type.getText();
    const ctx: ResolverContext = { rawText, baseUiMap, contextNode, reporter, resolveType };

    for (const resolver of RESOLVERS) {
        const resolved = resolver.resolve(type, ctx);

        if (resolved !== null) {
            reporter?.debug(`resolveType: "${rawText}" -> ${resolver.name}`);
            return resolved;
        }
    }

    reporter?.debug(`resolveType: "${rawText}" -> fallback`);
    return simplifyReactElementGeneric(simplifyForwardRefType(rawText));
}
