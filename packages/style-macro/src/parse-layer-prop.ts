import * as t from '@babel/types';

import type { BuildError } from './types';

export type LayerRegistry = Record<string, string>;

export interface ParseLayerResult {
    order?: string[];
    errors: BuildError[];
}

function locOf(node: t.Node): { line: number; column: number } {
    return {
        line: node.loc?.start.line ?? 1,
        column: node.loc?.start.column ?? 0,
    };
}

function nonStatic(node: t.Node, hint: string): BuildError {
    return {
        code: 'layer-non-static',
        message: `\`layer\` prop must be a static expression: ${hint}`,
        loc: locOf(node),
    };
}

function readArrayLiteral(
    node: t.ArrayExpression,
    registry: LayerRegistry,
    paramName: string | null,
): { order?: string[]; errors: BuildError[] } {
    const errors: BuildError[] = [];
    const order: string[] = [];

    for (const el of node.elements) {
        if (el === null) {
            errors.push(nonStatic(node, 'holes in the array are not allowed.'));
            continue;
        }
        if (t.isSpreadElement(el)) {
            errors.push(nonStatic(el, 'spread elements are not allowed.'));
            continue;
        }
        if (t.isStringLiteral(el)) {
            order.push(el.value);
            continue;
        }
        if (
            paramName &&
            t.isMemberExpression(el) &&
            !el.computed &&
            t.isIdentifier(el.object) &&
            el.object.name === paramName &&
            t.isIdentifier(el.property)
        ) {
            const key = el.property.name;
            const resolved = registry[key];
            if (resolved === undefined) {
                errors.push({
                    code: 'layer-unknown-registry-key',
                    message: `Unknown layer registry key \`${paramName}.${key}\`. Expected one of: ${Object.keys(
                        registry,
                    )
                        .map((k) => `\`${k}\``)
                        .join(', ')}.`,
                    loc: locOf(el),
                });
                continue;
            }
            order.push(resolved);
            continue;
        }
        errors.push(
            nonStatic(
                el,
                paramName
                    ? `each element must be a string literal or \`${paramName}.<key>\` access.`
                    : 'each element must be a string literal.',
            ),
        );
    }

    return errors.length ? { errors } : { order, errors: [] };
}

/**
 * Parse a `<ThemeProvider layer={...}>` JSX attribute expression.
 *
 * Accepted shapes:
 * - Array literal of string literals: `layer={['vapor-theme', ...]}`
 * - Arrow function: `layer={(l) => [l.theme, ..., l.utilities]}`
 *   - Zero or one parameter (identifier only, no destructuring)
 *   - Body is an array literal (or a block returning one)
 *   - Elements: string literals or `<param>.<registry-key>` accesses
 */
export function parseLayerProp(exprNode: t.Expression, registry: LayerRegistry): ParseLayerResult {
    if (t.isArrayExpression(exprNode)) {
        return readArrayLiteral(exprNode, registry, null);
    }

    if (t.isArrowFunctionExpression(exprNode)) {
        if (exprNode.params.length > 1) {
            return {
                errors: [
                    nonStatic(exprNode, 'the arrow function must take zero or one parameter.'),
                ],
            };
        }

        let paramName: string | null = null;
        if (exprNode.params.length === 1) {
            const p = exprNode.params[0];
            if (!t.isIdentifier(p)) {
                return {
                    errors: [
                        nonStatic(
                            p,
                            'the parameter must be a plain identifier (no destructuring).',
                        ),
                    ],
                };
            }
            paramName = p.name;
        }

        let arrayNode: t.ArrayExpression | null = null;
        if (t.isArrayExpression(exprNode.body)) {
            arrayNode = exprNode.body;
        } else if (t.isBlockStatement(exprNode.body)) {
            const stmts = exprNode.body.body;
            if (stmts.length === 1 && t.isReturnStatement(stmts[0]) && stmts[0].argument) {
                if (t.isArrayExpression(stmts[0].argument)) {
                    arrayNode = stmts[0].argument;
                }
            }
        }

        if (!arrayNode) {
            return {
                errors: [
                    nonStatic(
                        exprNode.body,
                        'the arrow body must be an array literal (or `{ return [...]; }`).',
                    ),
                ],
            };
        }

        return readArrayLiteral(arrayNode, registry, paramName);
    }

    return {
        errors: [
            nonStatic(exprNode, 'expected an array literal or an arrow function returning one.'),
        ],
    };
}
