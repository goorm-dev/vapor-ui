import _generate from '@babel/generator';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import * as t from '@babel/types';

import { buildClassName, type ClassNameMode } from './class-name';
import { classifyCondition } from './condition';
import { emitCss } from './emit-css';
import { parseCallArgs } from './parse-call';
import type { RawEntry, RawValue } from './parse-call';
import { shortenProperty } from './property-shorthand';
import { resolveToken } from './tokens';
import type { BuildError, ConditionKey, ManifestShape, Tuple } from './types';
import { validateInput } from './validate-input';

const traverse = (_traverse as unknown as { default?: typeof _traverse }).default ?? _traverse;
const generate = (_generate as unknown as { default?: typeof _generate }).default ?? _generate;

export interface TransformResult {
    code: string;
    css: string | null;
    classes: string[];
    errors: BuildError[];
}

export interface TransformOpts {
    source: string;
    filename: string;
    manifest: ManifestShape;
    importSource?: string | string[];
    importName?: string;
    obfuscate?: boolean;
}

function valueShortFromLiteral(literal: string | number): string {
    return String(literal)
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '');
}

function tupleFor(
    property: string,
    cond: ConditionKey,
    raw: RawValue,
    manifest: ManifestShape,
): Tuple {
    const propertyShort = shortenProperty(property);
    if (raw.kind === 'literal') {
        return {
            property,
            propertyShort,
            valueShort: valueShortFromLiteral(raw.literal!),
            cssValue: String(raw.literal),
            condition: cond,
        };
    }
    const res = resolveToken(manifest, property, raw.token!);
    if ('error' in res) throw new Error('validateInput should have caught this');
    return {
        property,
        propertyShort,
        valueShort: raw.token!,
        cssValue: `var(${res.cssVar})`,
        condition: cond,
    };
}

function buildEntryExpression(
    entry: RawEntry,
    manifest: ManifestShape,
    tuples: Tuple[],
    allClasses: Set<string>,
    mode: ClassNameMode,
): t.Expression | null {
    if (entry.value?.kind === 'ternary') {
        const conseq = tupleFor(
            entry.property,
            { kind: 'default' },
            entry.value.consequent!,
            manifest,
        );
        const alt = tupleFor(entry.property, { kind: 'default' }, entry.value.alternate!, manifest);
        tuples.push(conseq, alt);
        const conseqCls = buildClassName(conseq, mode);
        const altCls = buildClassName(alt, mode);
        allClasses.add(conseqCls);
        allClasses.add(altCls);
        return t.conditionalExpression(
            t.cloneNode(entry.testNode!),
            t.stringLiteral(conseqCls),
            t.stringLiteral(altCls),
        );
    }

    if (entry.conditions) {
        const classNames: string[] = [];
        for (const c of entry.conditions) {
            const cond = classifyCondition(c.conditionKey);
            if ('error' in cond) continue;
            const tup = tupleFor(entry.property, cond, c.value, manifest);
            tuples.push(tup);
            const cls = buildClassName(tup, mode);
            classNames.push(cls);
            allClasses.add(cls);
        }
        if (!classNames.length) return null;
        return t.stringLiteral(classNames.sort().join(' '));
    }

    if (entry.value) {
        const tup = tupleFor(entry.property, { kind: 'default' }, entry.value, manifest);
        tuples.push(tup);
        const cls = buildClassName(tup, mode);
        allClasses.add(cls);
        return t.stringLiteral(cls);
    }

    return null;
}

export function transform(opts: TransformOpts): TransformResult {
    const importSourceRaw = opts.importSource ?? ['@vapor-ui/core', '@vapor-ui/core/style'];
    const importSources = new Set(
        Array.isArray(importSourceRaw) ? importSourceRaw : [importSourceRaw],
    );
    const importName = opts.importName ?? '$style';
    const mode: ClassNameMode = opts.obfuscate ? 'hashed' : 'readable';

    let ast: ReturnType<typeof parse>;
    try {
        ast = parse(opts.source, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
            sourceFilename: opts.filename,
        });
    } catch {
        return { code: opts.source, css: null, classes: [], errors: [] };
    }

    const errors: BuildError[] = [];
    const allTuples: Tuple[] = [];
    const allClasses = new Set<string>();
    let bindingName: string | null = null;

    traverse(ast, {
        ImportDeclaration(path) {
            if (!importSources.has(path.node.source.value)) return;
            for (const spec of path.node.specifiers) {
                if (
                    t.isImportSpecifier(spec) &&
                    t.isIdentifier(spec.imported) &&
                    spec.imported.name === importName
                ) {
                    bindingName = spec.local.name;
                }
            }
        },
    });

    if (!bindingName) {
        return { code: opts.source, css: null, classes: [], errors: [] };
    }

    traverse(ast, {
        CallExpression(path) {
            const callee = path.node.callee;
            if (!t.isIdentifier(callee) || callee.name !== bindingName) return;
            const arg = path.node.arguments[0];
            if (!t.isObjectExpression(arg)) {
                errors.push({
                    code: 'invalid-input-shape',
                    message: '$style() requires an object literal argument.',
                    loc: {
                        line: path.node.loc?.start.line ?? 1,
                        column: path.node.loc?.start.column ?? 0,
                    },
                });
                return;
            }

            const entries = parseCallArgs(arg);

            for (const [idx, entry] of entries.entries()) {
                const prop = arg.properties[idx];
                if (!prop || !t.isObjectProperty(prop)) continue;
                if (t.isConditionalExpression(prop.value)) {
                    entry.testNode = prop.value.test;
                }
            }

            const inputErrors = validateInput(entries, opts.manifest);
            errors.push(...inputErrors);
            if (inputErrors.length) return;

            const entryNodes: t.Expression[] = [];
            for (const entry of entries) {
                if (entry.error) continue;
                const expr = buildEntryExpression(
                    entry,
                    opts.manifest,
                    allTuples,
                    allClasses,
                    mode,
                );
                if (expr) entryNodes.push(expr);
            }

            const allStatic = entryNodes.every((n) => t.isStringLiteral(n));
            if (entryNodes.length === 1) {
                path.replaceWith(entryNodes[0]);
            } else if (allStatic) {
                const tokens = entryNodes
                    .flatMap((n) => (n as t.StringLiteral).value.split(/\s+/))
                    .filter(Boolean)
                    .sort();
                path.replaceWith(t.stringLiteral(tokens.join(' ')));
            } else {
                const arr = t.arrayExpression(entryNodes);
                const filter = t.callExpression(t.memberExpression(arr, t.identifier('filter')), [
                    t.identifier('Boolean'),
                ]);
                const join = t.callExpression(t.memberExpression(filter, t.identifier('join')), [
                    t.stringLiteral(' '),
                ]);
                path.replaceWith(join);
            }
        },
    });

    if (errors.length) {
        return { code: opts.source, css: null, classes: [], errors };
    }

    const { code } = generate(ast, { retainLines: false, comments: true }, opts.source);
    const css = allTuples.length ? emitCss(allTuples, mode) : null;
    return { code, css, classes: [...allClasses].sort(), errors: [] };
}
