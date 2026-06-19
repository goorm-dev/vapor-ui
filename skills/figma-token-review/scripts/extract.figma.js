// extract.figma.js
// 1단 통합 추출 — use_figma read-only 고정 스크립트.
//
// 사용법(에이전트): 이 파일을 Read한 뒤 아래 두 상수만 치환해 use_figma에 그대로 전달한다.
//   ROOT_ID — 검증 대상 루트 노드 id ("37843:3511" 형식)
//   MODE    — "both" | "color" | "typography"
// 로직은 매 실행 즉석 재작성하지 마라. 결함을 발견하면 이 파일을 고치고 문서·테스트를 함께 갱신한다.
//
// 출력은 evaluate.mjs / typography-evaluate.mjs 입력 형식을 직접 따른다:
//   color element: { nodeId, name, property, token, hex, background, tokenStatus }
//   typo  element: { nodeId, name, characters, textStyle, viewport, appliedStatus, overriddenFields, resolved }
// 동일 (평가 입력) 요소는 nodeIds/count로 그룹핑해 반환한다 — 판정에 손실 없는 압축.
//
// ── 불변 원칙 ──
// 1. alias 끝까지: valuesByMode[modeId]가 VARIABLE_ALIAS면 다음 hop, {r,g,b,a}면 종착.
//    체인 어딘가에 semantic 단계가 있으면 그 이름이 복원 대상(component → semantic → primitive).
// 2. mode 고정: 노드의 resolvedVariableModes[collectionId]로 정한다(없으면 첫 mode).
// 3. collection 단계 판별은 이름 기준(tierOf). semantic 단계 변수의 .name이 토큰 키 복원원.
// 4. read-only: getVariableByIdAsync만(sync deprecated), set* 금지, alias 루프는 방문 Set으로 가드, 모든 Promise await.
// 5. 스키마 키 변환: color- 접두 → colors., 나머지 하이픈 → "." (toSchemaKey).
// 6. 정직성: semantic 도달 → tokenStatus 'ok'. 바인딩은 있으나 체인 미도달(오타/깨진 별칭/remote 실패) → 'unknown'.
//    변수 미바인딩 paint → 'raw'. hex가 같다고 token을 추론해 채우지 않는다.
// 7. remote 변수 방어: variable.remote면 importVariableByKeyAsync(key)를 한 번 시도하고 재조회. 실패면 체인 중단 → 'unknown'.
// 8. 배경 식별(4축): foreground 후보 노드는 조상 불투명 fill을 끌어와 white/other/transparent/ambiguous로 분류.
//    z-order 겹침·opacity 트릭 등 모호 케이스는 'ambiguous'(보류). 오판 금지 — 단정하지 않는다.

const ROOT_ID = "__ROOT_ID__";
const MODE = "__MODE__"; // "both" | "color" | "typography"

figma.skipInvisibleInstanceChildren = true;

const root = await figma.getNodeByIdAsync(ROOT_ID);
if (!root) throw new Error("노드를 찾을 수 없음: " + ROOT_ID);

let pageNode = root;
while (pageNode && pageNode.type !== "PAGE") pageNode = pageNode.parent;
if (pageNode && figma.currentPage !== pageNode)
  await figma.setCurrentPageAsync(pageNode);

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
  if (v && v.remote) {
    try {
      const imported = await figma.variables.importVariableByKeyAsync(v.key);
      if (imported) v = imported;
    } catch (e) {
      /* 실패 시 원본 유지 — 체인이 끊기면 'unknown'으로 떨어진다 */
    }
  }
  return v;
}

