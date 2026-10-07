import MagicString from 'magic-string';
import { parseSync } from 'oxc-parser';

import type { ClassNameMode } from '~/models/class-name';
import type { AnyProp, BuildError, IRRule } from '~/models/types';

import { directivePrologueEnd } from './directives';
import { emitCss } from './emit-css';
import { type DynamicCallSite, type InjectContext, injectJsxStyleForCall } from './jsx-inject';
import { walk } from './oxc-walk';
import { parseCallArg } from './parse-call';

// ────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────

export interface TransformResult {
    code: string;
    css: string | null;
    classes: string[];
    errors: BuildError[];
}

export interface TransformOpts {
    source: string;
    filename: string;
    hash?: boolean;
}

export function transform(opts: TransformOpts): TransformResult {
    return new Transformer(opts).run();
}

// ────────────────────────────────────────────────────────────────
// Transformer
// ────────────────────────────────────────────────────────────────

const IMPORT_SOURCE = '@vapor-ui/style-macro';
const IMPORT_NAME = 'css';
const RUNTIME_IMPORT_SOURCE = '@vapor-ui/style-macro/__runtime__';

interface CallRecord {
    node: AnyProp;
    parents: AnyProp[];
    rules: IRRule[];
    ternaries: ReturnType<typeof parseCallArg>['ternaries'];
}

class Transformer {
    readonly #mode: ClassNameMode;
    readonly #allRules: IRRule[] = [];
    readonly #classes = new Set<string>();
    readonly #errors: BuildError[] = [];
    readonly #callSites: CallRecord[] = [];

    #bindingName: string | null = null;
    #ms: MagicString | null = null;
    #needResolveToken = false;

    constructor(private readonly opts: TransformOpts) {
        this.#mode = opts.hash ? 'hashed' : 'readable';
    }

