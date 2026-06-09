// evaluate.mjs
// 2단: 토큰 적법성 — 결정론 검사. LLM 없음.
//
// 왜 스크립트인가: do-not-use 대조·WCAG 대비비 계산·opacity 검사는 입력이 같으면
// 답이 같아야 하는 결정론이다. 이걸 에이전트 지침으로 두면 매 실행마다 LLM이 같은
// 계산을 재현하게 되어, 결정론이어야 할 층이 비결정적이 된다. 그래서 코드로 고정한다.
//
// 입력: 정규화된 요소 배열(JSON). 에이전트가 MCP(get_design_context + get_variable_defs)에서
//       추출해 이 형식으로 정규화한 뒤 stdin이나 파일로 넘긴다. 형식은 SKILL.md에 명시.
//
//   Element {
//     nodeId:   string            // Figma 노드 id (리포트 딥링크용)
//     name:     string            // 레이어/노드 이름 (리포트 표시용)
//     property: 'fill'|'stroke'|'text'  // 토큰이 바인딩된 속성
//     token:    string | null     // 바인딩된 vapor 토큰 키. null이면 raw색(미바인딩)
//     hex:      string | null     // get_variable_defs가 푼 실제 렌더 hex (#rrggbb)
//     opacity:  number | null     // 0~1. disabled-opacity 검사용
//     backgroundHex: string | null// 이 요소가 전경(text/icon)일 때, 깔린 배경 hex (contrast용)
//     nearestToken:  string | null// token=null일 때 캡처 역매핑이 찾은 가장 가까운 토큰
//     tokenStatus: 'ok'|'raw'|'unknown' | undefined
//        // 'ok'=정식 토큰, 'raw'=변수 미바인딩(token-not-used high),
//        // 'unknown'=바인딩됐으나 스키마 키 불일치/오타(unknown-token info).
//        // 미지정이면 token 유무 + ruleset.tokenKeys로 판정(기존 동작 호환).
//   }
//
// 출력: { violations:[...], conformant:[...], summary:{...} }
//   결정론 위반만 낸다. 의미(when/avoid-semantic) 판정은 3단 LLM의 몫이라 여기서 안 한다.
//
// 사용:
//   node scripts/evaluate.mjs < elements.json
//   또는 import { evaluate } from './evaluate.mjs' 로 테스트에서 직접 호출.
import { fileURLToPath } from 'node:url';

import { deriveRuleset, loadGlobalRules, loadSchema } from './schema-loader.mjs';

// ── WCAG 2.x 상대 휘도 & 대비비 ──
// 결정론 검사의 핵심. 공식은 WCAG 정의 그대로.
export function relativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const lin = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(hexA, hexB) {
    const la = relativeLuminance(hexA);
    const lb = relativeLuminance(hexB);
    const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
}

export function hexToRgb(hex) {
    let h = String(hex).trim().replace(/^#/, '');
    if (h.length === 3)
        h = h
            .split('')
            .map((c) => c + c)
            .join('');
    if (!/^[0-9a-fA-F]{6}$/.test(h)) {
        throw new Error(`잘못된 hex: ${hex}`);
    }
    return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
    };
}

