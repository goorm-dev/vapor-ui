import MagicString from 'magic-string';
import { parseSync } from 'oxc-parser';

import type { ClassNameMode } from '~/models/class-name';
import type { AnyProp, BuildError, IRRule } from '~/models/types';

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
    #needMergeStyle = false;

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
                if (outcome.usedMergeStyle) this.#needMergeStyle = true;

                // call site 자체는 정적 부분 + dynamic 부분 통합 className string 으로 대체.
                const uniq = Array.from(new Set(classNames)).sort().join(' ');
                this.#ms!.overwrite(call.node.start, call.node.end, jsSingleQuoted(uniq));
                continue;
            }

            if (call.ternaries.length > 0) {
                this.#rewriteCallWithTernaries(call.node, call.rules, classNames, call.ternaries);
            } else {
                const uniq = Array.from(new Set(classNames)).sort().join(' ');
                this.#ms!.overwrite(call.node.start, call.node.end, jsSingleQuoted(uniq));
            }
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
        if (this.#needResolveToken || this.#needMergeStyle) {
            this.#ensureRuntimeImport(program);
        }

        return {
            code: this.#ms!.toString(),
            css: this.#allRules.length ? emitted.cssText : null,
            classes: [...this.#classes],
            errors: [],
        };
    }

    #shouldSkip(): boolean {
        const { source } = this.opts;
        return !source.includes(IMPORT_NAME);
    }

    #scanImports(program: AnyProp): void {
        for (const stmt of program.body) {
            if (stmt.type !== 'ImportDeclaration') continue;
            this.#scanImportDeclaration(stmt);
        }
    }

    #scanImportDeclaration(stmt: AnyProp): void {
        const src: string = stmt.source.value;
        if (src !== IMPORT_SOURCE) return;

        for (const spec of stmt.specifiers) {
            if (spec.type !== 'ImportSpecifier' || spec.imported?.type !== 'Identifier') continue;
            if (spec.imported.name === IMPORT_NAME) {
                this.#bindingName = spec.local.name;
            }
        }
    }

    #onCallExpression = (node: AnyProp, parents: AnyProp[]): void => {
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

    #rewriteCallWithTernaries(
        node: AnyProp,
        rules: IRRule[],
        classNames: string[],
        ternaries: ReturnType<typeof parseCallArg>['ternaries'],
    ): void {
        const tern = ternaries[0];
        const idxs: number[] = [];
        for (let i = 0; i < rules.length && idxs.length < 2; i++) {
            if (rules[i].kind === 'static' && rules[i].property === tern.property) idxs.push(i);
        }
        if (idxs.length !== 2) {
            const uniq = Array.from(new Set(classNames)).sort().join(' ');
            this.#ms!.overwrite(node.start, node.end, jsSingleQuoted(uniq));
            return;
        }
        const [i1, i2] = idxs;
        const conseqCls = classNames[i1];
        const altCls = classNames[i2];
        const testSrc = this.opts.source.slice(tern.testStart, tern.testEnd);

        const rest = classNames.filter((_, i) => i !== i1 && i !== i2);
        const restLit = jsSingleQuoted(rest.sort().join(' '));

        const expr =
            rest.length > 0
                ? `(${restLit} + ' ' + (${testSrc} ? ${jsSingleQuoted(conseqCls)} : ${jsSingleQuoted(altCls)}))`
                : `(${testSrc} ? ${jsSingleQuoted(conseqCls)} : ${jsSingleQuoted(altCls)})`;

        this.#ms!.overwrite(node.start, node.end, expr);
    }

    #ensureRuntimeImport(program: AnyProp): void {
        // 이미 있는 `@vapor-ui/style-macro` import 를 재사용하거나 새로 삽입.
        const specifiers: string[] = [];
        if (this.#needResolveToken) specifiers.push('_resolveToken');
        if (this.#needMergeStyle) specifiers.push('_mergeStyle');

        // 기존 declaration 찾아 없는 specifier 만 추가.
        for (const stmt of program.body) {
            if (stmt.type !== 'ImportDeclaration') continue;
            if (stmt.source.value !== IMPORT_SOURCE) continue;

            const existing = new Set<string>();
            for (const spec of stmt.specifiers) {
                if (spec.type === 'ImportSpecifier' && spec.imported?.type === 'Identifier') {
                    existing.add(spec.imported.name);
                }
            }
            const toAdd = specifiers.filter((n) => !existing.has(n));
            if (toAdd.length === 0) return;

            // 마지막 specifier 뒤에 삽입.
            const last = stmt.specifiers[stmt.specifiers.length - 1];
            const insertPos = last.end;
            const inject = `, ${toAdd.map((n) => `${n}`).join(', ')}`;
            this.#ms!.appendLeft(insertPos, inject);
            return;
        }

        // 새 import 문 삽입.
        const inject = `import { ${specifiers.join(', ')} } from '${IMPORT_SOURCE}';\n`;
        this.#ms!.appendLeft(0, inject);
    }
}

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

function emptyResult(source: string): TransformResult {
    return { code: source, css: null, classes: [], errors: [] };
}
