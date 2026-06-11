// typography-evaluate.test.mjs
// 2단 typography 결정론 코어의 단위테스트. 외부 의존성 없이 Node 내장 test runner 사용.
// 실행: node --test scripts/
//
// 검증 대상: "결정론이어야 하는 것이 정말 결정론으로 맞는가"
//   - raw appliedStatus → typo-raw high 위반
//   - styled-clean / styled-override / var-only / mixed → 위반 없음, conformant 카운트
//   - 적합률 계산 (raw 포함 혼합 배열)
//   - 집계 검산 가드 정상 입력에서 throw 안 함
// LLM 위계 의미 판정은 여기서 테스트하지 않는다(정답이 모호하므로).
import assert from "node:assert/strict";
import { test } from "node:test";

import { buildTypographyRubric, evaluateTypography } from "./typography-evaluate.mjs";

const base = {
  nodeId: "1",
  name: "텍스트",
  characters: "샘플",
  textStyle: null,
  viewport: "pc",
  overriddenFields: [],
  resolved: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    fontName: { family: "Inter", style: "Regular" },
    fontWeight: 400,
  },
};

test("raw → typo-raw high 위반", () => {
  const r = evaluateTypography([{ ...base, appliedStatus: "raw" }]);
  const v = r.violations.find((x) => x.type === "typo-raw");
  assert.ok(v, "typo-raw 위반이 있어야 함");
  assert.equal(v.severity, "high");
  assert.equal(r.summary.highViolations, 1);
  assert.equal(r.summary.conformCount, 0);
});

test("raw detail에 fontName·fontSize 포함", () => {
  const r = evaluateTypography([{ ...base, appliedStatus: "raw" }]);
  const v = r.violations[0];
  assert.ok(v.detail.includes("Inter"), "fontName.family 포함");
  assert.ok(v.detail.includes("16px"), "fontSize 포함");
});

test("raw resolved 없어도 detail throw 안 함", () => {
  assert.doesNotThrow(() =>
    evaluateTypography([
      { ...base, appliedStatus: "raw", resolved: undefined },
    ]),
  );
});

test("styled-clean → 위반 없음, conformant 카운트", () => {
  const r = evaluateTypography([
    { ...base, appliedStatus: "styled-clean", textStyle: "heading3" },
  ]);
  assert.equal(r.violations.length, 0);
  assert.equal(r.summary.conformCount, 1);
  assert.equal(r.summary.highViolations, 0);
});

test("styled-override → 위반 없음, 정상 취급", () => {
  const r = evaluateTypography([
    {
      ...base,
      appliedStatus: "styled-override",
      textStyle: "heading6",
      overriddenFields: ["fontName"],
    },
  ]);
  assert.equal(r.violations.length, 0);
  assert.equal(r.summary.conformCount, 1);
});

test("var-only → 위반 없음, 정상 취급", () => {
  const r = evaluateTypography([{ ...base, appliedStatus: "var-only" }]);
  assert.equal(r.violations.length, 0);
  assert.equal(r.summary.conformCount, 1);
});

test("mixed → 위반 없음, 정상 취급", () => {
  const r = evaluateTypography([{ ...base, appliedStatus: "mixed" }]);
  assert.equal(r.violations.length, 0);
  assert.equal(r.summary.conformCount, 1);
});

test("혼합 배열: raw 1개 + clean 2개 → 적합률 2/3", () => {
  const r = evaluateTypography([
    { ...base, nodeId: "a", appliedStatus: "styled-clean", textStyle: "body1" },
    { ...base, nodeId: "b", appliedStatus: "raw" },
    { ...base, nodeId: "c", appliedStatus: "styled-clean", textStyle: "body2" },
  ]);
  assert.equal(r.summary.total, 3);
  assert.equal(r.summary.conformCount, 2);
  assert.equal(r.summary.highViolations, 1);
  assert.ok(Math.abs(r.summary.conformanceRate - 0.667) < 0.001);
});

test("빈 배열 → conformanceRate null, 가드 throw 안 함", () => {
  assert.doesNotThrow(() => {
    const r = evaluateTypography([]);
    assert.equal(r.summary.total, 0);
    assert.equal(r.summary.conformanceRate, null);
  });
});

test("infoFlags는 항상 0", () => {
  const r = evaluateTypography([
    { ...base, nodeId: "a", appliedStatus: "raw" },
    {
      ...base,
      nodeId: "b",
      appliedStatus: "styled-clean",
      textStyle: "heading1",
    },
  ]);
  assert.equal(r.summary.infoFlags, 0);
});

test("정상 입력에서 집계 검산 가드가 throw 안 함", () => {
  assert.doesNotThrow(() =>
    evaluateTypography([
      {
        ...base,
        nodeId: "g1",
        appliedStatus: "styled-clean",
        textStyle: "heading2",
      },
      { ...base, nodeId: "g2", appliedStatus: "raw" },
    ]),
  );
});

// ── 그룹 요소(count/nodeIds) 가중 집계 — extract.figma.js 그룹핑 출력 호환 ──
test("그룹 요소는 count 가중치로 집계되고 nodeIds가 보존된다", () => {
  const r = evaluateTypography([
    {
      ...base,
      nodeId: undefined,
      nodeIds: ["t1", "t2", "t3"],
      count: 3,
      appliedStatus: "styled-clean",
      textStyle: "heading2",
    },
    {
      ...base,
      nodeId: undefined,
      nodeIds: ["r1", "r2"],
      count: 2,
      appliedStatus: "raw",
    },
  ]);
  assert.equal(r.summary.total, 5);
  assert.equal(r.summary.conformCount, 3);
  assert.equal(r.summary.highViolations, 2);
  const v = r.violations[0];
  assert.equal(v.nodeId, "r1");
  assert.deepEqual(v.nodeIds, ["r1", "r2"]);
});

// ── buildTypographyRubric: 3단 LLM용 위계 루브릭 서브셋 ──
test("buildTypographyRubric은 사용된 Text Style만 추리고 미등록은 unknownTextStyles로", () => {
  const schema = {
    heading2: {
      $extensions: {
        vapor: { intent: "i", when: ["w"], avoid: ["a"], viewport: ["pc"] },
      },
    },
    body1: { $extensions: { vapor: { intent: "unused" } } },
  };
  const { rubric, unknownTextStyles } = buildTypographyRubric(
    [
      { textStyle: "heading2" },
      { textStyle: "customStyle" }, // 스키마에 없음 → unknown
      { textStyle: null }, // raw/var-only → 루브릭 불필요
    ],
    schema,
  );
  assert.deepEqual(Object.keys(rubric), ["heading2"]);
  assert.deepEqual(rubric.heading2, {
    intent: "i",
    when: ["w"],
    avoid: ["a"],
    viewport: ["pc"],
  });
  assert.deepEqual(unknownTextStyles, ["customStyle"]);
});
