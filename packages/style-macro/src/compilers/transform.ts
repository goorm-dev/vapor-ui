import MagicString from 'magic-string';
import { parseSync } from 'oxc-parser';

import { axisAliasName } from '~/models/axis-alias';
import type { ClassNameMode } from '~/models/class-name';
import type { AnyProp, BuildError, IRRule } from '~/models/types';
import { propertyToTokenAxis } from '~/tokens';

import { directivePrologueEnd } from './directives';
import { emitCss } from './emit-css';
import {
    type DynamicCallSite,
    type InjectContext,
    flushInjects,
    injectJsxStyleForCall,
} from './jsx-inject';
import { walk } from './oxc-walk';
import { parseCallArg, type ParseCallResult } from './parse-call';

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

/** kebab-case / camelCase 모두 `propertyToTokenAxis` 룩업. */
function axisForProperty(property: string): string | null {
    const camel = property.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    const axis = (propertyToTokenAxis as Record<string, string>)[camel];
    return axis ?? null;
}

/**
 * `css()` 호출의 한 argument 를 어떻게 처리할지. `ObjectExpression` 리터럴은
 * `_mkStyle({ property: className })` 로 치환하고 그 과정에서 parse-call 이
 * 생성한 rules 가 CSS emit 에도 참여한다. 그 외(Identifier / MemberExpression /
 * 등) 는 "이미 compile 된 VaporClass 값" 으로 간주하고 소스 표현식 그대로 둔
 * 뒤 `_mergeStyles(...)` 안에 한 인자로 넣는다.
 */
type ArgRecord =
    | {
          kind: 'object';
          node: AnyProp;
          rules: IRRule[];
          ternaries: ParseCallResult['ternaries'];
          /** `#allRules` 에 기록된 base offset — emitCss 출력과 맞추기 위함. */
          rulesOffset: number;
      }
    | {
          kind: 'reference';
          node: AnyProp;
      };

interface CallRecord {
    node: AnyProp;
    parents: AnyProp[];
    args: ArgRecord[];
}

class Transformer {
    readonly #mode: ClassNameMode;
    readonly #allRules: IRRule[] = [];
    readonly #classes = new Set<string>();
    readonly #errors: BuildError[] = [];
    readonly #callSites: CallRecord[] = [];
    readonly #axesUsed = new Set<string>();

    #bindingName: string | null = null;
    #ms: MagicString | null = null;
    #needResolveToken = false;
    #needMkStyle = false;
    #needMergeStyles = false;
    /** `const x = css(...)` 로 선언된 지역 변수 이름. template literal 에
     *  섞여 들어가면 build error 로 catch 하기 위해 추적한다. */
    readonly #vaporLocals = new Set<string>();

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

        walk(program, {
            CallExpression: this.#onCallExpression,
            JSXAttribute: this.#onJsxAttribute,
            VariableDeclarator: this.#onVariableDeclarator,
            TemplateLiteral: this.#onTemplateLiteral,
        });

        if (this.#errors.length) {
            return {
                code: source,
                css: null,
                classes: [],
                errors: this.#errors,
            };
        }

