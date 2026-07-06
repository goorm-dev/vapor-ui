/* eslint-disable @typescript-eslint/no-explicit-any */
import MagicString from 'magic-string';
import { parseSync } from 'oxc-parser';

import { type ClassNameMode, buildClassName } from './class-name';
import { classifyCondition } from './condition';
import { emitCss } from './emit-css';
import { walk } from './oxc-walk';
import { parseCallArgs, type RawEntry, type RawValue } from './parse-call';
import { type LayerRegistry, parseLayerProp } from './parse-layer-prop';
import { shortenProperty } from './property-shorthand';
import { resolveToken } from './tokens';
import type { BuildError, ConditionKey, ManifestShape, Tuple } from './types';
import { validateInput } from './validate-input';

export interface TransformResult {
    code: string;
    css: string | null;
    classes: string[];
    layerOrder: string[] | null;
    errors: BuildError[];
}

export interface TransformOpts {
    source: string;
    filename: string;
    manifest: ManifestShape;
    importSource?: string | string[];
    importName?: string;
    obfuscate?: boolean;
    /**
     * Module specifier(s) the layer-owning Provider component is imported
     * from. When any of these sources appear alongside a matching import
     * name, the transform inspects `<Provider layer={...}>` JSX for a
     * static layer-order expression.
     */
    providerImportSource?: string | string[];
    /** Provider component name (import specifier). Defaults to `ThemeProvider`. */
    providerImportName?: string;
    /**
     * Layer registry used to resolve `<param>.<key>` accesses inside a
     * `layer` prop arrow function. Only used when Provider handling is
     * enabled via `providerImportSource`.
     */
    layerRegistry?: LayerRegistry;
}

const EMPTY_RESULT = (source: string): TransformResult => ({
    code: source,
    css: null,
    classes: [],
    layerOrder: null,
    errors: [],
});

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

type EntryPart =
    | { kind: 'static'; value: string }
    | { kind: 'ternary'; expr: string };

function buildEntryPart(
    entry: RawEntry,
    source: string,
    manifest: ManifestShape,
    tuples: Tuple[],
    allClasses: Set<string>,
    mode: ClassNameMode,
): EntryPart | null {
    if (entry.value?.kind === 'ternary') {
        const testNode = entry.value.testNode as any;
        const testSrc = source.slice(testNode.start, testNode.end);
        const conseqTuple = tupleFor(
            entry.property,
            { kind: 'default' },
            entry.value.consequent!,
            manifest,
        );
        const altTuple = tupleFor(
            entry.property,
            { kind: 'default' },
            entry.value.alternate!,
            manifest,
        );
        tuples.push(conseqTuple, altTuple);
        const conseqCls = buildClassName(conseqTuple, mode);
        const altCls = buildClassName(altTuple, mode);
        allClasses.add(conseqCls);
        allClasses.add(altCls);
        return {
            kind: 'ternary',
            expr: `(${testSrc} ? ${JSON.stringify(conseqCls)} : ${JSON.stringify(altCls)})`,
        };
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
        return { kind: 'static', value: classNames.sort().join(' ') };
    }

    if (entry.value) {
        const tup = tupleFor(entry.property, { kind: 'default' }, entry.value, manifest);
        tuples.push(tup);
        const cls = buildClassName(tup, mode);
        allClasses.add(cls);
        return { kind: 'static', value: cls };
    }

    return null;
}

function jsSingleQuoted(value: string): string {
    // Escape backslashes and single quotes; escape other special chars the same way JSON.stringify would.
    return "'" + value
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029')
        + "'";
}

function buildReplacement(
    entries: RawEntry[],
    source: string,
    manifest: ManifestShape,
    tuples: Tuple[],
    allClasses: Set<string>,
    mode: ClassNameMode,
): string {
    const parts: EntryPart[] = [];
    for (const entry of entries) {
        if (entry.error) continue;
        const part = buildEntryPart(entry, source, manifest, tuples, allClasses, mode);
        if (part) parts.push(part);
    }

    // Matches babel: `[].every(fn)` is vacuously true → empty entries → ""
    const allStatic = parts.every((p) => p.kind === 'static');
    if (parts.length === 1) {
        const p = parts[0];
        return p.kind === 'static' ? jsSingleQuoted(p.value) : p.expr;
    }
    if (allStatic) {
        const tokens = parts
            .flatMap((p) => (p as { kind: 'static'; value: string }).value.split(/\s+/))
            .filter(Boolean)
            .sort();
        return jsSingleQuoted(tokens.join(' '));
    }
    const frags = parts.map((p) =>
        p.kind === 'static' ? jsSingleQuoted(p.value) : p.expr,
    );
    return `[${frags.join(', ')}].filter(Boolean).join(' ')`;
}

