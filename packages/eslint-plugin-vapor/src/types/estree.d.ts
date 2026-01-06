import 'estree-jsx';

declare module 'estree-jsx' {
    interface JSXMemberExpression {
        type: 'JSXMemberExpression';
        object: JSXIdentifier | JSXMemberExpression;
        property: JSXIdentifier;
    }

    interface JSXNamespacedName {
        type: 'JSXNamespacedName';
        namespace: JSXIdentifier;
        name: JSXIdentifier;
    }
}
