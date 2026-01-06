import type { JSXIdentifier, JSXMemberExpression, JSXNamespacedName } from 'estree-jsx';

type JSXNode = JSXIdentifier | JSXMemberExpression | JSXNamespacedName;

export const isJSXIdentifier = (node: JSXNode): node is JSXIdentifier =>
    node?.type === 'JSXIdentifier';

export const isJSXMemberExpression = (node: JSXNode): node is JSXMemberExpression =>
    node?.type === 'JSXMemberExpression';
