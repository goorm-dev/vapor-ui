import MagicString from 'magic-string';
import { parseSync } from 'oxc-parser';

import { axisAliasName } from '~/models/axis-alias';
import { type ClassNameMode, buildBlockClassName, dynamicVarName } from '~/models/class-name';
import type { AnyProp, BuildError, DynamicRule, IRRule } from '~/models/types';
import { propertyToTokenAxis } from '~/tokens';
import { isUnitless } from '~/tokens/css-reference';

import { directivePrologueEnd } from './directives';
import { type Block, DEFAULT_LAYER, emitBlocks, normalizeRules, signatureOf } from './emit-css';
import {
    type InjectContext,
    type SlotTree,
    flushInjects,
    hasSlots,
    injectJsxStyleForCall,
} from './jsx-inject';
import { walk } from './oxc-walk';
import { type ParseCallResult, parseCallArg } from './parse-call';

// ────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────

export interface TransformResult {
    code: string;
    /** 이 모듈의 CSS. `css()` 가 없거나 에러면 `null`. */
    css: string | null;
    errors: BuildError[];
}

export interface TransformOpts {
    source: string;
    filename: string;
    hash?: boolean;
    /** 규칙을 담을 cascade layer. 기본 `vapor-utilities`. */
    layer?: string;
    /**
     * class 이름 해시에 들어가는 파일 식별자. 같은 파일이면 빌드 환경과 무관하게 같은 값이어야
     * 하므로 플러그인은 root 기준 상대 경로를 넘긴다. 없으면 `filename`.
     */
    scope?: string;
    /**
     * 모듈 CSS 를 가리킬 side-effect import 경로. 지정하면 이 모듈이 CSS 를 만들 때
     * `import '<cssImport>';` 를 마지막 import 문 뒤에 넣는다 — 이 모듈이 import 하는
     * 라이브러리 CSS 가 먼저 쌓이고 자기 CSS 가 그 뒤에 오게 하기 위해서다.
     */
    cssImport?: string;
}

export function transform(opts: TransformOpts): TransformResult {
    return new Transformer(opts).run();
}

// ────────────────────────────────────────────────────────────────
// Pieces — css() 인자를 "규칙 조각 + 조건 분기" 로 펼친 모델
// ────────────────────────────────────────────────────────────────

/**
 * 컴파일 시점에 규칙을 알 수 있는 인자 조각.
 * - `fixed`: 항상 붙는 규칙.
 * - `cond`: 런타임 조건에 따라 두 분기 중 하나가 붙는다. 분기 안에 다시 조각이 올 수 있다.
 * 조각을 순서대로 이어 붙인 규칙이 한 블록이 되고, 뒤 조각이 같은 선언 슬롯을 이긴다.
 */
type Piece =
    | { kind: 'fixed'; rules: IRRule[] }
    | { kind: 'cond'; test: string; whenTrue: Piece[]; whenFalse: Piece[] };

/** 한 호출이 만들 수 있는 분기 조합 수 상한. 넘으면 빌드 에러. */
const MAX_COMBINATIONS = 16;

function countCombinations(pieces: Piece[]): number {
    let n = 1;
    for (const p of pieces) {
        if (p.kind === 'cond') n *= countCombinations(p.whenTrue) + countCombinations(p.whenFalse);
    }
    return n;
}

/**
 * 조각 목록을 분기 조합마다 하나의 규칙 목록으로 펼쳐 `leaf` 에 넘기고, 분기는 `fork` 로
 * 다시 묶는다. className 과 style slot 이 모두 이 트리 하나에서 나오므로, 어떤 분기에서
 * 어떤 class 가 붙는지와 어떤 slot 이 평가되는지가 항상 일치한다.
 */
