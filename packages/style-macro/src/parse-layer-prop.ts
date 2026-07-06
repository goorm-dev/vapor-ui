/* eslint-disable @typescript-eslint/no-explicit-any */

import type { BuildError } from './types';

export type LayerRegistry = Record<string, string>;

export interface ParseLayerResult {
    order: string[] | null;
    errors: BuildError[];
}

function locOf(node: any): { line: number; column: number } {
    const start = node.loc?.start;
    return {
        line: start?.line ?? 1,
        column: start?.column ?? 0,
    };
}

function nonStatic(node: any, hint: string): BuildError {
    return {
        code: 'layer-non-static',
        message: `\`layer\` prop must be a static expression: ${hint}`,
        loc: locOf(node),
    };
}

function readArrayLiteral(
    node: any,
    registry: LayerRegistry,
    paramName: string | null,
): { order: string[] | null; errors: BuildError[] } {
    const errors: BuildError[] = [];
    const order: string[] = [];

    for (const el of node.elements) {
        if (el === null) {
            errors.push(nonStatic(node, 'holes in the array are not allowed.'));
            continue;
        }
        if (el.type === 'SpreadElement') {
            errors.push(nonStatic(el, 'spread elements are not allowed.'));
            continue;
        }
        if (el.type === 'Literal' && typeof el.value === 'string') {
            order.push(el.value);
            continue;
        }
        if (
            paramName &&
            el.type === 'MemberExpression' &&
            !el.computed &&
            el.object.type === 'Identifier' &&
            el.object.name === paramName &&
            el.property.type === 'Identifier'
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

    return errors.length ? { order: null, errors } : { order, errors: [] };
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
export function parseLayerProp(exprNode: any, registry: LayerRegistry): ParseLayerResult {
    if (exprNode.type === 'ArrayExpression') {
        return readArrayLiteral(exprNode, registry, null);
    }

    if (exprNode.type === 'ArrowFunctionExpression') {
        if (exprNode.params.length > 1) {
            return {
                order: null,
                errors: [nonStatic(exprNode, 'the arrow function must take zero or one parameter.')],
            };
        }

        let paramName: string | null = null;
        if (exprNode.params.length === 1) {
            const p = exprNode.params[0];
            if (p.type !== 'Identifier') {
                return {
                    order: null,
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

        const body = exprNode.body;

        if (body.type === 'ArrayExpression') {
            return readArrayLiteral(body, registry, paramName);
        }

        if (body.type === 'BlockStatement') {
            const stmts = body.body;
            if (stmts.length === 1 && stmts[0].type === 'ReturnStatement' && stmts[0].argument) {
                const ret = stmts[0].argument;
                if (ret.type === 'ArrayExpression') {
                    return readArrayLiteral(ret, registry, paramName);
                }
                return {
                    order: null,
                    errors: [
                        nonStatic(
                            ret,
                            'the arrow body must be an array literal (or `{ return [...]; }`).',
                        ),
                    ],
                };
            }
            return {
                order: null,
                errors: [
                    nonStatic(
                        body,
                        'the arrow body must be an array literal (or `{ return [...]; }`).',
                    ),
                ],
            };
        }

        return {
            order: null,
            errors: [
                nonStatic(
                    body,
                    'the arrow body must be an array literal (or `{ return [...]; }`).',
                ),
            ],
        };
    }

    return {
        order: null,
        errors: [
            nonStatic(exprNode, 'expected an array literal or an arrow function returning one.'),
        ],
    };
}
