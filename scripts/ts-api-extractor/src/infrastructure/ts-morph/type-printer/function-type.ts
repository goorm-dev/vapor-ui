import type { Type } from 'ts-morph';

import type { Resolver, ResolverContext } from '~/infrastructure/ts-morph/type-printer/shared';

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

function isFunctionType(type: Type): boolean {
    return getFunctionSignatures(type).length > 0;
}

function resolveFunctionType(type: Type, ctx: ResolverContext): string {
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
            return `${paramName}: ${ctx.resolveType(paramType, ctx.baseUiMap, ctx.contextNode, ctx.reporter)}`;
        }

        const paramType = param.getTypeAtLocation(node);
        const resolvedParamType = ctx.resolveType(
            paramType,
            ctx.baseUiMap,
            ctx.contextNode,
            ctx.reporter,
        );
        return `${paramName}: ${resolvedParamType}`;
    });

    const resolvedReturnType = ctx.resolveType(
        returnType,
        ctx.baseUiMap,
        ctx.contextNode,
        ctx.reporter,
    );
    const wrappedReturn = resolvedReturnType.includes(' | ')
        ? `(${resolvedReturnType})`
        : resolvedReturnType;

    return `(${paramStrings.join(', ')}) => ${wrappedReturn}`;
}

export const functionTypeResolver: Resolver = {
    name: 'function-type',
    resolve: (type, ctx) => (isFunctionType(type) ? resolveFunctionType(type, ctx) : null),
};
