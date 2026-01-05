import type { JSXIdentifier } from 'estree-jsx';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any;

interface JSXMemberExpression {
    type: 'JSXMemberExpression';
    object: JSXIdentifier | JSXMemberExpression;
    property: JSXIdentifier;
}

export const isJSXIdentifier = (node: Any): node is JSXIdentifier => node?.type === 'JSXIdentifier';

export const isJSXMemberExpression = (node: Any): node is JSXMemberExpression =>
    node?.type === 'JSXMemberExpression';
