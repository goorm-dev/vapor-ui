import { type Node, type Type } from 'ts-morph';

import type { BaseUiTypeMap } from '~/models/internal';
import { isBaseUiType, resolveMappedBaseUiType } from '~/resolve/base-ui-type';
import { isFunctionType, resolveFunctionType } from '~/resolve/function-type';
import { isImportedType, resolveImportedType } from '~/resolve/imported-type';
import { isPrimitive, resolvePrimitive } from '~/resolve/primitive';
import { isReactAlias, resolveReactAlias } from '~/resolve/react-alias';
import { isReactElement, resolveReactElement } from '~/resolve/react-element';
import { isRefType, resolveRefType } from '~/resolve/ref-type';
import {
    type ResolverContext,
    TYPE_FORMAT_FLAGS,
    simplifyForwardRefType,
    simplifyReactElementGeneric,
} from '~/resolve/shared';
import { isUnionWithFunction, resolveUnionWithFunction } from '~/resolve/union';

function logResolution(rawText: string, label: string, verbose?: boolean) {
    if (verbose) {
        console.error(`[verbose] resolveType: "${rawText}" -> ${label}`);
    }
}

export function resolveType(
    type: Type,
    baseUiMap?: BaseUiTypeMap,
    contextNode?: Node,
    verbose?: boolean,
): string {
    const rawText = contextNode ? type.getText(contextNode, TYPE_FORMAT_FLAGS) : type.getText();
    const ctx: ResolverContext = { type, rawText, baseUiMap, contextNode, verbose, resolveType };

    if (isRefType(rawText)) {
        logResolution(rawText, 'ref-type', verbose);
        return resolveRefType(rawText);
    }

    if (isReactAlias(type)) {
        logResolution(rawText, 'react-alias', verbose);
        return resolveReactAlias(type);
    }

    if (isPrimitive(type)) {
        logResolution(rawText, 'primitive', verbose);
        return resolvePrimitive(type);
    }

    if (isReactElement(type)) {
        logResolution(rawText, 'react-element', verbose);
        return resolveReactElement(type);
    }

    if (isFunctionType(type)) {
        logResolution(rawText, 'function-type', verbose);
        return resolveFunctionType(type, ctx);
    }

    if (isUnionWithFunction(type)) {
        logResolution(rawText, 'union-with-function', verbose);
        return resolveUnionWithFunction(type, ctx);
    }

    if (isBaseUiType(type, baseUiMap)) {
        logResolution(rawText, 'base-ui-type', verbose);
        return resolveMappedBaseUiType(type, baseUiMap!) ?? rawText;
    }

    if (isImportedType(rawText)) {
        logResolution(rawText, 'imported-type', verbose);
        return resolveImportedType(rawText);
    }

    logResolution(rawText, 'fallback', verbose);
    return simplifyReactElementGeneric(simplifyForwardRefType(rawText));
}
