import type { Node, Signature, Type } from 'ts-morph';

/** The call signature of a function type, also when it is written `fn | undefined`. */
export function functionSignature(type: Type): Signature | undefined {
    const [signature] = type.getCallSignatures();
    if (signature || !type.isUnion()) return signature;

    const nonNullish = type
        .getUnionTypes()
        .filter((member) => !member.isUndefined() && !member.isNull());
    return nonNullish.length === 1 ? nonNullish[0].getCallSignatures()[0] : undefined;
}

export interface Parameter {
    name: string;
    /** Undefined when TypeScript has nowhere to read the type from; it prints `unknown`. */
    type?: Type;
}

export function parametersOf(signature: Signature): Parameter[] {
    return signature.getParameters().map((param) => {
        const node: Node | undefined =
            param.getDeclarations()[0] ?? param.getValueDeclaration() ?? signature.getDeclaration();
        return { name: param.getName(), type: node && param.getTypeAtLocation(node) };
    });
}

/** `(a: A, b: B) => R`, the return wrapped when it is a union so it doesn't swallow the arrow. */
export function formatFunction(params: string[], returnText: string): string {
    const wrappedReturn = returnText.includes(' | ') ? `(${returnText})` : returnText;
    return `(${params.join(', ')}) => ${wrappedReturn}`;
}
