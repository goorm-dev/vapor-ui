import MagicString from 'magic-string';
import { parseSync } from 'oxc-parser';

import { axisAliasName } from '~/models/axis-alias';
import { type ClassNameMode, buildBlockClassName, dynamicVarName } from '~/models/class-name';
import type { AnyProp, BuildError, DynamicRule, IRRule } from '~/models/types';
import { propertyToTokenAxis } from '~/tokens';
import { isUnitless } from '~/tokens/css-reference';

import { type Block, DEFAULT_LAYER, emitBlocks, normalizeRules, signatureOf } from './emit-css';
import {
    type FoundJsx,
    type InjectContext,
    type SlotTree,
    flushInjects,
    injectJsxStyleForCall,
    locateJsx,
    slotsEvaluateFirst,
} from './jsx-inject';
import { locAt, locOfNode } from './loc';
import { MemoTemps, isRereadable, memoScopeOf } from './memo';
import { walk } from './oxc-walk';
import { type ParseCallResult, parseCallArg } from './parse-call';
import { isShadowed } from './scope';

// ────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────

/** Source map v3 (번들러가 받는 형태). */
export interface SourceMapV3 {
    version: number;
    file?: string;
    sources: string[];
    sourcesContent?: (string | null)[];
    names: string[];
    mappings: string;
}

export interface TransformResult {
    code: string;
    /** `code` → `source` source map. 바뀐 것이 없으면 `null`. */
    map: SourceMapV3 | null;
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
type Piece = { kind: 'fixed'; rules: IRRule[] } | CondPiece;

interface CondPiece {
    kind: 'cond';
    test: string;
    /** `test` 의 원본 소스 위치. */
    start: number;
    end: number;
    /** 다시 평가해도 결과·부작용이 같은 식인지 (`./memo` 의 `isRereadable`, 캡처된 이름). */
    rereadable: boolean;
    whenTrue: Piece[];
    whenFalse: Piece[];
}

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
    fork: (cond: CondPiece, whenTrue: T, whenFalse: T) => T,
): T {
    const i = pieces.findIndex((p) => p.kind === 'cond');
    if (i === -1) {
        const rules = [...acc];
        for (const p of pieces) if (p.kind === 'fixed') rules.push(...p.rules);
        return leaf(rules);
    }
    const head: IRRule[] = [...acc];
    for (const p of pieces.slice(0, i)) if (p.kind === 'fixed') head.push(...p.rules);
    const c = pieces[i] as CondPiece;
    const rest = pieces.slice(i + 1);
    const t = project([...c.whenTrue, ...rest], head, leaf, fork);
    const f = project([...c.whenFalse, ...rest], head, leaf, fork);
    return fork(c, t, f);
}

/**
 * 조각 목록을 펼친 분기 트리. className 식과 style(slot) 식은 모두 이 트리 하나를 렌더한다 —
 * 어떤 분기에서 어떤 class 와 어떤 slot 이 함께 쓰이는지가 구조로 보장된다.
 */
type Decision =
    | { kind: 'leaf'; rules: IRRule[] }
    | { kind: 'fork'; cond: CondPiece; whenTrue: Decision; whenFalse: Decision };

function decide(pieces: Piece[]): Decision {
    return project<Decision>(
        pieces,
        [],
        (rules) => ({ kind: 'leaf', rules }),
        (cond, whenTrue, whenFalse) => ({ kind: 'fork', cond, whenTrue, whenFalse }),
    );
}

/**
 * 분기 트리를 한 출력(class 식 또는 slot 트리)으로 렌더한다. 두 분기의 출력이 같으면 조건을
 * 접는다 — 단 `keep` 인 조건은 접지 않는다 (그 조건의 평가 자체가 원본 동작의 일부일 때).
 */