        const emitted = emitCss(this.#allRules, this.#mode);
        const classNamesAll = emitted.classNamesPerRule;

        const injectCtx: InjectContext = {
            ms: this.#ms,
            mode: this.#mode === 'hashed' ? 'prod' : 'dev',
            pending: new Map(),
        };

        for (const call of this.#callSites) {
            // dynamic slot 수집은 모든 object-arg 의 dynamic rules 통합.
            const dynamicSlots = this.#collectDynamicSlots(call, classNamesAll);
            if (dynamicSlots.length > 0) {
                const site: DynamicCallSite = {
                    call: call.node,
                    parents: call.parents,
                    slots: dynamicSlots,
                };
                const outcome = injectJsxStyleForCall(site, injectCtx);
                if (!outcome.success) {
                    if (outcome.error) this.#errors.push(outcome.error);
                    continue;
                }
                this.#needResolveToken = true;
            }

            const replacement = this.#buildCallReplacement(call, classNamesAll);
            this.#ms.overwrite(call.node.start, call.node.end, replacement);

            // emit 결과 class 전수 보고
            for (const arg of call.args) {
                if (arg.kind !== 'object') continue;
                for (let i = 0; i < arg.rules.length; i++) {
                    const c = classNamesAll[arg.rulesOffset + i];
                    if (c) this.#classes.add(c);
                }
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

        flushInjects(injectCtx);
        this.#ensureRuntimeImport();

        return {
            code: this.#ms.toString(),
            css: this.#allRules.length ? emitted.cssText : null,
            classes: [...this.#classes],
            errors: [],
        };
    }

    #shouldSkip(): boolean {
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

    /**
     * JSX 의 `className={...}` 자리에서 template literal 로 2개 이상의
     * identifier 를 합치면 catch — property-aware 머지가 건너뛰어 리뷰 #1
     * fragility 가 재발한다. identifier 1개 + static 문자열 (예:
     * `\`\${cls} active\``) 은 흔한 "vapor + DOM class" 패턴이라 허용한다.
     *
     * import 로만 받은 참조는 지역 변수 추적으로 알 수 없지만, className
     * 자리라는 context 가 분명하므로 보수적으로 catch 한다. 사용자가 두 class
     * 를 합치는 의도라면 `css(a, b)` 로 머지해야 안전하다.
     */
    #onJsxAttribute = (node: AnyProp) => {
        if (node?.name?.type !== 'JSXIdentifier' || node.name.name !== 'className') return;
        const v = node.value;
        if (v?.type !== 'JSXExpressionContainer') return;
        const expr = v.expression;
        if (expr?.type !== 'TemplateLiteral') return;
        const identCount = (expr.expressions ?? []).filter(
            (e: AnyProp) => e?.type === 'Identifier',
        ).length;
        if (identCount >= 2) this.#errors.push(templateLiteralError(expr));
    };

    /** `const x = css(...)` 로 선언된 지역 변수 이름을 추적. */
    #onVariableDeclarator = (node: AnyProp) => {
        if (!this.#bindingName) return;
        if (node?.id?.type !== 'Identifier' || !node.init) return;
        const init = node.init;
        if (
            init.type === 'CallExpression' &&
            init.callee?.type === 'Identifier' &&
            init.callee.name === this.#bindingName
        ) {
            this.#vaporLocals.add(node.id.name);
        }
    };

    /**
     * Template literal 안에 vapor class 가 **2개 이상** 섞여 있으면 build
     * error. 단순 string 합성은 property-aware 머지를 건너뛰어 리뷰 #1
     * fragility 가 재발한다. 정확히 한 개면 "vapor class + 외부 DOM class"
     * 같은 흔한 패턴 (`\`\${cls} active\``) 이므로 허용한다.
     */
    #onTemplateLiteral = (node: AnyProp) => {
        if (!node?.expressions?.length) return;
        let hits = 0;
        for (const expr of node.expressions) {
            if (expr?.type === 'Identifier' && this.#vaporLocals.has(expr.name)) hits++;
            if (hits >= 2) {
                this.#errors.push(templateLiteralError(node));
                return;
            }
        }
    };

    #onCallExpression = (node: AnyProp, parents: AnyProp[]) => {
        if (!this.#bindingName) return;
        if (node.callee?.type !== 'Identifier' || node.callee.name !== this.#bindingName) return;

        const rawArgs: AnyProp[] = node.arguments ?? [];
        if (rawArgs.length === 0) {
            this.#errors.push(noArgError(node));
            return;
        }

        const args: ArgRecord[] = [];
        for (const a of rawArgs) {
            if (a.type === 'ObjectExpression') {
                const parsed = parseCallArg(a, this.opts.source);
                this.#errors.push(...parsed.errors);
                if (parsed.errors.length) return;
                args.push({
                    kind: 'object',
                    node: a,
                    rules: parsed.rules,
                    ternaries: parsed.ternaries,
                    rulesOffset: this.#allRules.length,
                });
                this.#allRules.push(...parsed.rules);
            } else {
                args.push({ kind: 'reference', node: a });
            }
        }

        this.#callSites.push({
            node,
            parents: parents.slice(),
            args,
        });
    };

    /** call 안 모든 object-arg 의 dynamic rules 를 통합 slot 리스트로. */
    #collectDynamicSlots(call: CallRecord, _classNamesAll: string[]) {
        const bySlot = new Map<string, DynamicCallSite['slots'][number]>();
        for (const arg of call.args) {
            if (arg.kind !== 'object') continue;
            for (let i = 0; i < arg.rules.length; i++) {
                const r = arg.rules[i];
                if (r.kind !== 'dynamic') continue;
                if (bySlot.has(r.slotId)) continue;
                const axis = axisForProperty(r.property);
                if (axis) this.#axesUsed.add(axis);
                bySlot.set(r.slotId, {
                    slotId: r.slotId,
                    axis,
                    property: r.property,
                    sourceExpr: r.sourceExpr,
                });
            }
        }
        return Array.from(bySlot.values());
    }

