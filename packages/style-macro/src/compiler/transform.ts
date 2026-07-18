import MagicString from 'magic-string';
import { parseSync } from 'oxc-parser';

import { type ClassNameMode, buildClassName } from '~/model/class-name';
import { classifyCondition } from '~/model/condition';
import { shortenProperty } from '~/model/property-shorthand';
import { resolveToken } from '~/model/tokens';
import type { AnyProp, BuildError, ConditionKey, ManifestShape, Tuple } from '~/model/types';

import { emitCss } from './emit-css';
import { walk } from './oxc-walk';
import { type RawEntry, type RawValue, parseCallArgs } from './parse-call';
import { validateInput } from './validate-input';

// ────────────────────────────────────────────────────────────────
// Public API (unchanged — adapters keep importing `transform`)
// ────────────────────────────────────────────────────────────────

/**
 * Outcome of a single-file transform pass.
 *
 * Adapters consume this to decide what to write back to the bundler:
 * rewritten JS (`code`), a virtual CSS asset (`css`), the set of class
 * names actually referenced (`classes`), and layer-order injection hints
 * (`hasProviderImport`, `errors`).
 */
export interface TransformResult {
    /** Rewritten source. Identical to the input when the file had no `styles()` calls or when `errors` is non-empty. */
    code: string;
    /** Generated stylesheet, or `null` when the file produced no rules. */
    css: string | null;
    /** All class names referenced by rewritten call sites in this file (deduped). Adapters use this to prune unused rules across the graph. */
    classes: string[];
    /**
     * `true` when the source file imports the layer-owning Provider component
     * (identified by `providerImportSource` + `providerImportName`). Adapters
     * use this to decide whether to inject the layer-order CSS import into
     * this file's dependency graph.
     */
    hasProviderImport: boolean;
    /** Build-time diagnostics. Non-empty means the file was left untouched (`code === source`, `css === null`). */
    errors: BuildError[];
}

/**
 * Configuration for a single-file transform pass.
 *
 * `source` + `filename` + `manifest` are required; everything else has a
 * sensible default. The macro is hardcoded to the `styles` export from
 * `@vapor-ui/core` — there is no override.
 */
export interface TransformOpts {
    /** Raw file contents to transform. */
    source: string;
    /** Path used for parser diagnostics and sourcemap lookup. Does not need to exist on disk. */
    filename: string;
    /** Design-token manifest that resolves `$token` references to CSS variables. */
    manifest: ManifestShape;
    /**
     * When `true`, emit hashed class names instead of readable ones.
     * Reduces bundle size in production; keep off during development for
     * DevTools legibility.
     * @default false
     */
    obfuscate?: boolean;
    /**
     * Module specifier(s) the layer-owning Provider component is imported
     * from. When any of these sources appear with a matching import name,
     * the transform sets `hasProviderImport` so adapters can inject the
     * layer-order declaration into this file's chunk.
     */
    providerImportSource?: string[];
    /**
     * Provider component name (import specifier).
     * @default 'ThemeProvider'
     */
    providerImportName?: string;

    // TODO(roadmap): additional build-time options under review — do not
    // implement in this refactor, but keep them on the radar so the shape
    // of TransformOpts stays consistent when they land:
    //   - hash?: boolean         // opt-in class-name hashing (may supersede/coexist with `obfuscate`)
    //   - prefix?: string        // class-name prefix for multi-tenant / embed scenarios
    //   - lightningcss?: boolean // pipe generated CSS through Lightning CSS (nesting, autoprefix)
    //   - minify?: boolean       // minify emitted CSS
}

/**
 * Transform a single file's source, rewriting `styles({...})` calls into
 * plain class-name strings and returning the CSS those calls produced.
 *
 * Thin wrapper over {@link Transformer} — adapters should call this
 * instead of instantiating the class directly.
 */
export function transform(opts: TransformOpts): TransformResult {
    return new Transformer(opts).run();
}

// ────────────────────────────────────────────────────────────────
// Transformer — owns per-file state, threads it through methods
// ────────────────────────────────────────────────────────────────

const MACRO_IMPORT_SOURCE = '@vapor-ui/core';
const MACRO_IMPORT_NAME = 'styles';