async function walk(node, startId) {
  const modes = node.resolvedVariableModes || {};
  const chain = [];
  const seen = new Set();
  let id = startId;
  let finalHex = null;
  while (id && !seen.has(id)) {
    seen.add(id);
    const v = await getVariableWithRemoteDefense(id);
    if (!v) break;
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
  return { chain, finalHex };
}

function toToken(chain) {
  const sem = chain.find((c) => c.tier === "semantic");
  if (!sem) return { token: null, tokenStatus: "unknown" };
  const key = toSchemaKey(sem.name);
  return key
    ? { token: key, tokenStatus: "ok" }
    : { token: null, tokenStatus: "unknown" };
}

// 조상 체인에서 가장 가까운 불투명 SOLID fill을 배경으로. 없으면 transparent, 모호하면 ambiguous.
function classifyBackground(node) {
  let cur = node.parent;
  while (cur && cur.type !== "PAGE") {
    const nodeOpaque = ("opacity" in cur ? cur.opacity : 1) === 1;
    const fills = "fills" in cur && Array.isArray(cur.fills) ? cur.fills : [];
    const solid = fills.find(
      (p) => p && p.type === "SOLID" && p.visible !== false,
    );
    if (solid) {
      // fill은 있는데 노드/fill이 반투명 → 그 아래 색과 섞임. 단정 금지.
      const fillOpaque = (solid.opacity ?? 1) === 1;
      if (!nodeOpaque || !fillOpaque)
        return { kind: "ambiguous", hex: rgbaToHex(solid.color) };
      const hex = rgbaToHex(solid.color);
      return { kind: hex === "#ffffff" ? "white" : "other", hex };
    }
    cur = cur.parent;
  }
  return { kind: "transparent", hex: null };
}

const colorRaw = [];
const typoRaw = [];
let visited = 0;
let textNodes = 0;

const rootWidth = "width" in root ? root.width : 1024;
const viewport =
  rootWidth >= 1024 ? "pc" : rootWidth >= 768 ? "tablet" : "mobile";

// schemaMode — evaluate가 어느 색 스키마(light/dark)로 판정할지. 루트가 고정한 변수 mode
// 이름에 "dark"가 들어가면 dark, 아니면 light. 못 정하면 light(기본). 값 검증은 안 하므로
// 의미 메타(light/dark 동일)엔 영향 없고, dark 시안의 dark 스키마 선택에만 쓰인다.
async function detectSchemaMode(node) {
  const modes = node.resolvedVariableModes || {};
  for (const collId of Object.keys(modes)) {
    try {
      const coll = await figma.variables.getVariableCollectionByIdAsync(collId);
      const m = coll && coll.modes.find((x) => x.modeId === modes[collId]);
      if (m && /dark/i.test(m.name)) return "dark";
    } catch (e) {
      /* 무시 — light 기본 */
    }
  }
  return "light";
}
const schemaMode = await detectSchemaMode(root);

function pushColor(node, property, token, hex, tokenStatus) {
  colorRaw.push({
    nodeId: node.id,
    name: node.name,
    property,
    token,
    hex,
    background: property === "text" ? classifyBackground(node) : null,
    tokenStatus,
  });
}

async function classifyTextNode(node) {
  const segs = node.getStyledTextSegments([
    "textStyleId",
    "fontName",
    "fontSize",
    "lineHeight",
    "letterSpacing",
    "boundVariables",
  ]);

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
    if (!style)
      return {
        appliedStatus: "styled-clean",
        textStyle: null,
        overriddenFields: [],
        seg,
      };
    const overriddenFields = [];
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
    // bound paint는 alias 체인을 끝까지 walk해 토큰 복원, 미바인딩 SOLID는 'raw'.
    // fill(TEXT면 property='text')·stroke가 같은 로직이라 한 함수로 묶는다.
    const extractPaints = async (paints, bound, property) => {
      for (const a of bound) {
        if (!a || !a.id) continue;
        const { chain, finalHex } = await walk(node, a.id);
        const { token, tokenStatus } = toToken(chain);
        pushColor(node, property, token, finalHex, tokenStatus);
      }
      if (Array.isArray(paints)) {
        paints.forEach((p, i) => {
          if (p && p.type === "SOLID" && p.visible !== false && !bound[i]) {
            pushColor(node, property, null, rgbaToHex(p.color), "raw");
          }
        });
      }
    };
    await extractPaints(node.fills, bv.fills || [], fillProperty);
    await extractPaints(node.strokes, bv.strokes || [], "stroke");
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

const colors = groupBy(colorRaw, (e) =>
  JSON.stringify([
    e.name,
    e.property,
    e.token,
    e.hex,
    e.tokenStatus,
    e.background ? e.background.kind : null,
    e.background ? e.background.hex : null,
  ]),
);
const typography = groupBy(typoRaw, (e) =>
  JSON.stringify([
    e.name,
    e.characters,
    e.textStyle,
    e.viewport,
    e.appliedStatus,
    e.overriddenFields,
    e.resolved,
  ]),
);

return {
  mode: MODE,
  viewport,
  schemaMode,
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
