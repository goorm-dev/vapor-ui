import { type Node, type Type } from 'ts-morph';

import type { Reporter } from '~/domain/reporter';
import { baseUiResolver } from '~/infrastructure/ts-morph/type-printer/base-ui-type';
import { functionTypeResolver } from '~/infrastructure/ts-morph/type-printer/function-type';
import { importedTypeResolver } from '~/infrastructure/ts-morph/type-printer/imported-type';
import { primitiveResolver } from '~/infrastructure/ts-morph/type-printer/primitive';
import { reactAliasResolver } from '~/infrastructure/ts-morph/type-printer/react-alias';
import { reactElementResolver } from '~/infrastructure/ts-morph/type-printer/react-element';
import { refTypeResolver } from '~/infrastructure/ts-morph/type-printer/ref-type';
import {
    type BaseUiTypeMap,
    type Resolver,
    type ResolverContext,
    TYPE_FORMAT_FLAGS,
    simplifyForwardRefType,
    simplifyReactElementGeneric,
} from '~/infrastructure/ts-morph/type-printer/shared';
import { unionWithFunctionResolver } from '~/infrastructure/ts-morph/type-printer/union';

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
