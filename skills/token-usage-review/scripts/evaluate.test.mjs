// evaluate.test.mjs
// 2단 결정론 코어의 단위테스트. 외부 의존성 없이 Node 내장 test runner 사용.
// 실행: node --test scripts/
//
// 검증 대상은 "결정론이어야 하는 것이 정말 결정론으로 맞는가"다:
//   - do-not-use 누락 없이 검출
//   - 미바인딩(raw색) = 토큰 미사용 위반 검출
//   - unknown-token(오타/미등록) = info 분류
//   - disabled opacity info 플래그
//   - 그룹(count/nodeIds) 가중 집계
// LLM 의미 판정은 여기서 테스트하지 않는다(정답이 모호하므로 vibe 검증으로).
import assert from "node:assert/strict";
import { test } from "node:test";

import { buildRubric, evaluate } from "./evaluate.mjs";

// ── evaluate(): 고정 룰셋으로 결정론 검사 ──
// 결정론 임계값(opacity)은 evaluate 코드 상수가 가지므로 룰셋에는 없다.
// 룰셋은 do-not-use·tokenKeys만 싣는다.
const FIXTURE_RULESET = {
  schemaVersion: "test",
  doNotUse: ["colors.background.secondary.100"],
};

test("do-not-use 토큰 사용을 high 위반으로 검출", () => {
  const r = evaluate(
    [
      {
        nodeId: "1",
        name: "박스",
        property: "fill",
        token: "colors.background.secondary.100",
        hex: "#eee",
        opacity: 1,
        nearestToken: null,
      },
    ],
    FIXTURE_RULESET,
  );
  const v = r.violations.find((x) => x.type === "do-not-use");
  assert.ok(v, "do-not-use 위반이 있어야 함");
  assert.equal(v.severity, "high");
});

test("미바인딩(raw색)을 token-not-used 위반으로 검출 + 가장 가까운 토큰 제안", () => {
  const r = evaluate(
    [
      {
        nodeId: "2",
        name: "버튼",
        property: "fill",
        token: null,
        hex: "#3b82f6",
        opacity: 1,
        nearestToken: "colors.background.primary.200",
      },
    ],
    FIXTURE_RULESET,
  );
  const v = r.violations.find((x) => x.type === "token-not-used");
  assert.ok(v);
  assert.equal(v.severity, "high");
  assert.deepEqual(v.suggested, ["colors.background.primary.200"]);
});

test("정상 토큰은 위반 없음 + 적합 카운트", () => {
  const r = evaluate(
    [
      {
        nodeId: "4",
        name: "텍스트",
        property: "text",
        token: "colors.foreground.primary.100",
        hex: "#0b3d91",
        opacity: 1,
        nearestToken: null,
      },
    ],
    FIXTURE_RULESET,
  );
  assert.equal(r.violations.filter((v) => v.severity === "high").length, 0);
  assert.equal(r.summary.conformCount, 1);
});

test("적합률: high 위반만 분모에서 부적합으로 카운트", () => {
  const r = evaluate(
    [
      {
        nodeId: "a",
        name: "ok",
        property: "fill",
        token: "colors.background.primary.100",
        hex: "#fff",
        opacity: 1,
        nearestToken: null,
      },
      {
        nodeId: "b",
        name: "bad",
        property: "fill",
        token: "colors.background.secondary.100",
        hex: "#eee",
        opacity: 1,
        nearestToken: null,
      },
    ],
    FIXTURE_RULESET,
  );
  // 2개 중 1개 high 위반 → 적합 1/2
  assert.equal(r.summary.total, 2);
  assert.equal(r.summary.conformCount, 1);
  assert.equal(r.summary.conformanceRate, 0.5);
});

// ── disabled-opacity 전역 규칙 ──
test("opacity가 100%도 32%도 아닌 어정쩡한 값 → info 플래그(전역 규칙)", () => {
  const r = evaluate(
    [
      {
        nodeId: "op1",
        name: "박스",
        property: "fill",
        token: "colors.background.primary.200",
        hex: "#3b82f6",
        opacity: 0.5,
        nearestToken: null,
      },
    ],
    FIXTURE_RULESET,
  );
  const v = r.violations.find((x) => x.type === "opacity-mismatch");
  assert.ok(v, "opacity-mismatch info가 있어야 함");
  assert.equal(v.severity, "info");
  // info라 적합에는 영향 없음
  assert.equal(r.summary.highViolations, 0);
  assert.equal(r.summary.conformCount, 1);
});

