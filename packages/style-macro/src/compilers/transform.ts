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
import { isShadowed } from './scope';

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
    | {
          kind: 'cond';
          test: string;
          /** `test` 의 원본 소스 위치. */
          start: number;
          end: number;
          whenTrue: Piece[];
          whenFalse: Piece[];
      };

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

    /** 모듈 최상위 `const x = css(...)` / `const x = { ... }` — 같은 파일 병합 대상. */
    readonly #topLevelStatic = new Map<string, { init: AnyProp; stmtStart: number }>();
    /**
     * 최상위 상수를 푼 조각. 조건·dynamic 값 원문은 정의 위치에서 `__vaporCapture_N` 으로
     * 캡처한 이름으로 바뀌어 있다 — 사용처 스코프에서 같은 이름이 다른 바인딩을 가리켜도
     * 정의 시점 값을 읽는다. 상수마다 한 번만 푼다.
     */
    readonly #resolvedTopLevel = new Map<string, Piece[]>();
    /**
     * 모듈 최상위 이름을 루트로 한 변경 지점 (`x.a = …`, `delete x.a`, `Object.assign(x, …)` 등).
     * 병합된 object 상수가 여기 있으면 컴파일 결과(소스에 적힌 값)와 런타임 값이 갈라진다.
     */
    readonly #mutations: { name: string; node: AnyProp; parents: AnyProp[] }[] = [];
    #captureCount = 0;
    /** `start:end` → 그 위치에서 옮겨진 식의 캡처 이름. */
    readonly #captureAt = new Map<string, string>();
    /** style 병합에 쓴 runtime helper (`_mergeStyle`, `_withStyle`). */
    readonly #helpers = new Set<string>();
    /** `parseCallArg` 결과 캐시 (같은 object 를 여러 경로에서 풀 수 있음). */
    readonly #parsed = new Map<AnyProp, ParseCallResult>();

    constructor(private readonly opts: TransformOpts) {
        this.#mode = opts.hash ? 'hashed' : 'readable';
        this.#scope = opts.scope ?? opts.filename;
    }

    run(): TransformResult {
        const { source, filename } = this.opts;
        if (this.#shouldSkip()) return emptyResult(source);

        // 매크로를 import 한 파일만 여기 온다 — 못 읽으면 조용히 넘기지 않고 빌드 에러.
        // 그대로 두면 css() 가 런타임 placeholder 로 남아 스타일이 통째로 빠진다.
        const parsed = parseSync(filename, source, {
            sourceType: 'module',
            lang: langOf(filename),
        });
        if (parsed.errors?.length)
            return errorResult(source, [parseError(source, parsed.errors[0])]);

        const program = parsed.program;
        this.#scanImports(program);
        if (!this.#bindingName) return emptyResult(source);
        this.#scanTopLevel(program);
        this.#ms = new MagicString(source);

        walk(program, {
            CallExpression: this.#onCall,
            AssignmentExpression: this.#onAssignment,
            UpdateExpression: this.#onUpdate,
            UnaryExpression: this.#onUnary,
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
            const args = this.#resolveCallArgs(node, parents);
            if (!args) continue;
            calls.push({ node, parents, args, debugId: debugIdOf(parents) });
        }

        // css() 상수 정의도 캡처된 식을 읽어야 한다 (식이 정의와 캡처 두 곳에서 평가되지 않게).
        for (const call of calls) {
            const captured = this.#capturedDefinitionOf(call.node);
            if (captured) call.args = [{ kind: 'local', pieces: captured }];
        }

        this.#checkMutations();
        if (this.#errors.length) return errorResult(source, this.#errors);

        const injectCtx: InjectContext = {
            ms: this.#ms,
            pending: new Map(),
            helpers: new Set(),
            errors: [],
        };

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
        if (injectCtx.errors.length) return errorResult(source, injectCtx.errors);
        for (const h of injectCtx.helpers) this.#helpers.add(h);
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
                this.#topLevelStatic.set(d.id.name, { init, stmtStart: stmt.start });
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

    #onCall = (node: AnyProp, parents: AnyProp[]) => {
        this.#onMutatingCall(node, parents);
        this.#onCallExpression(node, parents);
    };

    #onAssignment = (node: AnyProp, parents: AnyProp[]) =>
        this.#recordMutation(node.left, node, parents);
    #onUpdate = (node: AnyProp, parents: AnyProp[]) =>
        this.#recordMutation(node.argument, node, parents);
    #onUnary = (node: AnyProp, parents: AnyProp[]) => {
        if (node.operator === 'delete') this.#recordMutation(node.argument, node, parents);
    };
    /** 첫 인자를 제자리에서 바꾸는 내장 함수 (`Object.assign(x, …)` 등). */
    #onMutatingCall = (node: AnyProp, parents: AnyProp[]) => {
        const c = node.callee;
        if (c?.type !== 'MemberExpression' || c.computed) return;
        const owner = c.object?.type === 'Identifier' ? c.object.name : null;
        const method = c.property?.name;
        if (!owner || !MUTATING_BUILTINS[owner]?.has(method)) return;
        const target = node.arguments?.[0];
        const name = rootName(target, true);
        if (name) this.#mutations.push({ name, node, parents: parents.slice() });
    };

    /** 멤버 접근 대상(`x.a`, `x[k].b`)의 변경만 기록한다. 이름 자체 재할당은 const 라 불가. */
    #recordMutation(target: AnyProp, node: AnyProp, parents: AnyProp[]) {
        const name = rootName(target, false);
        if (name) this.#mutations.push({ name, node, parents: parents.slice() });
    }

    /**
     * 병합에 쓰인 object 상수가 변경되면 빌드 에러. 컴파일러는 소스에 적힌 값으로 병합하므로
     * 변경은 반영되지 않는다 — 조용히 틀린 스타일을 내는 대신 알린다. 병합된 상수만 보므로
     * 읽기·export·다른 곳에 값으로 넘기기는 영향이 없다. alias·함수 내부 변경은 잡지 않는다.
     */
    /** 이 호출이 캡처된 최상위 `css()` 상수의 정의라면 그 캡처 조각. */
    #capturedDefinitionOf(node: AnyProp): Piece[] | null {
        for (const [name, top] of this.#topLevelStatic) {
            if (top.init === node) return this.#resolvedTopLevel.get(name) ?? null;
        }
        return null;
    }

    #checkMutations() {
        for (const { name, node, parents } of this.#mutations) {
            const top = this.#topLevelStatic.get(name);
            if (top?.init.type !== 'ObjectExpression' || !this.#resolvedTopLevel.has(name))
                continue;
            // 변경 위치에서 이 이름이 지역 바인딩을 가리키면 모듈 상수와 무관하다.
            if (isShadowed(name, parents)) continue;
            this.#errors.push({
                code: 'mutated-constant',
                message:
                    `\`${name}\` is passed to css() and also modified here. css() compiles the value ` +
                    `written in the source, so this change is not applied. Keep the object unchanged, ` +
                    `or put the variant in its own object and pass both to css().`,
                loc: locAt(this.opts.source, node.start),
            });
        }
    }

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
    #resolveCallArgs(call: AnyProp, scope: AnyProp[]): ArgRecord[] | null {
        const before = this.#errors.length;
        const args: ArgRecord[] = [];
        for (const a of call.arguments) {
            const pieces = this.#resolve(a, scope, new Set());
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
    #resolve(node: AnyProp, scope: AnyProp[], visiting: Set<string>): Piece[] | null {
        if (!node) return null;
        switch (node.type) {
            case 'ObjectExpression':
                return this.#objectPieces(node);
            case 'ParenthesizedExpression':
            case 'TSAsExpression':
            case 'TSSatisfiesExpression':
            case 'TSNonNullExpression':
                return this.#resolve(node.expression, scope, visiting);
            case 'Literal':
                return node.value === null || node.value === false ? [] : null;
            case 'Identifier': {
                if (node.name === 'undefined') return [];
                // 이 위치에서 이름이 지역 바인딩(prop, 지역 변수 등)을 가리키면 모듈 상수가 아니다.
                const top = this.#topLevelStatic.get(node.name);
                if (!top || isShadowed(node.name, scope)) return null;
                const cached = this.#resolvedTopLevel.get(node.name);
                if (cached) return cached;
                if (visiting.has(node.name)) return null;
                visiting.add(node.name);
                // 상수 정의는 모듈 스코프에서 평가된다.
                const pieces = this.#resolve(top.init, [], visiting);
                visiting.delete(node.name);
                if (!pieces) return null;
                const captured = this.#capture(pieces, top);
                this.#resolvedTopLevel.set(node.name, captured);
                return captured;
            }
            case 'CallExpression':
                return this.#isCssCall(node)
                    ? this.#resolveAll(node.arguments, scope, visiting)
                    : null;
            case 'LogicalExpression': {
                if (node.operator !== '&&') return null;
                const right = this.#resolve(node.right, scope, visiting);
                if (!right) return null;
                return [{ ...this.#condTest(node.left), whenTrue: right, whenFalse: [] }];
            }
            case 'ConditionalExpression': {
                const whenTrue = this.#resolve(node.consequent, scope, visiting);
                const whenFalse = this.#resolve(node.alternate, scope, visiting);
                if (!whenTrue || !whenFalse) return null;
                return [{ ...this.#condTest(node.test), whenTrue, whenFalse }];
            }
            default:
                return null;
        }
    }

    /**
     * 최상위 상수의 런타임 식(분기 조건, dynamic 값)을 정의 문장 바로 앞
     * `const __vaporCapture_N = (<expr>);` 로 **옮긴다**. 식이 평가되는 곳은 이 한 곳뿐이고,
     * 정의와 모든 사용처는 이름을 읽는다 — 사용처 스코프의 같은 이름에 가려지지 않고, 부작용도
     * 원본처럼 모듈 평가 시 한 번만 일어난다.
     *
     * - object 상수: 리터럴은 그대로 남아 다른 곳에서 읽히므로 식 자리를 이름으로 바꾼다.
     * - css() 상수: 호출 전체가 class 선택식으로 치환되므로, 그 치환이 이 조각을 쓴다
     *   (`run` 에서 정의 호출의 인자를 캐시된 조각으로 교체).
     * 같은 위치의 식(shorthand 분해 등)은 한 번만 옮긴다. 중첩 상수에서 온 식은 이미 옮겨져
     * 위치가 그 상수의 정의 안이므로 다시 옮기지 않는다.
     */
    #capture(pieces: Piece[], top: { init: AnyProp; stmtStart: number }): Piece[] {
        const inPlace = top.init.type === 'ObjectExpression';
        const take = (expr: string, start: number, end: number): string => {
            if (start < top.init.start || end > top.init.end) return expr;
            const key = `${start}:${end}`;
            const existing = this.#captureAt.get(key);
            if (existing) return existing;
            const name = `__vaporCapture_${this.#captureCount++}`;
            this.#captureAt.set(key, name);
            this.#ms!.appendLeft(top.stmtStart, `const ${name} = (${expr});\n`);
            if (inPlace) this.#ms!.overwrite(start, end, name);
            return name;
        };
        const walkPieces = (ps: Piece[]): Piece[] =>
            ps.map((p) =>
                p.kind === 'fixed'
                    ? {
                          kind: 'fixed',
                          rules: p.rules.map((r) =>
                              r.kind === 'dynamic'
                                  ? { ...r, sourceExpr: take(r.sourceExpr, r.start, r.end) }
                                  : r,
                          ),
                      }
                    : {
                          ...p,
                          test: take(p.test, p.start, p.end),
                          whenTrue: walkPieces(p.whenTrue),
                          whenFalse: walkPieces(p.whenFalse),
                      },
            );
        return walkPieces(pieces);
    }

    #resolveAll(nodes: AnyProp[], scope: AnyProp[], visiting: Set<string>): Piece[] | null {
        const out: Piece[] = [];
        for (const n of nodes ?? []) {
            const p = this.#resolve(n, scope, visiting);
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
                    start: t.testStart,
                    end: t.testEnd,
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

    #condTest(node: AnyProp) {
        return { kind: 'cond' as const, test: this.#src(node), start: node.start, end: node.end };
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
        specifiers.push(...Array.from(this.#helpers).sort());
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
        return (
            a.test() === b.test() &&
            sameSlots(a.whenTrue, b.whenTrue) &&
            sameSlots(a.whenFalse, b.whenFalse)
        );
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

/**
 * 확장자별 파서 언어. TS 와 TSX 는 서로 호환되지 않는 문법(`<T>x` 캐스트 vs JSX)이 있어
 * 반드시 구분한다. JS 계열은 JSX 를 허용하는 상위 집합(`jsx`)으로 읽는다 — Next.js 등은
 * `.js` 안 JSX 를 허용하고, JS 에는 JSX 와 충돌하는 문법이 없다.
 */
function langOf(filename: string): 'ts' | 'tsx' | 'jsx' {
    if (/\.[cm]?ts$/.test(filename)) return 'ts';
    if (filename.endsWith('.tsx')) return 'tsx';
    return 'jsx';
}

function parseError(
    source: string,
    err: { message: string; labels?: { start: number }[] },
): BuildError {
    return {
        code: 'parse-error',
        message: `Failed to parse file: ${err.message}`,
        loc: locAt(source, err.labels?.[0]?.start ?? 0),
    };
}

/** 소스 offset → 1-based line / 0-based column. */
function locAt(source: string, offset: number) {
    const before = source.slice(0, offset);
    return { line: before.split('\n').length, column: offset - (before.lastIndexOf('\n') + 1) };
}

/** 첫 인자를 제자리에서 바꾸는 내장 함수. */
const MUTATING_BUILTINS: Record<string, Set<string>> = {
    Object: new Set(['assign', 'defineProperty', 'defineProperties', 'setPrototypeOf']),
    Reflect: new Set(['set', 'defineProperty', 'deleteProperty', 'setPrototypeOf']),
};

/**
 * `x`, `x.a`, `x[k].b`, `x!.a` 의 루트 식별자. `allowBare` 가 false 면 멤버 접근일 때만
 * (이름 자체에 대한 할당은 제외) 반환한다.
 */
function rootName(node: AnyProp, allowBare: boolean): string | null {
    let n = unwrapTypeOnly(node);
    let member = false;
    while (n?.type === 'MemberExpression' || n?.type === 'ChainExpression') {
        if (n.type === 'MemberExpression') {
            member = true;
            n = unwrapTypeOnly(n.object);
        } else {
            n = unwrapTypeOnly(n.expression);
        }
    }
    if (n?.type !== 'Identifier') return null;
    return member || allowBare ? n.name : null;
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
