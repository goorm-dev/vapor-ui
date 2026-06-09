// schema-loader.mjs
// vapor 토큰 스키마를 읽는 단일 진입점.
//
// 왜 이 파일이 존재하나: 스키마 출처는 진화한다 — 지금은 스킬 번들(assets/),
// 추후 CDN. 스킬 곳곳에서 스키마 경로를 하드코딩하면 CDN 전환 시 여러 곳을
// 고쳐야 한다. 출처를 이 한 곳으로 모아 두면 전환 시 loadSchema()만 바꾸면 된다.
//
// 버전 핀: 평가 재현성을 위해 어떤 스키마 버전으로 평가했는지가 리포트에 박혀야 한다.
// SCHEMA_VERSION을 단일 진실로 두고, 파일명/CDN 경로/리포트가 모두 이걸 참조한다.
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 단일 진실: 스키마 버전. 새 스키마를 반입하면 이 값과 파일명을 함께 올린다.
export const SCHEMA_VERSION = 'v0.2.3';

// 번들 경로 (현재). CDN 전환 시 이 상수 대신 fetch URL을 쓴다.
const BUNDLED_SCHEMA_PATH = join(
    __dirname,
    '..',
    'assets',
    `vapor-token-schemas-${SCHEMA_VERSION}.json`,
);

// 추후 CDN 전환 시: 이 함수 내부만 fetch로 교체. 호출부(evaluate)는 무변경.
async function loadRaw() {
    return JSON.parse(await readFile(BUNDLED_SCHEMA_PATH, 'utf8'));
}

// 토큰만 반환한다. `_rules`(전역 규칙)는 토큰이 아니므로 떼어내, 순회 대상 오염을
// 막는다(예: counts.tokens가 부풀려지는 것). 전역 규칙은 loadGlobalRules로 따로 꺼낸다.
export async function loadSchema() {
    const raw = await loadRaw();
    const { _rules, ...tokens } = raw;
    return tokens;
}

// 전역 규칙(`_rules`)을 꺼낸다. v0.2.3 신버전에서 disabled opacity·foreground surface
// 규칙이 개별 토큰 avoid가 아니라 여기로 모였다. 없으면 빈 객체.
export async function loadGlobalRules() {
    const raw = await loadRaw();
    return raw._rules ?? {};
}

// 토큰 하나에서 vapor 메타데이터를 안전하게 꺼낸다.
// 스키마 구조가 깊어(`$extensions.vapor`) 호출부마다 옵셔널 체이닝을 반복하지 않도록 모은다.
export function vaporMeta(tokenDef) {
    return tokenDef?.$extensions?.vapor ?? {};
}

// 토큰의 라이트/다크 값 참조(alias)를 꺼낸다 — 예: `{colors.blue.100.light}`.
// 주의: 이 스키마에는 프리미티브 hex가 없다(alias만 존재). 따라서 contrast 계산은
// 이 참조로 하지 않는다. 실제 렌더 hex는 런타임에 MCP `get_variable_defs`가 제공하며,
// evaluate.mjs는 그 hex를 입력으로 받아 대비비를 계산한다.
// 이 함수는 "스키마가 어떤 프리미티브를 의도했는가"를 리포트에 참고로 보일 때만 쓴다.
export function tokenValueRefs(tokenDef) {
    return {
        light: tokenDef?.light?.$value ?? null,
        dark: tokenDef?.dark?.$value ?? null,
    };
}

// ── 결정론 룰셋 도출 (스키마 → evaluate.mjs가 소비할 규칙) ──
//
// 왜 런타임 도출인가: 예전엔 build-ruleset.mjs가 스키마를 가공해 vapor-ruleset.json
// 산물을 만들고, 그걸 git에 커밋해 두었다. 산물을 따로 두면 스키마를 고친 뒤 재생성을
// 깜빡할 때 평가가 stale한 규칙으로 조용히 돌아간다. 그래서 산물을 없애고, evaluate가
// 시작할 때 스키마에서 그 자리에서 도출한다.
//
// 결정론 임계값(disabled opacity·contrast 비율·foreground surface)은 더 이상 스키마
// 자연어/메타에서 파싱하지 않는다. 가짓수가 작고 거의 안 바뀌므로 evaluate 코드 상수로
// 옮겼다. 여기서 스키마에서 읽는 건 do-not-use(status 열거값)·tokenKeys(키 집합)·
// _rules 키 목록(unknownGlobalRules 안전망)뿐 — 모두 파싱이 아닌 키/열거값이다.
export function deriveRuleset(schema, globalRules) {
    const doNotUse = [];
    for (const [tokenKey, def] of Object.entries(schema)) {
        if (vaporMeta(def).status === 'do-not-use') doNotUse.push(tokenKey);
    }

    // 미래 결정론 조건 감지. 지금 결정론으로 코드에 박힌 _rules 키는 foreground·disabled뿐.
    // 그 밖의 키가 등장하면 "결정론으로 다뤄야 할 새 규칙이 스키마에 들어왔는데 evaluate가
    // 모른다"는 신호다 — 값은 파싱하지 않고 키 목록만 보고 경고한다.
    const KNOWN_GLOBAL_RULES = new Set(['foreground', 'disabled']);
    const unknownGlobalRules = Object.keys(globalRules).filter((k) => !KNOWN_GLOBAL_RULES.has(k));

    return {
        schemaVersion: SCHEMA_VERSION,
        doNotUse,
        tokenKeys: Object.keys(schema), // evaluate가 "바인딩된 토큰명이 스키마에 있나"(unknown-token) 판정용.
        unknownGlobalRules, // 비어 있어야 정상. 차 있으면 evaluate가 경고한다.
    };
}
