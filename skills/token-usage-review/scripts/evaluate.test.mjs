// evaluate.test.mjs
// 2단 결정론 코어의 단위테스트. 외부 의존성 없이 Node 내장 test runner 사용.
// 실행: node --test scripts/
//
// 검증 대상은 "결정론이어야 하는 것이 정말 결정론으로 맞는가"다:
//   - WCAG 대비비 공식 (알려진 표준값과 대조)
//   - do-not-use 누락 없이 검출
//   - 미바인딩(raw색) = 토큰 미사용 위반 검출
//   - contrast 미달 검출 / hex 없으면 미검사 처리
// LLM 의미 판정은 여기서 테스트하지 않는다(정답이 모호하므로 vibe 검증으로).

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  contrastRatio,
  relativeLuminance,
  hexToRgb,
  isPureWhite,
  evaluate,
} from "./evaluate.mjs";

// ── WCAG 대비비: 표준 고정값 ──
test("흑백 대비는 정확히 21:1", () => {
  assert.ok(Math.abs(contrastRatio("#000000", "#ffffff") - 21) < 1e-9);
});

test("동일 색 대비는 1:1", () => {
  assert.ok(Math.abs(contrastRatio("#777777", "#777777") - 1) < 1e-9);
});

test("대비비는 인자 순서와 무관 (대칭)", () => {
  const a = contrastRatio("#1a73e8", "#ffffff");
  const b = contrastRatio("#ffffff", "#1a73e8");
  assert.ok(Math.abs(a - b) < 1e-12);
});

test("상대 휘도: 흰색=1, 검정=0", () => {
  assert.ok(Math.abs(relativeLuminance("#ffffff") - 1) < 1e-9);
  assert.ok(Math.abs(relativeLuminance("#000000") - 0) < 1e-9);
});

test("#767676 / #ffffff 대비는 WCAG AA 경계값 ~4.54:1", () => {
  // #767676 on 화이트는 WCAG 문서가 4.54:1로 명시하는 정상 텍스트 AA 경계색.
  // 중간 휘도 구간에서 공식이 맞는지 확인하는 검증점.
  const r = contrastRatio("#767676", "#ffffff");
  assert.ok(r > 4.5 && r < 4.6, `예상 ~4.54, 실제 ${r}`);
});

test("hexToRgb: 3자리 단축형(#abc) 확장", () => {
  assert.deepEqual(hexToRgb("#abc"), hexToRgb("#aabbcc"));
});

test("hexToRgb: 잘못된 hex는 throw", () => {
  assert.throws(() => hexToRgb("#xyz"));
  assert.throws(() => hexToRgb("1a73e"));
});

