import { Node, type Signature, type Type } from 'ts-morph';

export interface Parameter {
    name: string;
    /** Written `name?:` or with a default, so `| undefined` goes unsaid. */
    optional: boolean;
    /** Undefined when TypeScript has nowhere to read the type from; it prints `unknown`. */
    type?: Type;
}

export function parametersOf(signature: Signature): Parameter[] {
    return signature.getParameters().map((param) => {
        const node: Node | undefined =
            param.getDeclarations()[0] ?? param.getValueDeclaration() ?? signature.getDeclaration();
        const optional =
            Node.isParameterDeclaration(node) && (node.hasQuestionToken() || node.hasInitializer());
        return { name: param.getName(), optional, type: node && param.getTypeAtLocation(node) };
    });
}

/** `(a: A, b: B) => R`, the return wrapped when it is a union so it doesn't swallow the arrow. */
export function formatFunction(params: string[], returnText: string): string {
    const wrappedReturn = returnText.includes(' | ') ? `(${returnText})` : returnText;
    return `(${params.join(', ')}) => ${wrappedReturn}`;
}