    /**
     * `css(...)` 호출 전체를 바꿀 소스 문자열 생성.
     *
     * - 단일 object-arg → `_mkStyle({ 'selector|property': 'className', … })`
     * - 단일 reference → 소스 표현식 그대로 (React 가 알아서 toString 호출)
     * - 멀티 arg → `_mergeStyles(arg1, arg2, …)` wrap
     */
    #buildCallReplacement(call: CallRecord, classNamesAll: string[]): string {
        const rendered: string[] = [];
        for (const arg of call.args) {
            if (arg.kind === 'reference') {
                rendered.push(this.opts.source.slice(arg.node.start, arg.node.end));
            } else {
                rendered.push(this.#renderMkStyle(arg, classNamesAll));
            }
        }

        if (rendered.length === 1) {
            const only = call.args[0];
            // 단일 object → _mkStyle 문자열 그대로 사용 (이미 VaporClass).
            if (only.kind === 'object') return rendered[0];
            // 단일 reference → 그대로 통과. 사용자 코드의 ident 가 className 자리에
            // 바로 들어가도 toString 이 자동 호출되므로 unwrap 불필요.
            return rendered[0];
        }

        this.#needMergeStyles = true;
        return `_mergeStyles(${rendered.join(', ')})`;
    }

    /**
     * 하나의 object-arg 를 `_mkStyle({ 'key': 'className', … })` 리터럴로.
     *
     * key 는 `${selectorContext}|${property}` 복합으로, 같은 selector + property
     * 를 가진 rules 중 **마지막만** 남긴다 (리뷰 #1 — 단일 css() 호출 안 property
     * last-wins). `_mergeStyles` 도 for-in 으로 key 를 돌며 override 하므로 이
     * 복합 key 체계가 "다른 selector 는 서로 머지하지 않고, 같은 selector 안의
     * 같은 property 만 last-wins" 라는 정확한 의미를 유지한다.
     *
     * ternary 는 branch 별로 branch classes 를 **구분된 key** 로 삽입해 둘
     * 중 한 쪽만 평가되도록 삼항식으로 분기한다.
     */
    #renderMkStyle(
        arg: Extract<ArgRecord, { kind: 'object' }>,
        classNamesAll: string[],
    ): string {
        this.#needMkStyle = true;

        const ternaryIdxs = new Set<number>();
        for (const t of arg.ternaries) {
            for (const i of t.consequentRuleIndexes) ternaryIdxs.add(i);
            for (const i of t.alternateRuleIndexes) ternaryIdxs.add(i);
        }

        // 1) ternary 와 무관한 rules — property last-wins 로 Map 수집.
        const staticMap = new Map<string, string>();
        for (let i = 0; i < arg.rules.length; i++) {
            if (ternaryIdxs.has(i)) continue;
            const r = arg.rules[i];
            const className = classNamesAll[arg.rulesOffset + i];
            if (!className) continue;
            const key = mkKey(r.selectorContext, r.property);
            staticMap.set(key, className);
        }

        const entries: string[] = [];
        for (const [key, className] of staticMap) {
            entries.push(`${jsSingleQuoted(key)}: ${jsSingleQuoted(className)}`);
        }

        // 2) ternary — 각 branch 의 property 를 구분된 key 로 삽입.
        for (const t of arg.ternaries) {
            const testSrc = this.opts.source.slice(t.testStart, t.testEnd);

            // property 별로 두 branch 의 className 묶기.
            const byProp = new Map<string, { conseq: string; alt: string }>();
            for (const i of t.consequentRuleIndexes) {
                const r = arg.rules[i];
                const className = classNamesAll[arg.rulesOffset + i];
                if (!className) continue;
                const key = mkKey(r.selectorContext, r.property);
                const e = byProp.get(key) ?? { conseq: '', alt: '' };
                e.conseq = className;
                byProp.set(key, e);
            }
            for (const i of t.alternateRuleIndexes) {
                const r = arg.rules[i];
                const className = classNamesAll[arg.rulesOffset + i];
                if (!className) continue;
                const key = mkKey(r.selectorContext, r.property);
                const e = byProp.get(key) ?? { conseq: '', alt: '' };
                e.alt = className;
                byProp.set(key, e);
            }

            for (const [key, { conseq, alt }] of byProp) {
                const expr = `(${testSrc} ? ${jsSingleQuoted(conseq)} : ${jsSingleQuoted(alt)})`;
                entries.push(`${jsSingleQuoted(key)}: ${expr}`);
            }
        }

        return entries.length === 0 ? `_mkStyle({})` : `_mkStyle({ ${entries.join(', ')} })`;
    }

    #ensureRuntimeImport() {
        const specifiers: string[] = [];
        if (this.#needMkStyle) specifiers.push('_mkStyle');
        if (this.#needMergeStyles) specifiers.push('_mergeStyles');
        if (this.#needResolveToken) specifiers.push('_resolveToken');
        if (this.#axesUsed.size > 0) {
            specifiers.push(
                ...Array.from(this.#axesUsed)
                    .sort()
                    .map((axis) => `${axis} as ${axisAliasName(axis)}`),
            );
        }
        if (specifiers.length === 0) return;

        const inject = `import { ${specifiers.join(', ')} } from '${RUNTIME_IMPORT_SOURCE}';\n`;
        const insertPos = directivePrologueEnd(this.opts.source);
        this.#ms!.appendLeft(insertPos, inject);
    }
}

/** 복합 key 는 property-only 로 축약 가능하지만, selector 가 다른 분기의
 *  같은 property 는 "다른 slot" 이어야 머지 로직이 꼬이지 않는다. */
function mkKey(selectorContext: string, property: string): string {
    return `${selectorContext}|${property}`;
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

function templateLiteralError(node: AnyProp): BuildError {
    return {
        code: 'template-literal',
        message:
            'Template literal join of css() results bypasses property-aware merge. ' +
            'Use css(a, b) instead so later arguments win per CSS property.',
        loc: {
            line: node?.loc?.start?.line ?? 1,
            column: node?.loc?.start?.column ?? 0,
        },
    };
}

function noArgError(node: AnyProp): BuildError {
    return {
        code: 'invalid-input-shape',
        message: 'css() requires at least one argument.',
        loc: {
            line: node?.loc?.start?.line ?? 1,
            column: node?.loc?.start?.column ?? 0,
        },
    };
}