    run(): TransformResult {
        const { source, filename } = this.opts;
        if (this.#shouldSkip()) return emptyResult(source);

        const parsed = parseSync(filename, source, { sourceType: 'module', lang: 'tsx' });
        if (parsed.errors?.length) return emptyResult(source);

        const program = parsed.program;
        this.#scanImports(program);
        this.#ms = new MagicString(source);

        walk(program, { CallExpression: this.#onCallExpression });

        if (this.#errors.length) {
            return {
                code: source,
                css: null,
                classes: [],
                errors: this.#errors,
            };
        }

        const emitted = emitCss(this.#allRules, this.#mode);
        let cursor = 0;

        const injectCtx: InjectContext = {
            ms: this.#ms!,
            mode: this.#mode === 'hashed' ? 'prod' : 'dev',
            injectedElements: new Set<number>(),
        };

        for (const call of this.#callSites) {
            const count = call.rules.length;
            const classNames = emitted.classNamesPerRule.slice(cursor, cursor + count);
            cursor += count;
            for (const c of classNames) this.#classes.add(c);

            const dynamicSlots = call.rules
                .map((r, i) =>
                    r.kind === 'dynamic'
                        ? {
                              slotId: r.slotId,
                              property: r.property,
                              sourceExpr: r.sourceExpr,
                              idx: i,
                          }
                        : null,
                )
                .filter((x): x is NonNullable<typeof x> => x !== null);

            if (dynamicSlots.length > 0) {
                const site: DynamicCallSite = {
                    call: call.node,
                    parents: call.parents,
                    slots: dynamicSlots.map(({ slotId, property, sourceExpr }) => ({
                        slotId,
                        property,
                        sourceExpr,
                    })),
                };
                const outcome = injectJsxStyleForCall(site, injectCtx);
                if (!outcome.success) {
                    if (outcome.error) this.#errors.push(outcome.error);
                    continue;
                }
                this.#needResolveToken = true;
            }

            const replacement = this.#buildCallReplacement(classNames, call.ternaries);
            this.#ms!.overwrite(call.node.start, call.node.end, replacement);
        }

        if (this.#errors.length) {
            return {
                code: source,
                css: null,
                classes: [],
                errors: this.#errors,
            };
        }

        // runtime helper import 자동 삽입 (필요 시).
        if (this.#needResolveToken) {
            this.#ensureRuntimeImport();
        }

        return {
            code: this.#ms!.toString(),
            css: this.#allRules.length ? emitted.cssText : null,
            classes: [...this.#classes],
            errors: [],
        };
    }

    #shouldSkip(): boolean {
        // package specifier가 소스에 없으면 import 자체가 없는 셈 → oxc parsing skip.
        return !this.opts.source.includes(IMPORT_SOURCE);
    }

    #scanImports(program: AnyProp) {
        for (const stmt of program.body) {
            if (stmt.type !== 'ImportDeclaration') continue;
            this.#scanImportDeclaration(stmt);
        }
    }

    #scanImportDeclaration(stmt: AnyProp) {
        const src: string = stmt.source.value;
        if (src !== IMPORT_SOURCE) return;

        for (const spec of stmt.specifiers) {
            if (spec.type !== 'ImportSpecifier' || spec.imported?.type !== 'Identifier') continue;
            if (spec.imported.name === IMPORT_NAME) {
                this.#bindingName = spec.local.name;
            }
        }
    }

    #onCallExpression = (node: AnyProp, parents: AnyProp[]) => {
        if (!this.#bindingName) return;
        if (node.callee?.type !== 'Identifier' || node.callee.name !== this.#bindingName) return;

        const arg = node.arguments?.[0];
        const parsed = parseCallArg(arg, this.opts.source);
        this.#errors.push(...parsed.errors);
        if (parsed.errors.length) return;

        // parents 는 walker 가 관리하는 라이브 스택. 저장 시 복사.
        this.#callSites.push({
            node,
            parents: parents.slice(),
            rules: parsed.rules,
            ternaries: parsed.ternaries,
        });
        this.#allRules.push(...parsed.rules);
    };

    /**
     * `css({...})` 호출을 className 문자열식으로 교체.
     */
    #buildCallReplacement(
        classNames: string[],
        ternaries: ReturnType<typeof parseCallArg>['ternaries'],
    ): string {
        if (ternaries.length === 0) {
            const uniq = Array.from(new Set(classNames)).sort().join(' ');
            return jsSingleQuoted(uniq);
        }

        // 모든 ternary 분기가 점유한 rule index 집합.
        const ternaryIdx = new Set<number>();
        for (const t of ternaries) {
            for (const i of t.consequentRuleIndexes) ternaryIdx.add(i);
            for (const i of t.alternateRuleIndexes) ternaryIdx.add(i);
        }

        // rest = ternary 와 무관한 모든 rule 의 class (dedupe + sort).
        const restClasses = classNames.filter((_, i) => !ternaryIdx.has(i));
        const restUniq = Array.from(new Set(restClasses)).sort();
        const restLit = jsSingleQuoted(restUniq.join(' '));

        const parts: string[] = [];
        if (restUniq.length > 0) parts.push(restLit);

        for (const t of ternaries) {
            const conseqUniq = Array.from(
                new Set(t.consequentRuleIndexes.map((i) => classNames[i])),
            ).sort();
            const altUniq = Array.from(
                new Set(t.alternateRuleIndexes.map((i) => classNames[i])),
            ).sort();

            const conseqLit = jsSingleQuoted(conseqUniq.join(' '));
            const altLit = jsSingleQuoted(altUniq.join(' '));
            const testSrc = this.opts.source.slice(t.testStart, t.testEnd);

            parts.push(`(${testSrc} ? ${conseqLit} : ${altLit})`);
        }

        if (parts.length === 1) return parts[0];
        return `(${parts.join(" + ' ' + ")})`;
    }

    #ensureRuntimeImport() {
        const specifiers: string[] = [];
        if (this.#needResolveToken) specifiers.push('_resolveToken');
        if (specifiers.length === 0) return;

        const inject = `import { ${specifiers.join(', ')} } from '${RUNTIME_IMPORT_SOURCE}';\n`;
        const insertPos = directivePrologueEnd(this.opts.source);

        this.#ms!.appendLeft(insertPos, inject);
    }
}

function jsSingleQuoted(value: string) {
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

function emptyResult(source: string): TransformResult {
    return { code: source, css: null, classes: [], errors: [] };
}
