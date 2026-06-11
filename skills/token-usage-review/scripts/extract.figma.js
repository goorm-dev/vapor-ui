// extract.figma.js
// 1단 통합 추출 — use_figma read-only 동결 스크립트.
//
// 사용법(에이전트): 이 파일을 Read한 뒤 아래 두 상수만 치환해 use_figma에 그대로 전달한다.
//   ROOT_ID — 검증 대상 루트 노드 id ("37843:3511" 형식)
//   MODE    — "both" | "color" | "typography"
// 로직은 수정하지 마라. 결함을 발견하면 이 파일 자체를 고치고 문서·테스트를 함께 갱신한다
// (매 실행 즉석 재작성 금지 — 재작성 드리프트가 이 스킬 정확도의 최대 위협이었다).
//
// ── 불변 원칙 (수정 시 지킬 것) ──
// 1. 재귀 정지: valuesByMode[modeId]가 VARIABLE_ALIAS면 다음 hop, {r,g,b,a}면 primitive 도달.
// 2. mode 고정: 노드의 resolvedVariableModes[collectionId]로 정한다(없으면 첫 mode).
//    light/dark 중 엉뚱한 체인을 따라가지 않도록 첫 mode를 임의로 고르지 않는다.
// 3. collection 단계 판별은 이름 기준(tierOf). 체인에서 semantic 단계 변수의 .name이 복원 대상.
// 4. API 제약: getVariableByIdAsync만(sync 버전 deprecated), read-only(set* 금지),
//    방문 id Set으로 alias 루프 가드, 모든 Promise await.
// 5. 스키마 키 변환: color- 접두 → colors., 나머지 하이픈 → "." (toSchemaKey).
// 6. 출력은 evaluate.mjs / typography-evaluate.mjs 입력 형식을 직접 따른다(별도 정규화 없음).
//    동일 (name, property, token, hex, opacity, tokenStatus) 요소는
//    nodeIds/count로 그룹핑해 반환한다 — 적법성 판정에 손실 없는 압축.
// 7. 정직성: semantic 도달 → tokenStatus 'ok'. 바인딩은 있으나 체인 미도달(오타/깨진 별칭/
//    remote 실패) → 'unknown'. 변수 미바인딩 → 'raw'. hex가 같다고 token을 추론해 채우지 않는다.
// 8. remote 변수 방어: variable.remote === true면 importVariableByKeyAsync(key)를 한 번
//    시도하고 재조회. 그래도 실패면 체인 중단 → 'unknown'(거짓 통과 금지).

const ROOT_ID = "__ROOT_ID__";
const MODE = "__MODE__"; // "both" | "color" | "typography"

figma.skipInvisibleInstanceChildren = true;

const root = await figma.getNodeByIdAsync(ROOT_ID);
if (!root) throw new Error("노드를 찾을 수 없음: " + ROOT_ID);

// 비-기본 페이지면 페이지 전환 (호출당 1회)
let pageNode = root;
while (pageNode && pageNode.type !== "PAGE") pageNode = pageNode.parent;
if (pageNode && figma.currentPage !== pageNode)
  await figma.setCurrentPageAsync(pageNode);

// ── 공통 헬퍼 ──
function tierOf(collName) {
  if (!collName) return "unknown";
  if (collName.includes("⚙️") || /primitive/i.test(collName))
    return "primitive";
  if (collName.includes("●") || /(^|[^a-z])token(\/|$| )/i.test(collName))
    return "semantic";
  if (collName.includes("💙") || /\/Color$/i.test(collName)) return "component";
  return "unknown";
}
function rgbaToHex(c) {
  if (!c) return null;
  const f = (n) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, "0");
  return "#" + f(c.r) + f(c.g) + f(c.b);
}
// color-foreground-primary-200 → colors.foreground.primary.200
function toSchemaKey(name) {
  return name && name.startsWith("color-")
    ? "colors." + name.slice("color-".length).replace(/-/g, ".")
    : null;
}

async function getVariableWithRemoteDefense(id) {
  let v = null;
  try {
    v = await figma.variables.getVariableByIdAsync(id);
  } catch (e) {
    v = null;
  }
  // 불변 원칙 8: remote 변수면 import 한 번 시도 후 재조회
  if (v && v.remote) {
    try {
      const imported = await figma.variables.importVariableByKeyAsync(v.key);
      if (imported) v = imported;
    } catch (e) {
      /* 실패 시 원본 v 유지 — 체인이 끊기면 'unknown'으로 떨어진다 */
    }
  }
  return v;
}