function renderDecision<T>(
    d: Decision,
    out: {
        leaf: (rules: IRRule[]) => T;
        same: (a: T, b: T) => boolean;
        fork: (cond: CondPiece, whenTrue: T, whenFalse: T) => T;
        keep: (cond: CondPiece) => boolean;
    },
): T {
    if (d.kind === 'leaf') return out.leaf(d.rules);
    const t = renderDecision(d.whenTrue, out);
    const f = renderDecision(d.whenFalse, out);
    if (!out.keep(d.cond) && out.same(t, f)) return t;
    return out.fork(d.cond, t, f);
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
    /** className·style 이 공유하는 조건의 임시 변수. */
    readonly #memo = new MemoTemps();
    /** 임시 변수 대입·참조로 이미 바꾼 guard 조건 노드. */
    readonly #memoWrapped = new Set<AnyProp>();
    /** import 바인딩을 참조하는 `css(...)` 호출 노드. */
    readonly #macroCalls = new Set<AnyProp>();
    #ms: MagicString | null = null;
    /** 마지막 import 문의 끝 위치. 없으면 -1. */
    #lastImportEnd = -1;
    /**
     * 파일 머리(hashbang, directive prologue) 끝 위치. 없으면 0.
     * 파서가 prologue 로 판정한 문(ESTree `ExpressionStatement.directive`)만 센다 —
     * 주석·괄호·같은 줄 코드 처리를 파서와 똑같이 따른다.
     */
    #prologueEnd = 0;
    #needResolveToken = false;
    #needIx = false;
    #needCx = false;

    /** 모듈 최상위 `const x = css(...)` / `const x = { ... }` — 같은 파일 병합 대상. */
    readonly #topLevelStatic = new Map<string, TopLevelConst>();
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
        this.#prologueEnd = prologueEnd(program);
        this.#scanImports(program);
        if (!this.#bindingName) return emptyResult(source);
        this.#ms = new MagicString(source);

        walk(program, {
            CallExpression: this.#onCall,
            AssignmentExpression: this.#onAssignment,
            UpdateExpression: this.#onUpdate,
            UnaryExpression: this.#onUnary,
            ForInStatement: this.#onForInOf,
            ForOfStatement: this.#onForInOf,
        });
        // 매크로 호출 판정(#macroCalls)이 끝난 뒤에 최상위 상수를 분류한다.
        this.#scanTopLevel(program);

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
                this.#errors.push(tooManyBranchesError(this.opts.source, call.node, combos));
                continue;
            }

            const decision = decide(pieces);
            let classTest = (c: CondPiece) => c.test;
            let classFirst = true;
            if (this.#hasSlots(decision)) {
                const found = locateJsx(this.opts.source, call.node, call.parents);
                if ('error' in found) {
                    this.#errors.push(found.error);
                    continue;
                }
                const shared = this.#shareConditions(call, decision, found);
                classTest = shared.classTest;
                classFirst = shared.classFirst;
                const outcome = injectJsxStyleForCall(
                    {
                        call: call.node,
                        found,
                        guardTests: shared.guardTests,
                        slots: shared.slots,
                    },
                    injectCtx,
                );
                if (!outcome.success) {
                    if (outcome.error) this.#errors.push(outcome.error);
                    continue;
                }
            }

            this.#ms.overwrite(
                call.node.start,
                call.node.end,
                this.#buildCallReplacement(call, decision, classTest, classFirst),
            );
        }
        this.#memo.flush(this.#ms, (line) => this.#insertAtTop(line));

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

        const map = this.#ms.generateMap({
            source: filename,
            includeContent: true,
            hires: 'boundary',
        });
        return {
            code: this.#ms.toString(),
            map: { ...map, sources: [filename], sourcesContent: [source] },
            css: css || null,
            errors: [],
        };
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
            const keyword = `${stmt === decl ? '' : 'export '}${decl.kind}`;
            decl.declarations.forEach((d: AnyProp, i: number) => {
                if (d.id?.type !== 'Identifier') return;
                const init = unwrapTypeOnly(d.init);
                if (!this.#isCssCall(init) && init?.type !== 'ObjectExpression') return;
                // 첫 선언자는 문장 앞이 곧 선언자 앞. 그 뒤 선언자는 앞 선언자와의 경계에서 문장을 나눠야
                // 캡처를 그 사이에 둘 수 있다.
                const split =
                    i === 0 ? null : { from: decl.declarations[i - 1].end, to: d.start, keyword };
                this.#topLevelStatic.set(d.id.name, {
                    init,
                    insertAt: i === 0 ? stmt.start : d.start,
                    split,
                });
            });
        }
    }

    /** 매크로 호출인지 — 이름이 아니라 import 바인딩 참조 여부로 정한다 (`#onCall` 에서 판정). */
    #isCssCall(node: AnyProp): boolean {
        return this.#macroCalls.has(node);
    }

    /** `node` 안(자신 포함)에 매크로 호출이 있는지. */
    #containsCssCall(node: AnyProp): boolean {
        for (const call of this.#macroCalls) if (contains(node, call)) return true;
        return false;
    }

    #onCall = (node: AnyProp, parents: AnyProp[]) => {
        // Babel macro 의 `binding.referencePaths` 와 같다: callee 가 이 위치에서 import 바인딩을
        // 가리킬 때만 매크로다. 지역 바인딩(파라미터·지역 변수 등)에 가려진 `css` 는 사용자 함수다.
        const binding = this.#bindingName;
        if (
            binding &&
            node.callee?.type === 'Identifier' &&
            node.callee.name === binding &&
            !isShadowed(binding, parents)
        ) {
            this.#macroCalls.add(node);
        }
        this.#onMutatingCall(node, parents);
        this.#onCallExpression(node, parents);
    };

    #onAssignment = (node: AnyProp, parents: AnyProp[]) =>
        this.#recordTargets(node.left, node, parents);
    /** `for (x.a of …)` / `for (x.a in …)` 는 반복마다 left 에 대입한다. 선언(`const v`)은 제외. */
    #onForInOf = (node: AnyProp, parents: AnyProp[]) => {
        if (node.left?.type !== 'VariableDeclaration')
            this.#recordTargets(node.left, node, parents);
    };
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
     * 대입 대상(assignment target)의 모든 참조에 대해 `#recordMutation`. 대상은 참조 하나이거나
     * 구조분해 패턴이다 (ES 명세의 AssignmentPattern) — 패턴 안의 각 참조가 대입된다.
     */
    #recordTargets(target: AnyProp, node: AnyProp, parents: AnyProp[]) {
        for (const ref of assignmentTargets(target)) this.#recordMutation(ref, node, parents);
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
            this.#errors.push(noArgError(this.opts.source, node));
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

    /**
     * css() 호출의 인자들을 해석. 파싱 에러가 나면 `null`.
     *
     * 인자는 컴파일 시점에 다 풀리거나(`local`), 런타임에 class 문자열이어야 한다(`external`).
     * 컴파일 시점에만 존재하는 값(스타일 객체, 다른 css() 호출)이 풀리지 않는 인자 안에 있으면
     * 런타임에 class 문자열이 될 수 없으므로 빌드 에러다.
     */
    #resolveCallArgs(call: AnyProp, scope: AnyProp[]): ArgRecord[] | null {
        const before = this.#errors.length;
        const args: ArgRecord[] = [];
        for (const a of call.arguments) {
            const pieces = this.#resolve(a, scope, new Set());
            if (pieces) {
                args.push({ kind: 'local', pieces });
                continue;
            }
            if (this.#containsCssCall(a)) {
                this.#errors.push(nestedCallError(this.opts.source, a));
                continue;
            }
            const style = this.#styleObjectValueOf(a, scope);
            if (style) this.#errors.push(runtimeStyleObjectError(this.opts.source, style));
            else args.push({ kind: 'external', node: a });
        }
        return this.#errors.length > before ? null : args;
    }

    /**
     * 인자 값이 될 수 있는 식(값 위치 — 괄호, `||`·`??` 양쪽, `&&` 오른쪽, 삼항 분기, 쉼표 식의 끝)
     * 중 스타일 객체(object 리터럴 또는 그 리터럴로 정의된 모듈 상수)가 있으면 그 노드.
     * 함수 인자 등 값 위치가 아닌 곳의 객체는 런타임 값이 아니므로 보지 않는다.
     */
    #styleObjectValueOf(node: AnyProp, scope: AnyProp[]): AnyProp | null {
        switch (node?.type) {
            case 'ObjectExpression':
                return node;
            case 'Identifier': {
                const top = this.#topLevelStatic.get(node.name);
                return top?.init.type === 'ObjectExpression' && !isShadowed(node.name, scope)
                    ? node
                    : null;
            }
            case 'ParenthesizedExpression':
            case 'TSAsExpression':
            case 'TSSatisfiesExpression':
            case 'TSNonNullExpression':
                return this.#styleObjectValueOf(node.expression, scope);
            case 'LogicalExpression':
                return (
                    (node.operator === '&&' ? null : this.#styleObjectValueOf(node.left, scope)) ??
                    this.#styleObjectValueOf(node.right, scope)
                );
            case 'ConditionalExpression':
                return (
                    this.#styleObjectValueOf(node.consequent, scope) ??
                    this.#styleObjectValueOf(node.alternate, scope)
                );
            case 'SequenceExpression':
                return this.#styleObjectValueOf(node.expressions.at(-1), scope);
            default:
                return null;
        }
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
     * 최상위 상수의 런타임 식(분기 조건, dynamic 값)을 그 상수의 선언자 바로 앞
     * `const __vaporCapture_N = (<expr>);` 로 **옮긴다**. 식이 평가되는 곳은 이 한 곳뿐이고,
     * 정의와 모든 사용처는 이름을 읽는다 — 사용처 스코프의 같은 이름에 가려지지 않고, 부작용도
     * 원본처럼 모듈 평가 시 한 번만 일어난다.
     *
     * 평가 순서는 원본과 같아야 한다: `const w = f(), base = { width: w }` 에서 `w` 는 `base`
     * 선언자 직전에야 초기화된다. 그래서 선언자가 둘째 이후면 문장을 그 경계에서 나눈다
     * (`const w = f();` / 캡처 / `const base = …`). `export` 는 각 선언자에 그대로 남고
     * 캡처 이름은 export 되지 않는다.
     *
     * - object 상수: 리터럴은 그대로 남아 다른 곳에서 읽히므로 식 자리를 이름으로 바꾼다.
     * - css() 상수: 호출 전체가 class 선택식으로 치환되므로, 그 치환이 이 조각을 쓴다
     *   (`run` 에서 정의 호출의 인자를 캐시된 조각으로 교체).
     * 같은 위치의 식(shorthand 분해 등)은 한 번만 옮긴다. 중첩 상수에서 온 식은 이미 옮겨져
     * 위치가 그 상수의 정의 안이므로 다시 옮기지 않는다.
     */
    #capture(pieces: Piece[], top: TopLevelConst): Piece[] {
        const inPlace = top.init.type === 'ObjectExpression';
        const shorthandKeys = inPlace ? shorthandValueKeys(top.init) : new Map<number, string>();
        const take = (expr: string, start: number, end: number): string => {
            if (start < top.init.start || end > top.init.end) return expr;
            const key = `${start}:${end}`;
            const existing = this.#captureAt.get(key);
            if (existing) return existing;
            const name = `__vaporCapture_${this.#captureCount++}`;
            this.#captureAt.set(key, name);
            if (top.split) {
                this.#ms!.overwrite(top.split.from, top.split.to, `;\n`);
                this.#ms!.appendRight(top.insertAt, `${top.split.keyword} `);
                top.split = null;
            }
            this.#ms!.appendLeft(top.insertAt, `const ${name} = (${expr});\n`);
            // 정의 자리의 식을 이름으로 바꾼다. shorthand property(`{ width }`)는 key 와 value 가
            // 같은 소스 범위라, 그대로 바꾸면 key 까지 바뀐다 — `width: <name>` 으로 풀어 쓴다.
            if (inPlace) {
                const shorthandKey = shorthandKeys.get(start);
                this.#ms!.overwrite(start, end, shorthandKey ? `${shorthandKey}: ${name}` : name);
            }
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
                          rereadable:
                              p.rereadable || (p.start >= top.init.start && p.end <= top.init.end),
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
                    rereadable: isRereadable(t.testNode),
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
        return {
            kind: 'cond' as const,
            test: this.#src(node),
            start: node.start,
            end: node.end,
            rereadable: isRereadable(node),
        };
    }

    // ── 출력 ───────────────────────────────────────────────────

    /**
     * className 식과 style(slot) 식이 같은 분기 트리를 각자 렌더하고, 조건은 원본처럼 한 번만
     * 평가되게 한다.
     *
     * 두 식은 서로 다른 JSX 속성이라 먼저 평가되는 쪽(속성 순서, `slotsEvaluateFirst`)과 나중 쪽이
     * 있다. 규칙은 하나다.
     * - 먼저 쪽: 부작용이 있을 수 있는 조건(`!rereadable`)은 출력이 같아도 접지 않는다 — 원본도
     *   그 조건을 항상 평가한다. 나중 쪽이 읽는 조건은 임시 변수에 대입한다(`(t = test)`).
     * - 나중 쪽: 변수만 읽으므로 출력이 같으면 접는다.
     * 나중 쪽의 경로는 먼저 쪽 경로에서 분기를 접은 것뿐이므로, 나중 쪽이 변수를 읽는 자리는
     * 먼저 쪽이 이미 대입한 자리다.
     */
    #shareConditions(
        call: CallRecord,
        decision: Decision,
        found: FoundJsx,
    ): {
        classTest: (c: CondPiece) => string;
        classFirst: boolean;
        slots: SlotTree;
        guardTests: (() => string)[];
    } {
        const ms = this.#ms!;
        const scope = memoScopeOf(call.parents, call.node);
        const classFirst = !slotsEvaluateFirst(found);
        const nameOf = (c: CondPiece) => this.#memo.nameFor(c.start, c.end, scope);

        // 나중 쪽이 실제로 읽는 조건을 모은다. 먼저 쪽은 이 조건만 대입한다.
        const read = new Set<string>();
        const readTest = (c: CondPiece) => {
            if (c.rereadable) return c.test;
            read.add(nameOf(c));
            return nameOf(c);
        };
        const firstTest = (c: CondPiece) =>
            !c.rereadable && read.has(nameOf(c)) ? `(${nameOf(c)} = ${c.test})` : c.test;

        let slots: SlotTree;
        let classTest: (c: CondPiece) => string;
        if (classFirst) {
            slots = this.#renderSlots(decision, readTest, false);
            classTest = firstTest;
        } else {
            // class(나중)를 먼저 렌더해 읽는 조건을 모은 뒤 style(먼저)을 렌더한다.
            this.#combine(decision, call.debugId, readTest, false);
            slots = this.#renderSlots(decision, firstTest, true);
            classTest = readTest;
        }

        const guardTests = found.guards.map(({ test }) => {
            if (isRereadable(test)) return () => ms.slice(test.start, test.end);
            const name = this.#memo.nameFor(test.start, test.end, scope);
            if (classFirst) {
                if (this.#memoWrapped.has(test)) return () => name;
                this.#memoWrapped.add(test);
                ms.appendLeft(test.start, `(${name} = `);
                ms.appendRight(test.end, `)`);
                return () => name;
            }
            // style 이 먼저: 원문(다른 css() 치환 반영)을 지금 읽어 대입식으로 쓰고, className 은
            // 변수를 읽는다.
            const text = ms.slice(test.start, test.end);
            if (!this.#memoWrapped.has(test)) {
                this.#memoWrapped.add(test);
                ms.overwrite(test.start, test.end, name);
                return () => `(${name} = ${text})`;
            }
            return () => name;
        });

        return { classTest, classFirst, slots, guardTests };
    }

    /** 분기 트리에 slot(dynamic 값)이 하나라도 있는지. */
    #hasSlots(d: Decision): boolean {
        return d.kind === 'leaf'
            ? d.rules.some((r) => r.kind === 'dynamic')
            : this.#hasSlots(d.whenTrue) || this.#hasSlots(d.whenFalse);
    }

    /**
     * 분기 트리 → slot 트리. leaf 의 slot 은 그 분기 블록의 정규화된 규칙에서 뽑으므로, 뒤 선언에
     * 덮인 dynamic 값은 평가조차 하지 않는다. `first` 면 부작용 있는 조건을 접지 않는다.
     */
    #renderSlots(d: Decision, test: (c: CondPiece) => string, first: boolean): SlotTree {
        return renderDecision<SlotTree>(d, {
            leaf: (rules) => {
                const seen = new Set<string>();
                const entries: string[] = [];
                for (const r of normalizeRules(rules)) {
                    if (r.kind !== 'dynamic' || seen.has(r.slotId)) continue;
                    seen.add(r.slotId);
                    entries.push(this.#slotEntry(r));
                }
                return { kind: 'obj', entries };
            },
            same: sameSlots,
            fork: (c, whenTrue, whenFalse) => {
                const t = test(c);
                return { kind: 'cond', test: () => t, whenTrue, whenFalse };
            },
            keep: (c) => first && !c.rereadable,
        });
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

    /**
     * 분기 트리 → 분기마다 병합 블록을 만들고, 고르는 표현식(문자열 리터럴 또는 삼항)을 반환.
     * `first` 면 부작용 있는 조건을 접지 않는다 (원본처럼 항상 평가).
     */
    #combine(
        d: Decision,
        debugId: string | undefined,
        test: (c: CondPiece) => string,
        first: boolean,
    ): string {
        return renderDecision<string>(d, {
            leaf: (rules) => jsSingleQuoted(this.#blockClass(rules, debugId)),
            same: (a, b) => a === b,
            fork: (c, t, f) => `(${test(c)} ? ${t} : ${f})`,
            keep: (c) => first && !c.rereadable,
        });
    }

    /**
     * `css(...)` 호출 전체를 바꿀 소스 문자열. 반환값은 항상 string 이다 (RSC 안전).
     * - 로컬로 풀리는 인자(object, 같은 파일 최상위 `css()` 상수, 그 조건부 조합)는 한 블록으로
     *   병합한다 — 뒤 인자가 같은 선언 슬롯을 이긴다.
     * - 그 밖의 인자는 `_cx([...])` 로 이어붙인다. 승패는 CSS 로드 순서(import 순서)를 따른다.
     */
    #buildCallReplacement(
        call: CallRecord,
        decision: Decision,
        test: (c: CondPiece) => string,
        first: boolean,
    ): string {
        const firstLocal = call.args.findIndex((a) => a.kind === 'local');
        const localExpr =
            firstLocal === -1 ? null : this.#combine(decision, call.debugId, test, first);

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
        else this.#insertAtTop(line);
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

        this.#insertAtTop(`import { ${specifiers.join(', ')} } from '${RUNTIME_IMPORT_SOURCE}';`);
    }

    /** prologue 바로 뒤(없으면 파일 맨 앞)에 문 하나를 넣는다. prologue 는 첫 문으로 남는다. */
    #insertAtTop(line: string) {
        if (this.#prologueEnd === 0) this.#ms!.appendLeft(0, `${line}\n`);
        else this.#ms!.appendLeft(this.#prologueEnd, `\n${line}`);
    }
}