function project<T>(
    pieces: Piece[],
    acc: IRRule[],
    leaf: (rules: IRRule[]) => T,
    fork: (test: string, whenTrue: T, whenFalse: T) => T,
): T {
    const i = pieces.findIndex((p) => p.kind === 'cond');
    if (i === -1) {
        const rules = [...acc];
        for (const p of pieces) if (p.kind === 'fixed') rules.push(...p.rules);
        return leaf(rules);
    }
    const head: IRRule[] = [...acc];
    for (const p of pieces.slice(0, i)) if (p.kind === 'fixed') head.push(...p.rules);
    const c = pieces[i] as Extract<Piece, { kind: 'cond' }>;
    const rest = pieces.slice(i + 1);
    const t = project([...c.whenTrue, ...rest], head, leaf, fork);
    const f = project([...c.whenFalse, ...rest], head, leaf, fork);
    return fork(c.test, t, f);
}

/** 호출 인자 하나. 로컬로 풀리면 `pieces`, 아니면 런타임 class 문자열(`external`). */
type ArgRecord = { kind: 'local'; pieces: Piece[] } | { kind: 'external'; node: AnyProp };

interface CallRecord {
    node: AnyProp;
    parents: AnyProp[];
    args: ArgRecord[];
    debugId: string | undefined;
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

class Transformer {
    readonly #mode: ClassNameMode;
    readonly #scope: string;
    readonly #errors: BuildError[] = [];
    readonly #callNodes: Array<{ node: AnyProp; parents: AnyProp[] }> = [];
    readonly #axesUsed = new Set<string>();
    readonly #blocks: Block[] = [];

    #bindingName: string | null = null;
    #ms: MagicString | null = null;
    /** 마지막 import 문의 끝 위치. 없으면 directive 뒤. */
    #lastImportEnd = -1;
    #needResolveToken = false;
    #needIx = false;
    #needCx = false;

    /** `const x = css(...)` 로 선언된 지역 변수 이름. template literal 합성 감지용. */
    readonly #vaporLocals = new Set<string>();
    /** 모듈 최상위 `const x = css(...)` / `const x = { ... }` — 같은 파일 병합 대상. */
    readonly #topLevelStatic = new Map<string, AnyProp>();
    /** 파일 안에서 각 이름이 바인딩된 횟수. 2 이상이면 shadowing 가능성 → 병합 안 함. */
    readonly #bindingCounts = new Map<string, number>();
    /** `parseCallArg` 결과 캐시 (같은 object 를 여러 경로에서 풀 수 있음). */
    readonly #parsed = new Map<AnyProp, ParseCallResult>();

    constructor(private readonly opts: TransformOpts) {
        this.#mode = opts.hash ? 'hashed' : 'readable';
        this.#scope = opts.scope ?? opts.filename;
    }