// ── conformCount 검산 가드 ──
test("정상 입력에선 conformCount 검산 가드가 throw하지 않는다", () => {
  assert.doesNotThrow(() =>
    evaluate(
      [
        {
          nodeId: "g1",
          name: "ok",
          property: "fill",
          token: "colors.background.primary.100",
          hex: "#fff",
          opacity: 1,
          nearestToken: null,
        },
        {
          nodeId: "g2",
          name: "bad",
          property: "fill",
          token: "colors.background.secondary.100",
          hex: "#eee",
          opacity: 1,
          nearestToken: null,
        },
      ],
      FIXTURE_RULESET,
    ),
  );
});

test("동일 nodeId의 서로 다른 property가 각각 high여도 집계 가드는 정상 동작", () => {
  // 가드는 high 위반을 nodeId가 아니라 "요소(속성) 단위"로 센다. 같은 nodeId에 high 위반이
  // 둘이어도 total - high위반요소가 conformCount와 일치해야 하며 throw하지 않아야 한다.
  assert.doesNotThrow(() =>
    evaluate(
      [
        {
          nodeId: "same",
          name: "텍스트",
          property: "text",
          token: null, // token-not-used high
          hex: "#333333",
          opacity: 1,
          nearestToken: null,
        },
        {
          nodeId: "same",
          name: "테두리",
          property: "stroke",
          token: "colors.background.secondary.100", // do-not-use high
          hex: "#eeeeee",
          opacity: 1,
          nearestToken: null,
        },
      ],
      FIXTURE_RULESET_WITH_KEYS,
    ),
  );
});

// ── unknown-token: 변수 바인딩은 정상이나 스키마 키 불일치(오타/미등록) ──
// 진짜 raw(token-not-used, high)와 다르게 info(적합률 중립)로 분류한다.
const FIXTURE_RULESET_WITH_KEYS = {
  ...FIXTURE_RULESET,
  tokenKeys: [
    "colors.background.primary.100",
    "colors.background.secondary.100",
  ],
};

test("tokenStatus 'unknown' → unknown-token(info), 적합률 중립", () => {
  const r = evaluate(
    [
      {
        nodeId: "u1",
        name: "오타 테두리",
        property: "stroke",
        token: null,
        tokenStatus: "unknown",
        hex: "#2a6ff3",
        opacity: 1,
        nearestToken: null,
      },
    ],
    FIXTURE_RULESET,
  );
  const v = r.violations.find((x) => x.type === "unknown-token");
  assert.ok(v, "unknown-token 위반이 있어야 함");
  assert.equal(v.severity, "info");
  assert.equal(r.summary.highViolations, 0);
  assert.equal(r.summary.conformCount, 1); // info라 적합 카운트에 포함(중립)
});

test("token은 있으나 tokenKeys에 없으면 → unknown-token(info)", () => {
  const r = evaluate(
    [
      {
        nodeId: "u2",
        name: "오타 토큰",
        property: "stroke",
        token: "colors.backgroud.primary", // 오타 — 스키마에 없음
        hex: "#2a6ff3",
        opacity: 1,
        nearestToken: null,
      },
    ],
    FIXTURE_RULESET_WITH_KEYS,
  );
  const v = r.violations.find((x) => x.type === "unknown-token");
  assert.ok(v, "스키마 부재 token은 unknown-token이어야 함");
  assert.equal(v.severity, "info");
  assert.equal(r.summary.highViolations, 0);
  assert.equal(r.summary.conformCount, 1);
});

test("진짜 미바인딩(token null, tokenStatus 없음)은 여전히 token-not-used(high)", () => {
  const r = evaluate(
    [
      {
        nodeId: "u3",
        name: "raw 색",
        property: "fill",
        token: null,
        hex: "#3b82f6",
        opacity: 1,
        nearestToken: null,
      },
    ],
    FIXTURE_RULESET_WITH_KEYS,
  );
  const v = r.violations.find((x) => x.type === "token-not-used");
  assert.ok(v, "미바인딩은 token-not-used여야 함");
  assert.equal(v.severity, "high");
  assert.equal(
    r.violations.some((x) => x.type === "unknown-token"),
    false,
  );
});

