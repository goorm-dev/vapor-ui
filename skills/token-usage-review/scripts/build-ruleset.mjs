// build-ruleset.mjs
// vapor 토큰 스키마 → vapor-ruleset.json (2단 결정론 검사가 소비할 규칙)
//
// 왜 룰셋을 스킬이 생성하나: avoid 조건이 "정적 분석 가능한가(결정론)"인지
// "요소의 역할/상태 판정이 필요한가(의미)"인지를 가르는 라벨링은 토큰 정의의 일부가
// 아니라 평가 시스템의 관심사다. 토큰 발행자는 "언제 피하라"만 적고, 그게 기계로
// 판정 가능한지는 우리가 정한다. 그래서 룰셋 생성·소유를 스킬이 갖는다.
//
// 실행: node scripts/build-ruleset.mjs  → assets/vapor-ruleset.json 갱신
//       새 스키마를 반입한 뒤 다시 돌리면 룰셋이 갱신된다.
//
// 핵심 산출:
//   - doNotUse:   status === 'do-not-use' 토큰 키 목록 (결정론, 자동)
//   - contrast:   minimumContrast 요구가 있는 토큰별 요구치 (런타임 hex로 검사)
//   - avoidRules: avoid 한 줄당 {token, condition, classification, remedy}
//                 classification ∈ deterministic | semantic | UNCLASSIFIED
//
// UNCLASSIFIED: 아래 분류 규칙 어디에도 안 걸린 새 좌변. 사람이 보고
// DETERMINISTIC_CONDITIONS / SEMANTIC_HINTS에 추가하도록 리포트한다.
// 조용히 한쪽으로 떨어뜨리면 결정론이어야 할 게 LLM으로 새거나 그 반대가 되므로,
// 모르는 건 모른다고 표시하는 게 안전하다.

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  loadSchema,
  loadGlobalRules,
  vaporMeta,
  SCHEMA_VERSION,
} from "./schema-loader.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "assets", "vapor-ruleset.json");

// ── avoid 좌변(조건) 분류 규칙 ──
// 데이터 근거: v0.2.3의 avoid 좌변 31종을 전수 확인한 결과, 결정론으로 판정 가능한
// 조건은 사실상 "disabled states"(노드 opacity로 확인) 하나였고 나머지는 모두
// 요소의 역할/상태를 묻는 의미 조건이었다. 규칙은 그 사실을 반영하되, 새 스키마에서
// 다른 결정론 조건이 등장할 수 있으니 패턴으로 매칭한다.

// 결정론: 노드 속성(opacity 등)만으로 좌변 충족 여부를 판정할 수 있는 조건.
const DETERMINISTIC_CONDITIONS = [
  {
    // "disabled states → apply 32% opacity to this token"
    // → 토큰을 그대로 쓰되 opacity 32%를 적용했는지 노드 속성으로 검사 가능.
    match: /disabled states/i,
    rule: "disabled-opacity",
    // remedy(우변)에서 퍼센트를 뽑아 검사 임계로 쓴다.
  },
];

// 의미: 요소의 역할/상태/맥락 판정이 필요해 3단 LLM으로 넘기는 조건의 신호 어휘.
// (분류를 "결정론이 아니면 전부 의미"로 두지 않는 이유: 정말 새로운 종류의 조건이
//  들어오면 UNCLASSIFIED로 떠서 사람이 보게 하려는 것. 의미 조건임을 적극적으로
//  인정할 신호가 있을 때만 semantic으로 찍는다.)
const SEMANTIC_HINTS = [
  /background/i,
  /foreground/i,
  /border/i,
  /text/i,
  /element/i,
  /elements/i,
  /surface/i,
  /surfaces/i,
  /action/i,
  /actions/i,
  /state/i,
  /emphasis/i,
  /contrast/i,
  /component/i,
  /components/i,
  /page/i,
  /screen/i,
  /label/i,
  /outline/i,
  /variant/i,
  /interactive/i,
  /standalone/i,
  /supplementary/i,
  /title/i,
  /heading/i,
  /hierarchy/i,
  /prominence/i,
  /primary/i,
  /destructive/i,
  /irreversible/i,
  /cautionary/i,
  /focused/i,
  /selected/i,
  /active/i,
  /visibility/i,
  /readability/i,
  /canvas/i,
];

function classifyCondition(condition) {
  for (const d of DETERMINISTIC_CONDITIONS) {
    if (d.match.test(condition)) {
      return { classification: "deterministic", rule: d.rule };
    }
  }
  if (SEMANTIC_HINTS.some((re) => re.test(condition))) {
    return { classification: "semantic", rule: null };
  }
  return { classification: "UNCLASSIFIED", rule: null };
}