    run(): TransformResult {
        const { source, filename } = this.opts;
        if (this.#shouldSkip()) return emptyResult(source);

        const parsed = parseSync(filename, source, { sourceType: 'module', lang: 'tsx' });
        if (parsed.errors?.length) return emptyResult(source);

        const program = parsed.program;
        this.#scanImports(program);
        if (!this.#bindingName) return emptyResult(source);
        this.#scanTopLevel(program);
        this.#ms = new MagicString(source);

        walk(program, {
            CallExpression: this.#onCallExpression,
            JSXAttribute: this.#onJsxAttribute,
            VariableDeclarator: this.#onVariableDeclarator,
            TemplateLiteral: this.#onTemplateLiteral,
            Function: this.#onFunction,
            FunctionDeclaration: this.#onFunction,
            FunctionExpression: this.#onFunction,
            ArrowFunctionExpression: this.#onFunction,
            ClassDeclaration: this.#onNamedDeclaration,
            CatchClause: this.#onCatch,
        });

        // 다른 css() 인자 안에 들어간 호출은 바깥 호출이 함께 처리한다.
        const outer = this.#callNodes
            .filter(
                ({ node }) =>
                    !this.#callNodes.some((o) => o.node !== node && contains(o.node, node)),
            )
            .sort((a, b) => a.node.start - b.node.start);

        const calls: CallRecord[] = [];
        for (const { node, parents } of outer) {
            const args = this.#resolveCallArgs(node);
            if (!args) continue;
            calls.push({ node, parents, args, debugId: debugIdOf(parents) });
        }

        if (this.#errors.length) return errorResult(source, this.#errors);

        const injectCtx: InjectContext = { ms: this.#ms, pending: new Map() };

        for (const call of calls) {
            const pieces = call.args.flatMap((a) => (a.kind === 'local' ? a.pieces : []));
            const combos = countCombinations(pieces);
            if (combos > MAX_COMBINATIONS) {
                this.#errors.push(tooManyBranchesError(call.node, combos));
                continue;
            }

            const slots = this.#slotTree(pieces);
            if (hasSlots(slots)) {
                const outcome = injectJsxStyleForCall(
                    { call: call.node, parents: call.parents, slots },
                    injectCtx,
                );
                if (!outcome.success) {
                    if (outcome.error) this.#errors.push(outcome.error);
                    continue;
                }
            }

            this.#ms.overwrite(call.node.start, call.node.end, this.#buildCallReplacement(call));
        }

        if (this.#errors.length) return errorResult(source, this.#errors);

        flushInjects(injectCtx);
        this.#ensureRuntimeImport();

        const css = emitBlocks(this.#blocks, {
            mode: this.#mode,
            layer: this.opts.layer ?? DEFAULT_LAYER,
        }).cssText;

        if (css && this.opts.cssImport) this.#insertCssImport(this.opts.cssImport);

        return { code: this.#ms.toString(), css: css || null, errors: [] };
    }

    #shouldSkip(): boolean {
        return !this.opts.source.includes(IMPORT_SOURCE);
    }

    #scanImports(program: AnyProp) {
        for (const stmt of program.body) {
            if (stmt.type !== 'ImportDeclaration') continue;
            this.#lastImportEnd = stmt.end;
            for (const spec of stmt.specifiers ?? []) {
                if (spec.local?.type === 'Identifier') this.#bind(spec.local.name);
                if (stmt.source.value !== IMPORT_SOURCE) continue;
                if (spec.type !== 'ImportSpecifier' || spec.imported?.type !== 'Identifier')
                    continue;
                if (spec.imported.name === IMPORT_NAME) this.#bindingName = spec.local.name;
            }
        }
    }

    /**
     * 모듈 최상위 `const x = css(...)` / `const x = { ... }` 를 기록한다 (`export const` 포함).
     * 둘 다 같은 파일에서 정적으로 풀리는 값이라 인자로 오면 한 블록으로 병합한다.
     */
    #scanTopLevel(program: AnyProp) {
        for (const stmt of program.body) {
            const decl = stmt.type === 'ExportNamedDeclaration' ? stmt.declaration : stmt;
            if (decl?.type !== 'VariableDeclaration' || decl.kind !== 'const') continue;
            for (const d of decl.declarations) {
                if (d.id?.type !== 'Identifier') continue;
                const init = unwrapTypeOnly(d.init);
                if (!this.#isCssCall(init) && init?.type !== 'ObjectExpression') continue;
                this.#topLevelStatic.set(d.id.name, init);
            }
        }
    }

    #isCssCall(node: AnyProp): boolean {
        return (
            node?.type === 'CallExpression' &&
            node.callee?.type === 'Identifier' &&
            node.callee.name === this.#bindingName
        );
    }

    #bind(name: string) {
        this.#bindingCounts.set(name, (this.#bindingCounts.get(name) ?? 0) + 1);
    }

    #bindPattern(node: AnyProp) {
        if (!node) return;
        switch (node.type) {
            case 'Identifier':
                this.#bind(node.name);
                return;
            case 'ObjectPattern':
                for (const p of node.properties ?? []) {
                    this.#bindPattern(p.type === 'RestElement' ? p.argument : p.value);
                }
                return;
            case 'ArrayPattern':
                for (const e of node.elements ?? []) this.#bindPattern(e);
                return;
            case 'AssignmentPattern':
                this.#bindPattern(node.left);
                return;
            case 'RestElement':
                this.#bindPattern(node.argument);
                return;
            case 'TSParameterProperty':
                this.#bindPattern(node.parameter);
                return;
        }
    }