test("tokenKeys 있어도 정식 token은 unknown 아님 (do-not-use 등 기존 검사로 진행)", () => {
  const r = evaluate(
    [
      {
        nodeId: "u4",
        name: "do-not-use 토큰",
        property: "fill",
        token: "colors.background.secondary.100", // tokenKeys에 있음 + do-not-use
        hex: "#eee",
        opacity: 1,
        nearestToken: null,
      },
    ],
    FIXTURE_RULESET_WITH_KEYS,
  );
  assert.equal(
    r.violations.some((x) => x.type === "unknown-token"),
    false,
  );
  const v = r.violations.find((x) => x.type === "do-not-use");
  assert.ok(v, "정식 토큰은 unknown을 건너뛰고 do-not-use 검사로 가야 함");
  assert.equal(v.severity, "high");
});

// ── 그룹 요소(count/nodeIds) 가중 집계 — extract.figma.js 그룹핑 출력 호환 ──
test("그룹 요소는 count 가중치로 집계되고 nodeIds가 보존된다", () => {
  const r = evaluate(
    [
      {
        nodeIds: ["g1", "g2", "g3"],
        count: 3,
        name: "배지 배경",
        property: "fill",
        token: "colors.background.primary.100",
        hex: "#c6e6ff",
        opacity: 1,
        nearestToken: null,
        tokenStatus: "ok",
      },
      {
        nodeIds: ["r1", "r2"],
        count: 2,
        name: "raw 박스",
        property: "fill",
        token: null,
        hex: "#123456",
        opacity: 1,
        nearestToken: null,
        tokenStatus: "raw",
      },
    ],
    FIXTURE_RULESET,
  );
  assert.equal(r.summary.total, 5);
  assert.equal(r.summary.conformCount, 3);
  assert.equal(r.summary.conformanceRate, 0.6);
  const v = r.violations.find((x) => x.type === "token-not-used");
  assert.equal(v.nodeId, "r1"); // 대표 딥링크는 첫 노드
  assert.deepEqual(v.nodeIds, ["r1", "r2"]);
  assert.equal(v.count, 2);
});

test("count 미지정 기존 입력은 가중치 1로 동작(하위 호환)", () => {
  const r = evaluate(
    [
      {
        nodeId: "a",
        name: "x",
        property: "fill",
        token: "colors.background.primary.100",
        hex: "#fff",
        opacity: 1,
        nearestToken: null,
        tokenStatus: "ok",
      },
    ],
    FIXTURE_RULESET,
  );
  assert.equal(r.summary.total, 1);
  assert.equal(r.summary.conformCount, 1);
});

test("그룹 입력에서도 집계 검산 가드가 throw 안 함 (혼합 high/conform)", () => {
  assert.doesNotThrow(() =>
    evaluate(
      [
        {
          nodeIds: ["d1", "d2"],
          count: 2,
          name: "dnu",
          property: "fill",
          token: "colors.background.secondary.100", // do-not-use
          hex: "#eee",
          opacity: 1,
          nearestToken: null,
          tokenStatus: "ok",
        },
        {
          nodeId: "ok1",
          name: "ok",
          property: "fill",
          token: "colors.background.primary.100",
          hex: "#c6e6ff",
          opacity: 1,
          nearestToken: null,
          tokenStatus: "ok",
        },
      ],
      FIXTURE_RULESET,
    ),
  );
});

// ── buildRubric: 3단 LLM용 의미 루브릭 서브셋 ──
test("buildRubric은 입력에 등장한 스키마 토큰만 추린다", () => {
  const schema = {
    "colors.background.primary.100": {
      $extensions: { vapor: { intent: "i", when: ["w"], avoid: ["a"] } },
    },
    "colors.background.canvas.100": {
      $extensions: { vapor: { intent: "unused" } },
    },
  };
  const rubric = buildRubric(
    [
      { token: "colors.background.primary.100" },
      { token: "colors.not.in.schema" }, // 스키마 미등록 → 제외(unknown-token이 따로 알림)
      { token: null }, // raw → 루브릭 불필요
    ],
    schema,
  );
  assert.deepEqual(Object.keys(rubric), ["colors.background.primary.100"]);
  assert.deepEqual(rubric["colors.background.primary.100"], {
    intent: "i",
    when: ["w"],
    avoid: ["a"],
  });
});