// alias 체인 역추적: 시작 변수 id → 체인(각 단 name/tier) + 최종 hex
async function walk(node, startId) {
  const modes = node.resolvedVariableModes || {};
  const chain = [];
  const seen = new Set();
  let id = startId;
  let finalHex = null;
  let broken = false;
  while (id && !seen.has(id)) {
    seen.add(id);
    const v = await getVariableWithRemoteDefense(id);
    if (!v) {
      broken = true; // 바인딩은 있는데 체인을 못 따라감 → 'unknown'
      break;
    }
    let collName = null;
    try {
      const coll = await figma.variables.getVariableCollectionByIdAsync(
        v.variableCollectionId,
      );
      collName = coll && coll.name;
    } catch (e) {
      collName = null;
    }
    chain.push({ name: v.name, tier: tierOf(collName) });
    const m = modes[v.variableCollectionId] || Object.keys(v.valuesByMode)[0];
    const val = v.valuesByMode[m];
    if (val && val.type === "VARIABLE_ALIAS") id = val.id;
    else {
      finalHex = rgbaToHex(val);
      id = null;
    }
  }
  return { chain, finalHex, broken };
}

// 체인 → token/tokenStatus. 바인딩된 변수에서 출발했으므로 'raw'는 여기서 안 나온다 —
// semantic 미도달은 전부 'unknown'(오타·깨진 별칭·remote 실패). 'raw'는 미바인딩 paint 전용.
function toToken(chain) {
  const sem = chain.find((c) => c.tier === "semantic");
  if (!sem) return { token: null, tokenStatus: "unknown" };
  const key = toSchemaKey(sem.name);
  // 변환 키가 스키마에 실제 있는지 최종 판정은 evaluate(tokenKeys 보유)가 한다.
  return key
    ? { token: key, tokenStatus: "ok" }
    : { token: null, tokenStatus: "unknown" };
}

// ── 색상 추출 ──

const colorRaw = [];
const typoRaw = [];
let visited = 0;
let textNodes = 0;

// 뷰포트: 루트 프레임 너비 기준(단일 프레임 검증)
const rootWidth = "width" in root ? root.width : 1024;
const viewport =
  rootWidth >= 1024 ? "pc" : rootWidth >= 768 ? "tablet" : "mobile";

function pushColor(node, property, token, hex, tokenStatus) {
  colorRaw.push({
    nodeId: node.id,
    name: node.name,
    property,
    token,
    hex,
    opacity: node.opacity ?? 1,
    nearestToken: null, // 제안은 비목표 — 검증만 한다
    tokenStatus,
  });
}

// ── typography 추출 (getStyledTextSegments 노드당 1회) ──
async function classifyTextNode(node) {
  const segs = node.getStyledTextSegments([
    "textStyleId",
    "fontName",
    "fontSize",
    "lineHeight",
    "letterSpacing",
    "boundVariables",
    "textStyleOverrides",
  ]);

  // mixed: 한 노드에 스타일 조합이 2개 이상
  if (segs.length > 1)
    return {
      appliedStatus: "mixed",
      textStyle: null,
      overriddenFields: [],
      seg: segs[0],
    };

  const seg = segs[0];
  const styleId = seg && seg.textStyleId;

  if (styleId) {
    const style = await figma.getStyleByIdAsync(styleId).catch(() => null);
    // remote library 미enabled → override 탐지 불가, styled-clean으로 보수적 처리
    if (!style)
      return {
        appliedStatus: "styled-clean",
        textStyle: null,
        overriddenFields: [],
        seg,
      };
    const overriddenFields = [];
    // weight는 fontName.style 라벨로만 비교한다(fontWeight 숫자는 readonly 파생값)
    if (
      seg.fontName?.family !== style.fontName?.family ||
      seg.fontName?.style !== style.fontName?.style
    )
      overriddenFields.push("fontName");
    if (seg.fontSize !== style.fontSize) overriddenFields.push("fontSize");
    if (
      seg.lineHeight?.unit !== style.lineHeight?.unit ||
      seg.lineHeight?.value !== style.lineHeight?.value
    )
      overriddenFields.push("lineHeight");
    if (
      seg.letterSpacing?.unit !== style.letterSpacing?.unit ||
      seg.letterSpacing?.value !== style.letterSpacing?.value
    )
      overriddenFields.push("letterSpacing");
    return {
      appliedStatus: overriddenFields.length
        ? "styled-override"
        : "styled-clean",
      textStyle: style.name,
      overriddenFields,
      seg,
    };
  }

  const bv = (seg && seg.boundVariables) || {};
  const hasBinding = Object.keys(bv).some((k) =>
    [
      "fontFamily",
      "fontSize",
      "fontStyle",
      "lineHeight",
      "letterSpacing",
    ].includes(k),
  );
  return {
    appliedStatus: hasBinding ? "var-only" : "raw",
    textStyle: null,
    overriddenFields: [],
    seg,
  };
}