// avoid 우변(remedy) 해석: 대체 토큰 경로인지, 자유 지시문인지.
// 대체 토큰이면 그대로 "제안 토큰"으로 쓸 수 있다(리포트 제안의 출처).
function parseRemedy(remedy) {
  // 우변에 들어 있는 colors.* 토큰 경로를 모두 추출.
  const tokenPaths = [...remedy.matchAll(/colors\.[a-z0-9.]+/gi)].map(
    (m) => m[0],
  );
  // "apply N% opacity" 형태의 수치 처방 추출 (disabled-opacity 검사에 사용).
  const opacityMatch = remedy.match(/apply\s+(\d+)%\s+opacity/i);
  return {
    suggestedTokens: tokenPaths,
    opacityPercent: opacityMatch ? Number(opacityMatch[1]) : null,
    text: remedy,
  };
}

async function main() {
  const schema = await loadSchema();
  const globalRules = await loadGlobalRules();

  // disabled opacity: 신버전에선 개별 토큰 avoid가 아니라 _rules.disabled에 전역으로 있다.
  // "apply N% opacity"에서 N을 뽑아 검사 임계로 쓴다. 없으면 null.
  const disabledOpacityPercent = (() => {
    const m = String(globalRules.disabled?.rule ?? "").match(
      /apply\s+(\d+)%\s+opacity/i,
    );
    return m ? Number(m[1]) : null;
  })();

  // foreground surface: tier 접미사(.100/.200)가 어떤 배경 위에 놓이는지 규정.
  // 엄격 해석 — .100은 순백(#ffffff)/투명 전용, .200은 비순백 전용.
  const foregroundSurface = globalRules.foreground
    ? { 100: "pure-white-only", 200: "non-white" }
    : null;

  const doNotUse = [];
  const contrast = {};
  const avoidRules = [];
  const unclassified = [];

  for (const [tokenKey, def] of Object.entries(schema)) {
    const meta = vaporMeta(def);

    // ── do-not-use (결정론, 자동) ──
    if (meta.status === "do-not-use") {
      doNotUse.push(tokenKey);
    }

    // ── minimumContrast (요구치만 기록, 실제 검사는 런타임 hex로) ──
    const minC = meta.accessibility?.minimumContrast;
    if (minC) {
      contrast[tokenKey] = {
        minimumContrast: minC, // 예: "4.5:1"
        ratio: parseRatio(minC), // 예: 4.5
        role: meta.accessibility?.role ?? null,
      };
    }

    // ── avoid (좌변 분류 + 우변 해석) ──
    for (const line of meta.avoid ?? []) {
      const arrowIdx = line.indexOf("→");
      if (arrowIdx === -1) {
        // v0.2.3엔 없지만, 미래 스키마가 화살표 없는 avoid를 쓰면 잡아서 플래그.
        unclassified.push({ token: tokenKey, line, reason: "no-arrow" });
        continue;
      }
      const condition = line.slice(0, arrowIdx).trim();
      const remedy = line.slice(arrowIdx + 1).trim();
      const { classification, rule } = classifyCondition(condition);
      const parsedRemedy = parseRemedy(remedy);

      const entry = {
        token: tokenKey,
        condition,
        classification,
        rule, // deterministic일 때만 채워짐 (예: 'disabled-opacity')
        remedy: parsedRemedy,
      };
      avoidRules.push(entry);
      if (classification === "UNCLASSIFIED") {
        unclassified.push({
          token: tokenKey,
          line,
          reason: "no-matching-rule",
        });
      }
    }
  }

  const ruleset = {
    schemaVersion: SCHEMA_VERSION,
    // 생성 시각은 결정론 빌드를 위해 박지 않는다(재실행 시 diff 노이즈 방지).
    counts: {
      tokens: Object.keys(schema).length,
      doNotUse: doNotUse.length,
      contrast: Object.keys(contrast).length,
      avoidRules: avoidRules.length,
      deterministicAvoid: avoidRules.filter(
        (r) => r.classification === "deterministic",
      ).length,
      semanticAvoid: avoidRules.filter((r) => r.classification === "semantic")
        .length,
      unclassified: unclassified.length,
    },
    globalRules: { disabledOpacityPercent, foregroundSurface },
    doNotUse,
    contrast,
    avoidRules,
    unclassified, // 비어 있어야 이상적. 차 있으면 사람이 분류 규칙을 보강할 신호.
  };

  await writeFile(OUT_PATH, JSON.stringify(ruleset, null, 2) + "\n");

  // 콘솔 리포트 — 미분류가 있으면 눈에 띄게.
  console.log(`룰셋 생성 완료 (schema ${SCHEMA_VERSION}) → ${OUT_PATH}`);
  console.log(JSON.stringify(ruleset.counts, null, 2));
  if (unclassified.length) {
    console.log("\n⚠️  미분류 avoid (분류 규칙 보강 필요):");
    for (const u of unclassified)
      console.log(`  [${u.token}] ${u.line}  (${u.reason})`);
  } else {
    console.log("\n✅ 미분류 avoid 없음 — 모든 avoid가 결정론/의미로 분류됨.");
  }
}

// "4.5:1" → 4.5
function parseRatio(str) {
  const m = String(str).match(/^([\d.]+)\s*:\s*1$/);
  return m ? Number(m[1]) : null;
}

main().catch((e) => {
  console.error("build-ruleset 실패:", e);
  process.exit(1);
});