// 엄격 순백 판정 — 정확히 #ffffff(또는 단축 #fff), 그리고 "투명"만 순백으로 본다.
// near-white(#fefefe 등)는 비순백. 규칙이 "순백 또는 투명"을 한데 묶으므로 투명도 여기 포함.
export function isPureWhite(backgroundHex) {
    const v = String(backgroundHex).trim().toLowerCase();
    if (v === 'transparent') return true;
    const h = v.replace(/^#/, '');
    return h === 'ffffff' || h === 'fff';
}

// ── 결정론 규칙 상수 ──
// 결정론 임계값은 스키마 자연어에서 파싱하지 않고 코드가 진실로 갖는다(가짓수가 작고
// 거의 안 바뀐다). 스키마의 _rules 자연어·토큰별 minimumContrast는 사용자용 설명이다.
const DISABLED_OPACITY_PCT = 32; // _rules.disabled — disabled 상태는 32% opacity
const FG_SURFACE = { 100: 'pure-white-only', 200: 'non-white' }; // _rules.foreground
const RATIO_BY_ROLE = { foreground: 4.5, border: 3 }; // WCAG 최소 대비

// 토큰 키 prefix로 role을 파생해 요구 대비를 정한다. foreground-surface 검사가 이미
// 토큰 키에서 tier를 읽는 것과 같은 방식이다. 매핑에 없는 prefix(예: background)는
// 대비 요구가 없는 것 → null(검사 생략, 의도된 분기. 조용한 통과 아님).
function expectedRatioForToken(token) {
    if (token == null) return null;
    if (token.startsWith('colors.foreground.')) return RATIO_BY_ROLE.foreground;
    if (token.startsWith('colors.border.')) return RATIO_BY_ROLE.border;
    return null;
}

// ── 2단 결정론 평가 ──
// ruleset을 주입받게 해 테스트에서 고정 룰셋을 넣을 수 있다(파일 IO와 로직 분리).
export function evaluate(elements, ruleset) {
    const doNotUse = new Set(ruleset.doNotUse);

    // 바인딩된 토큰명이 스키마에 실제로 있는지 판정할 키 집합. 없으면(기존 픽스처) 판정 건너뜀.
    const tokenKeys = ruleset.tokenKeys ? new Set(ruleset.tokenKeys) : null;

    const violations = [];
    const conformant = [];

    for (const el of elements) {
        // (0a) 변수 바인딩은 정상이나 이름이 스키마 키와 불일치(오타/미등록). raw가 아니다.
        //      tokenStatus 'unknown'이거나, token은 있는데 스키마 키 집합에 없으면 → unknown-token(info).
        const isUnknownToken =
            el.tokenStatus === 'unknown' ||
            (el.token != null && tokenKeys != null && !tokenKeys.has(el.token));
        if (isUnknownToken) {
            violations.push({
                nodeId: el.nodeId,
                name: el.name,
                token: el.token ?? null,
                type: 'unknown-token',
                severity: 'info',
                detail: el.hex
                    ? `스키마 미등록 토큰명 (바인딩됨, hex ${el.hex}) — 오타/미등록 의심`
                    : '스키마 미등록 토큰명 (바인딩됨)',
                suggested: [],
            });
            conformant.push({
                nodeId: el.nodeId,
                name: el.name,
                token: el.token ?? null,
            });
            continue;
        }

        // (0b) token이 진짜 null = 변수 미바인딩(raw색). 폴백이 작동했다는 것 자체가 위반.
        if (el.token == null) {
            violations.push({
                nodeId: el.nodeId,
                name: el.name,
                type: 'token-not-used',
                severity: 'high',
                detail: el.hex
                    ? `raw 색 ${el.hex} 사용 (vapor 토큰 미바인딩)`
                    : 'vapor 토큰 미바인딩',
                suggested: el.nearestToken ? [el.nearestToken] : [],
            });
            continue;
        }

        // (1) do-not-use 토큰 사용
        if (doNotUse.has(el.token)) {
            violations.push({
                nodeId: el.nodeId,
                name: el.name,
                token: el.token,
                type: 'do-not-use',
                severity: 'high',
                detail: `${el.token} 은(는) do-not-use 토큰`,
                suggested: [],
            });
            // do-not-use여도 contrast/opacity는 추가로 볼 수 있으나, 이미 high 위반이라 다음으로.
            continue;
        }

        let conform = true;

        // (2) minimumContrast — role(토큰 키 prefix)로 요구 대비를 정한다. hex/배경hex가
        //     있을 때만 결정론 검사 가능. reqRatio가 null이면 대비 요구 없는 토큰 → 생략.
        const reqRatio = expectedRatioForToken(el.token);
        if (reqRatio != null) {
            if (el.hex && el.backgroundHex) {
                const ratio = contrastRatio(el.hex, el.backgroundHex);
                if (ratio < reqRatio) {
                    conform = false;
                    violations.push({
                        nodeId: el.nodeId,
                        name: el.name,
                        token: el.token,
                        type: 'contrast-fail',
                        severity: 'high',
                        detail: `대비 ${ratio.toFixed(2)}:1 < 요구 ${reqRatio}:1 (배경 ${el.backgroundHex})`,
                        suggested: [],
                    });
                }
            } else {
                // hex/배경이 없어 계산 불가 — 위반이 아니라 "검사 보류". 3단/리포트가 알 수 있게 표시.
                violations.push({
                    nodeId: el.nodeId,
                    name: el.name,
                    token: el.token,
                    type: 'contrast-unchecked',
                    severity: 'info',
                    detail: `대비 요구 ${reqRatio}:1이나 hex/배경 미제공으로 미검사`,
                    suggested: [],
                });
            }
        }

        // (3) foreground surface — FG_SURFACE 상수 규칙. tier 접미사(.100/.200)가
        //     놓일 배경 제약을 검사한다. 엄격 해석 — 순백은 정확히 #ffffff(또는 투명)뿐.
        //     near-white는 비순백으로 본다. 배경 hex를 모르면 contrast와 같은 정직성
        //     원칙으로 "미검사"(info)로 보류한다.
        if (el.token) {
            const m = el.token.match(/\.foreground\..+\.(100|200)$/);
            if (m) {
                const tier = m[1];
                if (el.backgroundHex == null) {
                    violations.push({
                        nodeId: el.nodeId,
                        name: el.name,
                        token: el.token,
                        type: 'foreground-surface-unchecked',
                        severity: 'info',
                        detail: `tier .${tier} 배경 제약이나 배경 hex 미제공으로 미검사`,
                        suggested: [],
                    });
                } else {
                    const white = isPureWhite(el.backgroundHex);
                    const surface = FG_SURFACE[tier];
                    if (surface === 'pure-white-only' && !white) {
                        conform = false;
                        violations.push({
                            nodeId: el.nodeId,
                            name: el.name,
                            token: el.token,
                            type: 'foreground-surface-mismatch',
                            severity: 'high',
                            detail: `.${tier} 전경은 순백(#ffffff)/투명 배경 전용인데 배경 ${el.backgroundHex}`,
                            suggested: [],
                        });
                    } else if (surface === 'non-white' && white) {
                        conform = false;
                        violations.push({
                            nodeId: el.nodeId,
                            name: el.name,
                            token: el.token,
                            type: 'foreground-surface-mismatch',
                            severity: 'high',
                            detail: `.${tier} 전경은 비순백 배경 전용인데 배경이 순백 ${el.backgroundHex}`,
                            suggested: [],
                        });
                    }
                }
            }
        }

        // (4) disabled-opacity — DISABLED_OPACITY_PCT 상수. 모든 토큰에 같은 임계 적용.
        //     단 "이 요소가 disabled인가"는 의미 판정이라 여기서 단정하지 않는다. opacity가
        //     100%(불투명)도 규정치(32%)도 아닌 어정쩡한 값일 때만 info로만 기록한다(보조 신호).
        if (el.opacity != null) {
            const appliedPct = Math.round(el.opacity * 100);
            if (appliedPct !== 100 && appliedPct !== DISABLED_OPACITY_PCT) {
                violations.push({
                    nodeId: el.nodeId,
                    name: el.name,
                    token: el.token,
                    type: 'opacity-mismatch',
                    severity: 'info',
                    detail: `opacity ${appliedPct}% — disabled라면 규정 ${DISABLED_OPACITY_PCT}% 권장`,
                    suggested: [],
                });
            }
        }

        if (conform) {
            conformant.push({ nodeId: el.nodeId, name: el.name, token: el.token });
        }
    }

    // 적합률: 명백 위반(high)만 부적합으로 카운트. info(미검사/opacity)는 분모에서 중립.
    const total = elements.length;
    const conformCount = conformant.length;

    // 집계 검산 가드 — conformCount는 high 위반 dedup(요소 단위)으로도 계산 가능하다.
    // 두 경로가 어긋나면 정규화/루프에 버그가 있다는 신호이므로 거짓 수치를 보고하지 않고 멈춘다.
    const hardViolated = new Set(
        violations.filter((v) => v.severity === 'high').map((v) => v.nodeId),
    );
    if (conformCount !== total - hardViolated.size) {
        throw new Error(
            `집계 불일치: conformant ${conformCount} != total(${total}) - high위반요소(${hardViolated.size})`,
        );
    }

    return {
        violations,
        conformant,
        summary: {
            total,
            conformCount,
            conformanceRate: total ? Number((conformCount / total).toFixed(3)) : null,
            highViolations: violations.filter((v) => v.severity === 'high').length,
            infoFlags: violations.filter((v) => v.severity === 'info').length,
        },
    };
}

// 룰셋은 더 이상 파일에서 읽지 않는다. 스키마(단일 진실)에서 런타임에 도출한다.
// schema-loader가 출처 추상화를 맡으므로, CDN 전환 시에도 여기는 무변경.
async function loadRuleset() {
    const [schema, globalRules] = await Promise.all([loadSchema(), loadGlobalRules()]);
    return deriveRuleset(schema, globalRules);
}

async function readStdin() {
    const chunks = [];
    for await (const c of process.stdin) chunks.push(c);
    return Buffer.concat(chunks).toString('utf8');
}

// CLI 진입 (import 시엔 실행 안 함)
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
    const [ruleset, input] = await Promise.all([loadRuleset(), readStdin()]);
    // 스키마에 evaluate가 모르는 결정론 후보(_rules 키)가 들어왔다면 알린다.
    // 조용히 넘기면 그 규칙이 결정론에서 빠지거나 LLM으로 새므로 stderr로 경고만 남긴다.
    if (ruleset.unknownGlobalRules?.length) {
        process.stderr.write(
            `⚠️  스키마에 evaluate가 모르는 _rules 키: ${ruleset.unknownGlobalRules.join(', ')} — 결정론 처리 검토 필요\n`,
        );
    }
    const elements = JSON.parse(input);
    const result = evaluate(elements, ruleset);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}