async function visit(node) {
  visited++;
  const bv = node.boundVariables || {};
  const fillProperty = node.type === "TEXT" ? "text" : "fill";

  if (MODE !== "typography") {
    // fill — 변수 바인딩
    const boundFills = bv.fills || [];
    for (const a of boundFills) {
      if (!a || !a.id) continue;
      const { chain, finalHex } = await walk(node, a.id);
      const { token, tokenStatus } = toToken(chain);
      pushColor(node, fillProperty, token, finalHex, tokenStatus);
    }
    // fill — 미바인딩 SOLID(raw)
    if (Array.isArray(node.fills)) {
      node.fills.forEach((p, i) => {
        if (p && p.type === "SOLID" && p.visible !== false && !boundFills[i]) {
          pushColor(node, fillProperty, null, rgbaToHex(p.color), "raw");
        }
      });
    }
    // stroke
    const boundStrokes = bv.strokes || [];
    for (const a of boundStrokes) {
      if (!a || !a.id) continue;
      const { chain, finalHex } = await walk(node, a.id);
      const { token, tokenStatus } = toToken(chain);
      pushColor(node, "stroke", token, finalHex, tokenStatus);
    }
    // stroke — 미바인딩 SOLID(raw)
    if (Array.isArray(node.strokes)) {
      node.strokes.forEach((p, i) => {
        if (
          p &&
          p.type === "SOLID" &&
          p.visible !== false &&
          !boundStrokes[i]
        ) {
          pushColor(node, "stroke", null, rgbaToHex(p.color), "raw");
        }
      });
    }
  }

  if (MODE !== "color" && node.type === "TEXT") {
    textNodes++;
    const { appliedStatus, textStyle, overriddenFields, seg } =
      await classifyTextNode(node);
    typoRaw.push({
      nodeId: node.id,
      name: node.name,
      characters: (node.characters || "").slice(0, 20),
      textStyle,
      viewport,
      appliedStatus,
      overriddenFields,
      resolved: {
        fontSize: seg ? seg.fontSize : null,
        lineHeight: seg ? seg.lineHeight : null,
        letterSpacing: seg ? seg.letterSpacing : null,
        fontName: seg ? seg.fontName : null,
      },
    });
  }

  if ("children" in node) for (const ch of node.children) await visit(ch);
}

await visit(root);

// ── 그룹핑(불변 원칙 6): 동일 평가 입력 요소를 nodeIds/count로 압축 ──
function groupBy(items, keyOf) {
  const map = new Map();
  for (const it of items) {
    const key = keyOf(it);
    const g = map.get(key);
    if (g) {
      g.nodeIds.push(it.nodeId);
      g.count++;
    } else {
      const { nodeId, ...rest } = it;
      map.set(key, { ...rest, nodeIds: [nodeId], count: 1 });
    }
  }
  return [...map.values()];
}
const SEP = "";
const colors = groupBy(colorRaw, (e) =>
  [e.name, e.property, e.token, e.hex, e.opacity, e.tokenStatus].join(SEP),
);
const typography = groupBy(typoRaw, (e) =>
  [
    e.name,
    e.characters,
    e.textStyle,
    e.viewport,
    e.appliedStatus,
    e.overriddenFields.join(","),
    JSON.stringify(e.resolved),
  ].join(SEP),
);

return {
  mode: MODE,
  viewport,
  stats: {
    visited,
    textNodes,
    colorElements: colorRaw.length,
    colorGroups: colors.length,
    typoElements: typoRaw.length,
    typoGroups: typography.length,
  },
  colors,
  typography,
};