// ────────────────────────────────────────────────────────────────
// helpers
// ────────────────────────────────────────────────────────────────

/** 모듈 최상위 `const` 선언자 중 css() 병합 대상. */
interface TopLevelConst {
    init: AnyProp;
    /** 캡처 문을 넣을 위치 — 이 선언자 바로 앞(첫 선언자면 문장 앞). */
    insertAt: number;
    /**
     * 둘째 이후 선언자가 처음 캡처될 때 앞 선언자와의 경계(`, `)를 `;\n` + `keyword` 로 바꿔
     * 문장을 나눈다. 한 번 나누면 `null`.
     */
    split: { from: number; to: number; keyword: string } | null;
}

/** object 리터럴(중첩 포함) 안 shorthand property 의 value 시작 위치 → key 이름. */
function shorthandValueKeys(obj: AnyProp): Map<number, string> {
    const out = new Map<number, string>();
    const visit = (o: AnyProp) => {
        for (const p of o.properties ?? []) {
            if (p.type !== 'Property') continue;
            if (p.shorthand && p.value?.type === 'Identifier') out.set(p.value.start, p.value.name);
            if (p.value?.type === 'ObjectExpression') visit(p.value);
        }
    };
    visit(obj);
    return out;
}

/**
 * 파일 머리(hashbang + directive prologue)의 끝. 삽입하는 문은 모두 이 뒤에 온다 — hashbang 은
 * 파일 첫 글자여야 하고, directive 는 첫 문이어야 한다. 둘 다 없으면 0.
 */
