// evaluate.mjs
// 2단: 토큰 적법성 — 결정론 검사. LLM 없음.
//
// 왜 스크립트인가: do-not-use 대조·opacity 검사는 입력이 같으면 답이 같아야 하는
// 결정론이다. 이걸 에이전트 지침으로 두면 매 실행마다 LLM이 같은 계산을 재현하게 되어,
// 결정론이어야 할 층이 비결정적이 된다. 그래서 코드로 고정한다.
//
// 입력: 요소 배열(JSON) 또는 extract.figma.js 반환 객체(`{ colors: Element[], ... }`).
//       에이전트가 추출 결과를 파일로 저장해 인자로 넘기거나 stdin으로 넘긴다.
//
//   Element {
//     nodeId:   string            // Figma 노드 id (리포트 딥링크용)
//     nodeIds:  string[] | undefined // 그룹핑된 요소(extract.figma.js)의 노드 id 목록.
//                                 // nodeId 없이 nodeIds만 와도 된다(첫 id를 대표로 쓴다).
//     count:    number | undefined// 그룹이 대표하는 요소 수(가중치). 미지정 시 1.
//     name:     string            // 레이어/노드 이름 (리포트 표시용)
//     property: 'fill'|'stroke'|'text'  // 토큰이 바인딩된 속성
//     token:    string | null     // 바인딩된 vapor 토큰 키. null이면 raw색(미바인딩)
//     hex:      string | null     // 추출이 alias 체인을 풀어 얻은 실제 렌더 hex (#rrggbb)
//     opacity:  number | null     // 0~1. disabled-opacity 검사용
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
//   node scripts/evaluate.mjs extract.json     # 파일 인자(권장 — 추출 결과 객체 그대로)
//   node scripts/evaluate.mjs < elements.json  # stdin
//   또는 import { evaluate } from './evaluate.mjs' 로 테스트에서 직접 호출.
// 출력에는 입력에 실제 등장한 토큰의 의미 루브릭 서브셋(rubric)이 포함된다 —
// 3단 LLM이 스키마 전체(40KB)를 읽지 않고 이것만 보면 된다.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  deriveRuleset,
  loadGlobalRules,
  loadSchema,
  vaporMeta,
} from "./schema-loader.mjs";

// ── 결정론 규칙 상수 ──
// 결정론 임계값은 스키마 자연어에서 파싱하지 않고 코드가 진실로 갖는다(가짓수가 작고
// 거의 안 바뀐다). 스키마의 _rules 자연어는 사용자용 설명이다.
const DISABLED_OPACITY_PCT = 32; // _rules.disabled — disabled 상태는 32% opacity