class Transformer {
    readonly #providerSources: Set<string>;
    readonly #providerImportName: string;
    readonly #mode: ClassNameMode;

    readonly #tuples: Tuple[] = [];
    readonly #classes = new Set<string>();
    readonly #errors: BuildError[] = [];

    #bindingName: string | null = null;
    #hasProviderImport = false;
    #ms: MagicString | null = null;

    constructor(private readonly opts: TransformOpts) {
        const { providerImportName, providerImportSource = [], obfuscate } = opts;

        this.#providerSources = new Set(providerImportSource);
        this.#providerImportName = providerImportName ?? 'ThemeProvider';
        this.#mode = obfuscate ? 'hashed' : 'readable';
    }

    run(): TransformResult {
        const { source, filename } = this.opts;

        if (this.#shouldSkip()) return emptyResult(source);

        const parsed = parseSync(filename, source, {
            sourceType: 'module',
            lang: 'tsx',
        });

        if (parsed.errors?.length) return emptyResult(source);

        const program = parsed.program;

        this.#scanImports(program);
        this.#ms = new MagicString(source);

        walk(program, { CallExpression: this.#onCallExpression });

        return this.#finalize();
    }

    // ── pipeline stages ────────────────────────────────────────

    #shouldSkip(): boolean {
        const { source } = this.opts;

        const hasMacro = source.includes(MACRO_IMPORT_NAME);
        const hasProvider =
            this.#providerSources.size > 0 && source.includes(this.#providerImportName);

        return !hasMacro && !hasProvider;
    }

    #scanImports(program: AnyProp): void {
        for (const stmt of program.body) {
            if (stmt.type !== 'ImportDeclaration') continue;

            this.#scanImportDeclaration(stmt);
        }
    }

    #scanImportDeclaration(stmt: AnyProp): void {
        const src: string = stmt.source.value;
        const matchesMacro = src === MACRO_IMPORT_SOURCE;
        const matchesProvider = this.#providerSources.has(src);

        if (!matchesMacro && !matchesProvider) return;

        for (const spec of stmt.specifiers) {
            this.#scanImportSpecifier(spec, matchesMacro, matchesProvider);
        }
    }

    #scanImportSpecifier(spec: AnyProp, matchesMacro: boolean, matchesProvider: boolean): void {
        if (spec.type !== 'ImportSpecifier' || spec.imported.type !== 'Identifier') return;