function prologueEnd(program: AnyProp): number {
    let end = program.hashbang?.end ?? 0;
    for (const stmt of program.body) {
        if (stmt.type !== 'ExpressionStatement' || typeof stmt.directive !== 'string') break;
        end = stmt.end;
    }
    return end;
}

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

/** 첫 인자를 제자리에서 바꾸는 내장 함수. */
const MUTATING_BUILTINS: Record<string, Set<string>> = {
    Object: new Set(['assign', 'defineProperty', 'defineProperties', 'setPrototypeOf']),
    Reflect: new Set(['set', 'defineProperty', 'deleteProperty', 'setPrototypeOf']),
};

/**
 * `x`, `x.a`, `x[k].b`, `x!.a` 의 루트 식별자. `allowBare` 가 false 면 멤버 접근일 때만
 * (이름 자체에 대한 할당은 제외) 반환한다.
 */
/** 대입 대상 패턴(`a.b`, `[a.b, ...c]`, `{ k: a.b = 1 }`)이 실제로 대입하는 참조들. */
function assignmentTargets(node: AnyProp): AnyProp[] {
    const n = node?.type === 'ParenthesizedExpression' ? node.expression : node;
    switch (n?.type) {
        case 'ArrayPattern':
            return (n.elements ?? []).flatMap((e: AnyProp) => (e ? assignmentTargets(e) : []));
        case 'ObjectPattern':
            return (n.properties ?? []).flatMap((p: AnyProp) =>
                assignmentTargets(p.type === 'RestElement' ? p.argument : p.value),
            );
        case 'AssignmentPattern':
            return assignmentTargets(n.left);
        case 'RestElement':
            return assignmentTargets(n.argument);
        default:
            return n ? [n] : [];
    }
}

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
    return { code: source, map: null, css: null, errors: [] };
}