export function transform(opts: TransformOpts): TransformResult {
    const importSourceRaw = opts.importSource ?? '@vapor-ui/style-macro';
    const importSources = new Set(
        Array.isArray(importSourceRaw) ? importSourceRaw : [importSourceRaw],
    );
    const importName = opts.importName ?? '$style';
    const mode: ClassNameMode = opts.obfuscate ? 'hashed' : 'readable';

    const providerSourcesRaw = opts.providerImportSource ?? [];
    const providerSources = new Set(
        Array.isArray(providerSourcesRaw) ? providerSourcesRaw : [providerSourcesRaw],
    );
    const providerImportName = opts.providerImportName ?? 'ThemeProvider';
    const layerRegistry = opts.layerRegistry ?? {};

    // Content pre-check: if the source mentions neither the macro import name
    // (default `$style`) nor the Provider import name (default `ThemeProvider`),
    // there's nothing to rewrite. Skip oxc-parser entirely — the vast
    // majority of files in a typical app take this fast path.
    const hasMacroMarker = opts.source.includes(importName);
    const hasProviderMarker = providerSources.size > 0 && opts.source.includes(providerImportName);
    if (!hasMacroMarker && !hasProviderMarker) return EMPTY_RESULT(opts.source);

    const parsed = parseSync(opts.filename, opts.source, {
        sourceType: 'module',
        lang: 'tsx',
    }) as any;
    if (parsed.errors?.length) return EMPTY_RESULT(opts.source);

    const program = parsed.program;

    const errors: BuildError[] = [];
    const allTuples: Tuple[] = [];
    const allClasses = new Set<string>();
    let bindingName: string | null = null;
    let providerBindingName: string | null = null;

    // Linear scan for import declarations — faster than a full walk
    for (const stmt of program.body) {
        if (stmt.type !== 'ImportDeclaration') continue;
        const src = stmt.source.value as string;
        const matchesMacro = importSources.has(src);
        const matchesProvider = providerSources.has(src);
        if (!matchesMacro && !matchesProvider) continue;
        for (const spec of stmt.specifiers) {
            if (spec.type !== 'ImportSpecifier' || spec.imported.type !== 'Identifier') continue;
            if (matchesMacro && spec.imported.name === importName) {
                bindingName = spec.local.name;
            }
            if (matchesProvider && spec.imported.name === providerImportName) {
                providerBindingName = spec.local.name;
            }
        }
    }

    let layerOrder: string[] | null = null;
    const ms = new MagicString(opts.source);

    walk(program, {
        JSXOpeningElement: (node: any) => {
            if (!providerBindingName) return;
            const nameNode = node.name;
            if (
                nameNode.type !== 'JSXIdentifier' ||
                nameNode.name !== providerBindingName
            ) return;
            const layerAttr = (node.attributes as any[]).find(
                (a: any) =>
                    a.type === 'JSXAttribute' &&
                    a.name?.type === 'JSXIdentifier' &&
                    a.name.name === 'layer',
            );
            if (!layerAttr) return;
            const val = layerAttr.value;
            if (!val || val.type !== 'JSXExpressionContainer') {
                errors.push({
                    code: 'layer-non-static',
                    message:
                        '`layer` prop must be a static expression: expected `layer={...}`, not a string literal.',
                    loc: {
                        line: layerAttr.loc?.start.line ?? 1,
                        column: layerAttr.loc?.start.column ?? 0,
                    },
                });
                return;
            }
            const exprNode = val.expression;
            if (exprNode.type === 'JSXEmptyExpression') return;
            const result = parseLayerProp(exprNode, layerRegistry);
            if (result.errors.length) {
                errors.push(...result.errors);
                return;
            }
            if (layerOrder !== null) {
                errors.push({
                    code: 'layer-non-static',
                    message: 'Multiple <ThemeProvider layer={...}> occurrences in the same file are not allowed.',
                    loc: {
                        line: node.loc?.start.line ?? 1,
                        column: node.loc?.start.column ?? 0,
                    },
                });
                return;
            }
            layerOrder = result.order ?? null;
        },
        CallExpression: (node: any) => {
            if (!bindingName) return;
            if (node.callee.type !== 'Identifier' || node.callee.name !== bindingName) return;
            const arg = node.arguments[0];
            if (!arg || arg.type !== 'ObjectExpression') {
                errors.push({
                    code: 'invalid-input-shape',
                    message: '$style() requires an object literal argument.',
                    loc: {
                        line: node.loc?.start.line ?? 1,
                        column: node.loc?.start.column ?? 0,
                    },
                });
                return;
            }

            const entries = parseCallArgs(arg);
            const inputErrors = validateInput(entries, opts.manifest);
            errors.push(...inputErrors);
            if (inputErrors.length) return;

            const replacement = buildReplacement(
                entries,
                opts.source,
                opts.manifest,
                allTuples,
                allClasses,
                mode,
            );
            ms.overwrite(node.start, node.end, replacement);
        },
    });

    if (errors.length) {
        return {
            code: opts.source,
            css: null,
            classes: [],
            layerOrder,
            errors,
        };
    }

    return {
        code: ms.toString(),
        css: allTuples.length ? emitCss(allTuples, mode) : null,
        classes: [...allClasses].sort(),
        layerOrder,
        errors: [],
    };
}