    #onFunction = (node: AnyProp) => {
        if (node.id?.type === 'Identifier') this.#bind(node.id.name);
        const params = Array.isArray(node.params) ? node.params : (node.params?.items ?? []);
        for (const p of params) this.#bindPattern(p);
        if (node.params?.rest) this.#bindPattern(node.params.rest);
    };

    #onNamedDeclaration = (node: AnyProp) => {
        if (node.id?.type === 'Identifier') this.#bind(node.id.name);
    };

    #onCatch = (node: AnyProp) => {
        this.#bindPattern(node.param);
    };

    /**
     * JSX 의 `className={...}` 자리에서 template literal 로 2개 이상의 identifier 를 합치면
     * 빌드 에러. 중복 제거·같은 파일 병합을 건너뛰므로 `css(a, b)` 로 합치도록 유도한다.
     * identifier 1개 + 정적 문자열(`\`\${cls} active\``)은 흔한 패턴이라 허용한다.
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

    #onVariableDeclarator = (node: AnyProp) => {
        this.#bindPattern(node.id);
        if (node?.id?.type === 'Identifier' && this.#isCssCall(node.init)) {
            this.#vaporLocals.add(node.id.name);
        }
    };

    /** Template literal 안에 `css()` 결과가 2개 이상 섞이면 빌드 에러 (`#onJsxAttribute` 참고). */
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
        if (!this.#isCssCall(node)) return;
        if ((node.arguments ?? []).length === 0) {
            this.#errors.push(noArgError(node));
            return;
        }
        this.#callNodes.push({ node, parents: parents.slice() });
    };

    // ── 인자 해석 ───────────────────────────────────────────────

    #parseObject(node: AnyProp): ParseCallResult {
        let res = this.#parsed.get(node);
        if (!res) {
            res = parseCallArg(node, this.opts.source);
            this.#parsed.set(node, res);
            this.#errors.push(...res.errors);
        }
        return res;
    }

    /** css() 호출의 인자들을 해석. 파싱 에러가 나면 `null`. */
    #resolveCallArgs(call: AnyProp): ArgRecord[] | null {
        const before = this.#errors.length;
        const args: ArgRecord[] = [];
        for (const a of call.arguments) {
            const pieces = this.#resolve(a, new Set());
            if (pieces) args.push({ kind: 'local', pieces });
            else if (this.#isCssCall(a) || containsCssCall(a, this.#bindingName!)) {
                this.#errors.push(nestedCallError(a));
            } else args.push({ kind: 'external', node: a });
        }
        return this.#errors.length > before ? null : args;
    }

    /**
     * 인자 표현식을 컴파일 시점 조각으로 푼다. 풀 수 없으면(props, import, 함수 호출 결과 등)
     * `null` — 그 인자는 런타임 class 문자열로 이어붙인다.
     */
    #resolve(node: AnyProp, visiting: Set<string>): Piece[] | null {
        if (!node) return null;
        switch (node.type) {
            case 'ObjectExpression':
                return this.#objectPieces(node);
            case 'ParenthesizedExpression':
            case 'TSAsExpression':
            case 'TSSatisfiesExpression':
            case 'TSNonNullExpression':
                return this.#resolve(node.expression, visiting);
            case 'Literal':
                return node.value === null || node.value === false ? [] : null;
            case 'Identifier': {
                if (node.name === 'undefined') return [];
                const init = this.#topLevelStatic.get(node.name);
                if (!init || (this.#bindingCounts.get(node.name) ?? 0) !== 1) return null;
                if (visiting.has(node.name)) return null;
                visiting.add(node.name);
                const pieces = this.#resolve(init, visiting);
                visiting.delete(node.name);
                return pieces;
            }
            case 'CallExpression':
                return this.#isCssCall(node) ? this.#resolveAll(node.arguments, visiting) : null;
            case 'LogicalExpression': {
                if (node.operator !== '&&') return null;
                const right = this.#resolve(node.right, visiting);
                if (!right) return null;
                return [
                    { kind: 'cond', test: this.#src(node.left), whenTrue: right, whenFalse: [] },
                ];
            }
            case 'ConditionalExpression': {
                const whenTrue = this.#resolve(node.consequent, visiting);
                const whenFalse = this.#resolve(node.alternate, visiting);
                if (!whenTrue || !whenFalse) return null;
                return [{ kind: 'cond', test: this.#src(node.test), whenTrue, whenFalse }];
            }
            default:
                return null;
        }
    }

    #resolveAll(nodes: AnyProp[], visiting: Set<string>): Piece[] | null {
        const out: Piece[] = [];
        for (const n of nodes ?? []) {
            const p = this.#resolve(n, visiting);
            if (!p) return null;
            out.push(...p);
        }
        return out;
    }

    /**
     * object 리터럴 하나를 조각으로. entry-level 삼항은 선언 위치 그대로 `cond` 조각이 되어
     * 두 분기가 각각 나머지 선언과 합쳐진 블록을 만든다.
     */
    #objectPieces(node: AnyProp): Piece[] {
        const { rules, ternaries } = this.#parseObject(node);
        const startsAt = new Map<number, ParseCallResult['ternaries'][number]>();
        const inTernary = new Set<number>();
        for (const t of ternaries) {
            const all = [...t.consequentRuleIndexes, ...t.alternateRuleIndexes];
            if (all.length) startsAt.set(Math.min(...all), t);
            for (const i of all) inTernary.add(i);
        }

        const pieces: Piece[] = [];
        let fixed: IRRule[] = [];
        const flush = () => {
            if (fixed.length) pieces.push({ kind: 'fixed', rules: fixed });
            fixed = [];
        };
        for (let i = 0; i < rules.length; i++) {
            const t = startsAt.get(i);
            if (t) {
                flush();
                pieces.push({
                    kind: 'cond',
                    test: this.opts.source.slice(t.testStart, t.testEnd),
                    whenTrue: [
                        { kind: 'fixed', rules: t.consequentRuleIndexes.map((j) => rules[j]) },
                    ],
                    whenFalse: [
                        { kind: 'fixed', rules: t.alternateRuleIndexes.map((j) => rules[j]) },
                    ],
                });
            } else if (!inTernary.has(i)) {
                fixed.push(rules[i]);
            }
        }
        flush();
        return pieces;
    }

    #src(node: AnyProp): string {
        return this.opts.source.slice(node.start, node.end);
    }

    // ── 출력 ───────────────────────────────────────────────────

    /**
     * className 과 같은 분기 트리를 따라 slot 트리를 만든다. leaf 의 slot 은 그 분기 블록의
     * 정규화된 규칙에서 뽑으므로, 뒤 선언에 덮인 dynamic 값은 평가조차 하지 않는다.
     */
    #slotTree(pieces: Piece[]): SlotTree {
        return project<SlotTree>(
            pieces,
            [],
            (rules) => {
                const seen = new Set<string>();
                const entries: string[] = [];
                for (const r of normalizeRules(rules)) {
                    if (r.kind !== 'dynamic' || seen.has(r.slotId)) continue;
                    seen.add(r.slotId);
                    entries.push(this.#slotEntry(r));
                }
                return { kind: 'obj', entries };
            },
            (test, whenTrue, whenFalse) =>
                sameSlots(whenTrue, whenFalse)
                    ? whenTrue
                    : { kind: 'cond', test: () => test, whenTrue, whenFalse },
        );
    }

    /**
     * slot 하나의 style property 리터럴.
     *
     * NOTE(unit-strategy): 리터럴 숫자는 `parse-call.ts` 의 extractStaticValue 가 static 으로
     *   판정해 dynamic slot 자체가 생성되지 않는다 — 여기 오는 slot 은 전부 변수 참조.
     *   axis 가 없으면 token lookup 이 의미 없으므로 숫자-unit 전용 helper `_ix` 로 분기 —
     *   axis 없는 slot 만 쓰는 번들은 `_resolveToken` 과 토큰 테이블을 tree-shake 할 수 있다.
     *
     *   `?? 'var(<varName>,)'` sentinel fallback: 사용자가 undefined 를 넘겨도 slot 변수가
     *   "선언만 유지, 값은 비어있음" 상태로 남아 CSS 가 invalid-at-computed-value-time →
     *   `unset` 으로 떨어져 부모 상속 체인이 끊기지 않는다 (리뷰 #6c sentinel 후속).
     */
    #slotEntry(r: DynamicRule): string {
        const varName = dynamicVarName(r.slotId, this.#mode === 'hashed' ? 'prod' : 'dev');
        // property 가 unitless 면 unit 인자 생략 → 숫자 값은 string 변환만.
        const unitArg = isUnitless(r.property) ? '' : `, 'px'`;
        const axis = axisForProperty(r.property);

        let call: string;
        if (axis === null) {
            call = `_ix(${r.sourceExpr}${unitArg})`;
            this.#needIx = true;
        } else {
            // 사용자 스코프 충돌을 피하기 위해 `__vaporAxis_<name>` alias 로 참조한다.
            this.#axesUsed.add(axis);
            call = `_resolveToken(${axisAliasName(axis)}, ${r.sourceExpr}${unitArg})`;
            this.#needResolveToken = true;
        }
        return `'${varName}': ${call} ?? 'var(${varName},)'`;
    }

    /** 규칙 목록 → 블록 등록 → class 이름. 규칙이 없으면 빈 문자열. */
    #blockClass(rules: IRRule[], debugId: string | undefined): string {
        const normalized = normalizeRules(rules);
        if (normalized.length === 0) return '';
        const className = buildBlockClassName({
            scope: this.#scope,
            signature: signatureOf(normalized),
            mode: this.#mode,
            debugId,
        });
        this.#blocks.push({ className, rules: normalized });
        return className;
    }

    /** 조각 목록 → 분기마다 병합 블록을 만들고, 고르는 표현식(문자열 리터럴 또는 삼항)을 반환. */
    #combine(pieces: Piece[], debugId: string | undefined): string {
        return project<string>(
            pieces,
            [],
            (rules) => jsSingleQuoted(this.#blockClass(rules, debugId)),
            (test, t, f) => (t === f ? t : `(${test} ? ${t} : ${f})`),
        );
    }

    /**
     * `css(...)` 호출 전체를 바꿀 소스 문자열. 반환값은 항상 string 이다 (RSC 안전).
     * - 로컬로 풀리는 인자(object, 같은 파일 최상위 `css()` 상수, 그 조건부 조합)는 한 블록으로
     *   병합한다 — 뒤 인자가 같은 선언 슬롯을 이긴다.
     * - 그 밖의 인자는 `_cx([...])` 로 이어붙인다. 승패는 CSS 로드 순서(import 순서)를 따른다.
     */
    #buildCallReplacement(call: CallRecord): string {
        const locals = call.args.flatMap((a) => (a.kind === 'local' ? a.pieces : []));
        const firstLocal = call.args.findIndex((a) => a.kind === 'local');
        const localExpr = firstLocal === -1 ? null : this.#combine(locals, call.debugId);

        const externals = call.args.filter((a) => a.kind === 'external');
        if (externals.length === 0) return localExpr ?? "''";

        const parts: string[] = [];
        call.args.forEach((a, idx) => {
            if (a.kind === 'external') parts.push(this.#src(a.node));
            else if (idx === firstLocal && localExpr) parts.push(localExpr);
        });
        this.#needCx = true;
        return `_cx([${parts.join(', ')}])`;
    }

    #insertCssImport(specifier: string) {
        const line = `import ${jsSingleQuoted(specifier)};`;
        if (this.#lastImportEnd >= 0) this.#ms!.appendRight(this.#lastImportEnd, `\n${line}`);
        else this.#ms!.appendLeft(directivePrologueEnd(this.opts.source), `${line}\n`);
    }

    #ensureRuntimeImport() {
        const specifiers: string[] = [];
        if (this.#needCx) specifiers.push('_cx');
        if (this.#needResolveToken) specifiers.push('_resolveToken');
        if (this.#needIx) specifiers.push('_ix');
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

// ────────────────────────────────────────────────────────────────
// helpers
// ────────────────────────────────────────────────────────────────

/** 두 slot 트리가 같은 값을 만드는지. 분기가 같으면 조건을 생략한다. */
function sameSlots(a: SlotTree, b: SlotTree): boolean {
    if (a.kind === 'obj' && b.kind === 'obj') return a.entries.join('\0') === b.entries.join('\0');
    if (a.kind === 'cond' && b.kind === 'cond') {
        return a.test() === b.test() && sameSlots(a.whenTrue, b.whenTrue) && sameSlots(a.whenFalse, b.whenFalse);
    }
    return false;
}

/** 값에 영향 없는 TS 래퍼(`as`, `satisfies`, `!`, 괄호)를 벗긴다. */
function unwrapTypeOnly(node: AnyProp): AnyProp {
    let n = node;
    while (
        n &&
        (n.type === 'TSAsExpression' ||
            n.type === 'TSSatisfiesExpression' ||
            n.type === 'TSNonNullExpression' ||
            n.type === 'ParenthesizedExpression')
    ) {
        n = n.expression;
    }
    return n;
}

function contains(outer: AnyProp, inner: AnyProp): boolean {
    return outer.start <= inner.start && inner.end <= outer.end;
}

function containsCssCall(node: AnyProp, binding: string): boolean {
    let found = false;
    walk(node, {
        CallExpression: (n) => {
            if (n.callee?.type === 'Identifier' && n.callee.name === binding) found = true;
        },
    });
    return found;
}

/** readable 모드 class 앞에 붙일 이름: 가장 가까운 변수 → JSX 요소 → 함수 이름. */
function debugIdOf(parents: AnyProp[]): string | undefined {
    for (let i = parents.length - 1; i >= 0; i--) {
        const n = parents[i];
        if (n.type === 'VariableDeclarator' && n.id?.type === 'Identifier') return n.id.name;
        if (n.type === 'JSXOpeningElement') return jsxName(n.name);
        if ((n.type === 'FunctionDeclaration' || n.type === 'Function') && n.id?.name) {
            return n.id.name;
        }
    }
    return undefined;
}

function jsxName(name: AnyProp): string | undefined {
    if (!name) return undefined;
    if (name.type === 'JSXIdentifier') return name.name;
    if (name.type === 'JSXMemberExpression') return jsxName(name.property);
    if (name.type === 'JSXNamespacedName') return name.name?.name;
    return undefined;
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
    return { code: source, css: null, errors: [] };
}

function errorResult(source: string, errors: BuildError[]): TransformResult {
    return { code: source, css: null, errors };
}

function locOf(node: AnyProp) {
    return { line: node?.loc?.start?.line ?? 1, column: node?.loc?.start?.column ?? 0 };
}

function templateLiteralError(node: AnyProp): BuildError {
    return {
        code: 'template-literal',
        message:
            'Template literal join of css() results skips merging. ' +
            'Use css(a, b) instead so later arguments win.',
        loc: locOf(node),
    };
}

function noArgError(node: AnyProp): BuildError {
    return {
        code: 'invalid-input-shape',
        message: 'css() requires at least one argument.',
        loc: locOf(node),
    };
}

function nestedCallError(node: AnyProp): BuildError {
    return {
        code: 'invalid-input-shape',
        message:
            'A css() call nested inside another css() call must be fully static ' +
            '(object literals, same-file css() constants, and && / ?: between them).',
        loc: locOf(node),
    };
}

function tooManyBranchesError(node: AnyProp, combos: number): BuildError {
    return {
        code: 'invalid-input-shape',
        message:
            `css() call has ${combos} conditional style combinations (limit ${MAX_COMBINATIONS}). ` +
            'Split it into several css() calls.',
        loc: locOf(node),
    };
}
