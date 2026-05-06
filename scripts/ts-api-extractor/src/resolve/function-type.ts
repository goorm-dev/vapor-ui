import type { Type } from 'ts-morph';

import type { ResolverContext } from '~/resolve/shared';

function getFunctionSignatures(type: Type) {
    let callSignatures = type.getCallSignatures();

    if (callSignatures.length === 0 && type.isUnion()) {
        const nonNullish = type
            .getUnionTypes()
            .filter((member) => !member.isUndefined() && !member.isNull());
        if (nonNullish.length === 1 && nonNullish[0].getCallSignatures().length > 0) {
            callSignatures = nonNullish[0].getCallSignatures();
        }
    }

    return callSignatures;
}

export function isFunctionType(type: Type): boolean {
    return getFunctionSignatures(type).length > 0;
}

export function resolveFunctionType(type: Type, ctx: ResolverContext): string {
    const callSignatures = getFunctionSignatures(type);
    const signature = callSignatures[0];
    const params = signature.getParameters();
    const returnType = signature.getReturnType();

    const paramStrings = params.map((param) => {
        const paramName = param.getName();
        const declarations = param.getDeclarations();
        const node = declarations[0] ?? param.getValueDeclaration();

        if (!node) {
            const decl = signature.getDeclaration();
            if (!decl) {
                return `${paramName}: unknown`;
            }

            const paramType = param.getTypeAtLocation(decl);
            return `${paramName}: ${ctx.resolveType(paramType, ctx.baseUiMap, ctx.contextNode, ctx.verbose)}`;
        }

        const paramType = param.getTypeAtLocation(node);
        const resolvedParamType = ctx.resolveType(
            paramType,
            ctx.baseUiMap,
            ctx.contextNode,
            ctx.verbose,
        );
        return `${paramName}: ${resolvedParamType}`;
    });

    const resolvedReturnType = ctx.resolveType(
        returnType,
        ctx.baseUiMap,
        ctx.contextNode,
        ctx.verbose,
    );
    const wrappedReturn = resolvedReturnType.includes(' | ')
        ? `(${resolvedReturnType})`
        : resolvedReturnType;

    return `(${paramStrings.join(', ')}) => ${wrappedReturn}`;
}