function errorResult(source: string, errors: BuildError[]): TransformResult {
    return { code: source, map: null, css: null, errors };
}

function noArgError(source: string, node: AnyProp): BuildError {
    return {
        code: 'invalid-input-shape',
        message: 'css() requires at least one argument.',
        loc: locOfNode(source, node),
    };
}

function nestedCallError(source: string, node: AnyProp): BuildError {
    return {
        code: 'invalid-input-shape',
        message:
            'A css() call nested inside another css() call must be fully static ' +
            '(object literals, same-file css() constants, and && / ?: between them).',
        loc: locOfNode(source, node),
    };
}

function runtimeStyleObjectError(source: string, node: AnyProp): BuildError {
    return {
        code: 'invalid-input-shape',
        message:
            'This style object would reach css() at runtime, where only class strings exist. ' +
            'css() compiles a style object only when the whole argument is static ' +
            '(object literals, same-file constants, and && / ?: between them). ' +
            'Pass the class string and the static part as separate arguments, ' +
            'e.g. css(cls, !cls && { ... }) instead of css(cls || { ... }).',
        loc: locOfNode(source, node),
    };
}

function tooManyBranchesError(source: string, node: AnyProp, combos: number): BuildError {
    return {
        code: 'invalid-input-shape',
        message:
            `css() call has ${combos} conditional style combinations (limit ${MAX_COMBINATIONS}). ` +
            'Split it into several css() calls.',
        loc: locOfNode(source, node),
    };
}