// ── 2단 결정론 평가 ──
// ruleset을 주입받게 해 테스트에서 고정 룰셋을 넣을 수 있다(파일 IO와 로직 분리).
export function evaluate(elements, ruleset) {
  const doNotUse = new Set(ruleset.doNotUse);

  // 바인딩된 토큰명이 스키마에 실제로 있는지 판정할 키 집합. 없으면(기존 픽스처) 판정 건너뜀.
  const tokenKeys = ruleset.tokenKeys ? new Set(ruleset.tokenKeys) : null;

  const violations = [];
  const conformant = [];
  // 가중 집계 — 그룹 요소(count>1)는 그 수만큼 센다. 같은 nodeId라도 요소(속성)마다
  // 독립으로 센다(nodeId dedup 금지). high 위반은 전부 아래 continue 분기에서만 나온다.
  let totalWeight = 0;
  let conformWeight = 0;
  let hardViolatedWeight = 0;

  for (const el of elements) {
    const weight = el.count ?? 1;
    totalWeight += weight;
    // 리포트 참조: 그룹이면 첫 nodeId를 대표 딥링크로, 전체 목록은 nodeIds에 보존.
    const ref = {
      nodeId: el.nodeId ?? el.nodeIds?.[0] ?? null,
      ...(el.nodeIds ? { nodeIds: el.nodeIds, count: weight } : {}),
    };
    // (0a) 변수 바인딩은 정상이나 이름이 스키마 키와 불일치(오타/미등록). raw가 아니다.
    //      tokenStatus 'unknown'이거나, token은 있는데 스키마 키 집합에 없으면 → unknown-token(info).
    const isUnknownToken =
      el.tokenStatus === "unknown" ||
      (el.token != null && tokenKeys != null && !tokenKeys.has(el.token));
    if (isUnknownToken) {
      violations.push({
        ...ref,
        name: el.name,
        token: el.token ?? null,
        type: "unknown-token",
        severity: "info",
        detail: el.hex
          ? `스키마 미등록 토큰명 (바인딩됨, hex ${el.hex}) — 오타/미등록 의심`
          : "스키마 미등록 토큰명 (바인딩됨)",
        suggested: [],
      });
      conformant.push({
        ...ref,
        name: el.name,
        token: el.token ?? null,
      });
      conformWeight += weight;
      continue;
    }

    // (0b) token이 진짜 null = 변수 미바인딩(raw색). 폴백이 작동했다는 것 자체가 위반.
    if (el.token == null) {
      violations.push({
        ...ref,
        name: el.name,
        type: "token-not-used",
        severity: "high",
        detail: el.hex
          ? `raw 색 ${el.hex} 사용 (vapor 토큰 미바인딩)`
          : "vapor 토큰 미바인딩",
        suggested: el.nearestToken ? [el.nearestToken] : [],
      });
      hardViolatedWeight += weight;
      continue;
    }

    // (1) do-not-use 토큰 사용
    if (doNotUse.has(el.token)) {
      violations.push({
        ...ref,
        name: el.name,
        token: el.token,
        type: "do-not-use",
        severity: "high",
        detail: `${el.token} 은(는) do-not-use 토큰`,
        suggested: [],
      });
      hardViolatedWeight += weight;
      continue;
    }

    // (2) disabled-opacity — DISABLED_OPACITY_PCT 상수. 모든 토큰에 같은 임계 적용.
    //     단 "이 요소가 disabled인가"는 의미 판정이라 여기서 단정하지 않는다. opacity가
    //     100%(불투명)도 규정치(32%)도 아닌 어정쩡한 값일 때만 info로만 기록한다(보조 신호).
    if (el.opacity != null) {
      const appliedPct = Math.round(el.opacity * 100);
      if (appliedPct !== 100 && appliedPct !== DISABLED_OPACITY_PCT) {
        violations.push({
          ...ref,
          name: el.name,
          token: el.token,
          type: "opacity-mismatch",
          severity: "info",
          detail: `opacity ${appliedPct}% — disabled라면 규정 ${DISABLED_OPACITY_PCT}% 권장`,
          suggested: [],
        });
      }
    }

    // continue로 빠지지 않고 끝까지 온 요소는 high 위반이 없으므로 항상 적합.
    // info(unknown-token·opacity-mismatch)는 적합률에 중립이라 conformant에 포함된다.
    conformant.push({ ...ref, name: el.name, token: el.token });
    conformWeight += weight;
  }

  // 적합률: 명백 위반(high)만 부적합으로 카운트. info(opacity 등)는 분모에서 중립.
  // 단위는 가중 요소 수 — 그룹(count>1)은 그 수만큼 분모/분자에 들어간다.
  const total = totalWeight;
  const conformCount = conformWeight;

  // 집계 검산 가드 — conformCount는 "high 위반을 가진 요소 가중치 합"으로도 계산 가능하다.
  // 두 경로가 어긋나면 정규화/루프에 버그가 있다는 신호이므로 거짓 수치를 보고하지 않고 멈춘다.
  // 카운트는 요소 단위다 — 같은 nodeId에 여러 속성(fill/stroke/text)이 각각 위반될 수 있으므로
  // nodeId로 dedup하면 안 된다(요소 단위 conformCount와 단위가 어긋나 오탐 throw가 난다).
  if (conformCount !== total - hardViolatedWeight) {
    throw new Error(
      `집계 불일치: conformant ${conformCount} != total(${total}) - high위반요소(${hardViolatedWeight})`,
    );
  }

  return {
    violations,
    conformant,
    summary: {
      total,
      conformCount,
      conformanceRate: total ? Number((conformCount / total).toFixed(3)) : null,
      highViolations: violations.filter((v) => v.severity === "high").length,
      infoFlags: violations.filter((v) => v.severity === "info").length,
    },
  };
}

// 3단 LLM이 쓸 의미 루브릭 서브셋 — 입력에 실제 등장한 토큰의 intent/when/avoid만 추린다.
// 스키마 전체(40KB)를 에이전트가 직접 읽지 않아도 되게 하는 장치. 판정은 하지 않는다(추출만).
export function buildRubric(elements, schema) {
  const rubric = {};
  for (const el of elements) {
    const t = el.token;
    if (!t || rubric[t] || !schema[t]) continue;
    const m = vaporMeta(schema[t]);
    rubric[t] = {
      intent: m.intent ?? null,
      when: m.when ?? [],
      avoid: m.avoid ?? [],
    };
  }
  return rubric;
}

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

// CLI 진입 (import 시엔 실행 안 함)
const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  // 입력: 파일 인자(권장) 또는 stdin. extract.figma.js 반환 객체({colors:[...]})와
  // 순수 Element 배열 둘 다 받는다 — 추출 결과 파일 하나를 두 evaluate가 공유한다.
  const fileArg = process.argv[2];
  const [schema, globalRules, input] = await Promise.all([
    loadSchema(),
    loadGlobalRules(),
    fileArg ? readFile(fileArg, "utf8") : readStdin(),
  ]);
  const ruleset = deriveRuleset(schema, globalRules);
  // 스키마에 evaluate가 모르는 결정론 후보(_rules 키)가 들어왔다면 알린다.
  // 조용히 넘기면 그 규칙이 결정론에서 빠지거나 LLM으로 새므로 stderr로 경고만 남긴다.
  if (ruleset.unknownGlobalRules?.length) {
    process.stderr.write(
      `⚠️  스키마에 evaluate가 모르는 _rules 키: ${ruleset.unknownGlobalRules.join(", ")} — 결정론 처리 검토 필요\n`,
    );
  }
  const parsed = JSON.parse(input);
  const elements = Array.isArray(parsed) ? parsed : (parsed.colors ?? []);
  const result = evaluate(elements, ruleset);
  result.rubric = buildRubric(elements, schema);
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
}
