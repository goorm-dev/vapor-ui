import 'estree-jsx';

/**
 * This file augments the `estree-jsx` types to include types that are not built-in to `estree-jsx` but are part of the JSX AST spec.
 * These types are necessary for writing ESLint rules that interact with JSX AST nodes.
 *
 * References:
 * - https://github.com/facebook/jsx/blob/main/AST.md
 */
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
