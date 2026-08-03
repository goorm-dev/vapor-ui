import { type Node, type Type } from 'ts-morph';

import type { BaseUiTypeMap } from '~/models/pipeline';
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

export function resolveType(type: Type, baseUiMap?: BaseUiTypeMap, contextNode?: Node): string {
    const rawText = contextNode ? type.getText(contextNode, TYPE_FORMAT_FLAGS) : type.getText();
    const ctx: ResolverContext = { type, rawText, baseUiMap, contextNode, resolveType };

    if (isRefType(rawText)) return resolveRefType(rawText);
    if (isReactAlias(type)) return resolveReactAlias(type);
    if (isPrimitive(type)) return resolvePrimitive(type);
    if (isReactElement(type)) return resolveReactElement(type);
    if (isFunctionType(type)) return resolveFunctionType(type, ctx);
    if (isUnionWithFunction(type)) return resolveUnionWithFunction(type, ctx);
    if (isBaseUiType(type, baseUiMap)) return resolveMappedBaseUiType(type, baseUiMap!) ?? rawText;
    if (isImportedType(rawText)) return resolveImportedType(rawText);

    return simplifyReactElementGeneric(simplifyForwardRefType(rawText));
}