        if (matchesMacro && spec.imported.name === MACRO_IMPORT_NAME) {
            this.#bindingName = spec.local.name;
        }
        if (matchesProvider && spec.imported.name === this.#providerImportName) {
            this.#hasProviderImport = true;
        }
    }

    #onCallExpression = (node: AnyProp): void => {
        if (!this.#bindingName) return;
        if (node.callee.type !== 'Identifier' || node.callee.name !== this.#bindingName) return;

        const arg = node.arguments[0];
        if (!arg || arg.type !== 'ObjectExpression') {
            this.#pushInvalidShape(node);
            return;
        }

        const entries = parseCallArgs(arg);
        const inputErrors = validateInput(entries, this.opts.manifest);
        this.#errors.push(...inputErrors);

        if (inputErrors.length) return;

        const replacement = this.#buildReplacement(entries);
        this.#ms!.overwrite(node.start, node.end, replacement);
    };

    #pushInvalidShape(node: AnyProp): void {
        this.#errors.push({
            code: 'invalid-input-shape',
            message: 'styles() requires an object literal argument.',
            loc: {
                line: node.loc?.start.line ?? 1,
                column: node.loc?.start.column ?? 0,
            },
        });
    }

    // ── replacement construction ───────────────────────────────

    #buildReplacement(entries: RawEntry[]): string {
        const parts: EntryPart[] = [];

        for (const entry of entries) {
            if (entry.error) continue;

            const part = this.#buildEntryPart(entry);
            if (part) parts.push(part);
        }

        return renderParts(parts);
    }

    #buildEntryPart(entry: RawEntry): EntryPart | null {
        if (entry.value?.kind === 'ternary') return this.#buildTernaryPart(entry);
        if (entry.conditions) return this.#buildConditionsPart(entry);
        if (entry.value) return this.#buildStaticPart(entry);

        return null;
    }

    #buildTernaryPart(entry: RawEntry): EntryPart {
        const val = entry.value!;
        const testNode = val.testNode as AnyProp;
        const testSrc = this.opts.source.slice(testNode.start, testNode.end);
        const conseqTuple = this.#tupleFor(entry.property, { kind: 'default' }, val.consequent!);
        const altTuple = this.#tupleFor(entry.property, { kind: 'default' }, val.alternate!);

        this.#tuples.push(conseqTuple, altTuple);

        const conseqCls = buildClassName(conseqTuple, this.#mode);
        const altCls = buildClassName(altTuple, this.#mode);

        this.#classes.add(conseqCls);
        this.#classes.add(altCls);

        return {
            kind: 'ternary',
            expr: `(${testSrc} ? ${jsSingleQuoted(conseqCls)} : ${jsSingleQuoted(altCls)})`,
        };
    }

    #buildConditionsPart(entry: RawEntry): EntryPart | null {
        const classNames: string[] = [];

        for (const c of entry.conditions!) {
            const cond = classifyCondition(c.conditionKey);
            if ('error' in cond) continue;

            const tup = this.#tupleFor(entry.property, cond, c.value);
            this.#tuples.push(tup);

            const cls = buildClassName(tup, this.#mode);
            classNames.push(cls);
            this.#classes.add(cls);
        }

        if (!classNames.length) return null;

        return { kind: 'static', value: classNames.sort().join(' ') };
    }

    #buildStaticPart(entry: RawEntry): EntryPart {
        const tup = this.#tupleFor(entry.property, { kind: 'default' }, entry.value!);
        this.#tuples.push(tup);

        const cls = buildClassName(tup, this.#mode);
        this.#classes.add(cls);

        return { kind: 'static', value: cls };
    }

    #tupleFor(property: string, cond: ConditionKey, raw: RawValue): Tuple {
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

        const res = resolveToken(this.opts.manifest, property, raw.token!);
        if ('error' in res) throw new Error('validateInput should have caught this');

        return {
            property,
            propertyShort,
            valueShort: raw.token!,
            cssValue: `var(${res.cssVar})`,
            condition: cond,
        };
    }

    // ── output ─────────────────────────────────────────────────

    #finalize(): TransformResult {
        if (this.#errors.length) {
            return {
                code: this.opts.source,
                css: null,
                classes: [],
                hasProviderImport: this.#hasProviderImport,
                errors: this.#errors,
            };
        }

        return {
            code: this.#ms!.toString(),
            css: this.#tuples.length ? emitCss(this.#tuples, this.#mode) : null,
            classes: [...this.#classes],
            hasProviderImport: this.#hasProviderImport,
            errors: [],
        };
    }
}

// ────────────────────────────────────────────────────────────────
// Module-level pure utils — no shared state, stay as functions
// ────────────────────────────────────────────────────────────────

type EntryPart = { kind: 'static'; value: string } | { kind: 'ternary'; expr: string };

function jsSingleQuoted(value: string): string {
    return (
        "'" +
        value
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r') +
        "'"
    );
}

function valueShortFromLiteral(literal: string | number): string {
    return String(literal)
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '');
}

function emptyResult(source: string): TransformResult {
    return { code: source, css: null, classes: [], hasProviderImport: false, errors: [] };
}

function renderParts(parts: EntryPart[]): string {
    if (parts.length === 1) {
        const p = parts[0];
        return p.kind === 'static' ? jsSingleQuoted(p.value) : p.expr;
    }

    const allStatic = parts.every((p) => p.kind === 'static');
    if (allStatic) {
        const tokens = parts
            .flatMap((p) => (p as { kind: 'static'; value: string }).value.split(/\s+/))
            .filter(Boolean)
            .sort();

        return jsSingleQuoted(tokens.join(' '));
    }

    const frags = parts.map((p) => (p.kind === 'static' ? jsSingleQuoted(p.value) : p.expr));
    return `[${frags.join(', ')}].filter(Boolean).join(' ')`;
}