// ── evaluate(): 고정 룰셋으로 결정론 검사 ──
const FIXTURE_RULESET = {
  schemaVersion: "test",
  globalRules: {
    disabledOpacityPercent: 32,
    foregroundSurface: { 100: "pure-white-only", 200: "non-white" },
  },
  doNotUse: ["colors.background.secondary.100"],
  contrast: {
    "colors.foreground.primary.100": {
      minimumContrast: "4.5:1",
      ratio: 4.5,
      role: "foreground",
    },
  },
  avoidRules: [],
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
        backgroundHex: null,
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
        backgroundHex: null,
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

test("contrast 미달을 high 위반으로 검출", () => {
  // primary.100 전경(연한 회색)을 흰 배경에 → 대비 낮음
  const r = evaluate(
    [
      {
        nodeId: "3",
        name: "텍스트",
        property: "text",
        token: "colors.foreground.primary.100",
        hex: "#cccccc",
        opacity: 1,
        backgroundHex: "#ffffff",
        nearestToken: null,
      },
    ],
    FIXTURE_RULESET,
  );
  const v = r.violations.find((x) => x.type === "contrast-fail");
  assert.ok(v, "contrast 미달이어야 함");
  assert.equal(v.severity, "high");
});

test("contrast 충분하면 위반 없음 + 적합 카운트", () => {
  const r = evaluate(
    [
      {
        nodeId: "4",
        name: "텍스트",
        property: "text",
        token: "colors.foreground.primary.100",
        hex: "#0b3d91",
        opacity: 1,
        backgroundHex: "#ffffff",
        nearestToken: null,
      },
    ],
    FIXTURE_RULESET,
  );
  assert.equal(r.violations.filter((v) => v.severity === "high").length, 0);
  assert.equal(r.summary.conformCount, 1);
});

test("contrast 요구 토큰인데 hex/배경 없으면 미검사(info)로 처리, high 아님", () => {
  const r = evaluate(
    [
      {
        nodeId: "5",
        name: "텍스트",
        property: "text",
        token: "colors.foreground.primary.100",
        hex: null,
        opacity: 1,
        backgroundHex: null,
        nearestToken: null,
      },
    ],
    FIXTURE_RULESET,
  );
  const v = r.violations.find((x) => x.type === "contrast-unchecked");
  assert.ok(v);
  assert.equal(v.severity, "info");
  assert.equal(r.summary.highViolations, 0);
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
        backgroundHex: null,
        nearestToken: null,
      },
      {
        nodeId: "b",
        name: "bad",
        property: "fill",
        token: "colors.background.secondary.100",
        hex: "#eee",
        opacity: 1,
        backgroundHex: null,
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

// ── isPureWhite: 엄격 순백 판정 ──
test("isPureWhite: #ffffff/#fff/transparent만 순백, near-white는 아님", () => {
  assert.equal(isPureWhite("#ffffff"), true);
  assert.equal(isPureWhite("#fff"), true);
  assert.equal(isPureWhite("#FFFFFF"), true);
  assert.equal(isPureWhite("transparent"), true);
  assert.equal(isPureWhite("#fefefe"), false);
  assert.equal(isPureWhite("#f5f5f5"), false);
});

// ── foreground surface 규칙 ──
// primary.100은 contrast 요구(4.5:1)도 있으므로, surface만 검증하려면 대비가 충분한 hex를 쓴다.
test(".100 전경을 비순백 배경에 → foreground-surface-mismatch (high)", () => {
  const r = evaluate(
    [
      {
        nodeId: "fs1",
        name: "텍스트",
        property: "text",
        token: "colors.foreground.primary.100",
        hex: "#0b3d91",
        opacity: 1,
        backgroundHex: "#f5f5f5",
        nearestToken: null,
      },
    ],
    FIXTURE_RULESET,
  );
  const v = r.violations.find((x) => x.type === "foreground-surface-mismatch");
  assert.ok(v, "mismatch가 있어야 함");
  assert.equal(v.severity, "high");
  assert.equal(r.summary.conformCount, 0);
});

test(".100 전경을 순백(#ffffff) 배경에 → surface 위반 없음", () => {
  const r = evaluate(
    [
      {
        nodeId: "fs2",
        name: "텍스트",
        property: "text",
        token: "colors.foreground.primary.100",
        hex: "#0b3d91",
        opacity: 1,
        backgroundHex: "#ffffff",
        nearestToken: null,
      },
    ],
    FIXTURE_RULESET,
  );
  assert.equal(
    r.violations.filter((x) => x.type === "foreground-surface-mismatch").length,
    0,
  );
  assert.equal(r.summary.conformCount, 1);
});

test(".200 전경을 순백(#ffffff) 배경에 → foreground-surface-mismatch (high)", () => {
  const r = evaluate(
    [
      {
        nodeId: "fs3",
        name: "텍스트",
        property: "text",
        token: "colors.foreground.normal.200",
        hex: "#111111",
        opacity: 1,
        backgroundHex: "#ffffff",
        nearestToken: null,
      },
    ],
    FIXTURE_RULESET,
  );
  const v = r.violations.find((x) => x.type === "foreground-surface-mismatch");
  assert.ok(v, "mismatch가 있어야 함");
  assert.equal(v.severity, "high");
});

test("foreground 토큰인데 backgroundHex 없으면 미검사(info), high 아님", () => {
  const r = evaluate(
    [
      {
        nodeId: "fs4",
        name: "텍스트",
        property: "text",
        token: "colors.foreground.normal.100",
        hex: "#111111",
        opacity: 1,
        backgroundHex: null,
        nearestToken: null,
      },
    ],
    FIXTURE_RULESET,
  );
  const v = r.violations.find((x) => x.type === "foreground-surface-unchecked");
  assert.ok(v);
  assert.equal(v.severity, "info");
  assert.equal(r.summary.highViolations, 0);
  assert.equal(r.summary.conformCount, 1);
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
        backgroundHex: null,
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
          backgroundHex: null,
          nearestToken: null,
        },
        {
          nodeId: "g2",
          name: "bad",
          property: "fill",
          token: "colors.background.secondary.100",
          hex: "#eee",
          opacity: 1,
          backgroundHex: null,
          nearestToken: null,
        },
      ],
      FIXTURE_RULESET,
    ),
  );
});
