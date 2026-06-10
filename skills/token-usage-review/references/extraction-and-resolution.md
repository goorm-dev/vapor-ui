# 통합 추출 (실행 순서 1) — use_figma 단일 스크립트로 트리·토큰·배경을 한 번에

> "사실"을 모아 `evaluate.mjs`가 받을 요소 배열을 만드는 단계. 추론하지 말고 그대로 읽어 추출한다.
> **핵심 전환**: 예전엔 `get_design_context`(바인딩) + `get_variable_defs`(hex) + `use_figma`(alias 역추적)로 나눠 뽑고 따로 정규화했다. 이제 **`use_figma` read-only 스크립트 한 번**이 트리 순회 + alias 역추적(semantic 복원) + 최종 hex + 배경↔전경 매핑을 모두 수행하고, **`evaluate.mjs` 입력 형식(Element 배열)을 직접 반환**한다. 별도 정규화 단계가 없다.

## 1. 왜 use_figma 단일 추출인가

토큰 검증은 ① 토큰 적법성(어느 노드가 어떤 vapor 토큰을 썼나) + ② 색대비(전경이 어떤 배경 위에 놓였나)를 본다. 둘 다에 필요한 정보가 한 군데서 나온다:

- **alias 체인 중간 semantic 이름**: MCP `get_variable_defs`/`get_design_context`는 vapor의 3단 collection alias 체인(`⚙️Primitives → ● Token/Color(semantic) → 💙 {Component}/Color(component)`)을 **평탄화**해 진입점(component) 이름 + 최종 hex만 준다. 적법성 판정에 필요한 건 진입점이 아니라 **실제 연결된 semantic 토큰 이름**이라, Plugin API로 체인을 역추적해야 한다.
- **배경↔전경 매핑**: 색대비에 필요한 "어느 전경이 어느 배경 위에 있나"는 **노드 트리의 부모-자식 중첩**이다(§3). 이 구조도 `use_figma`가 트리를 순회하며 직접 얻는다. `get_design_context`의 DOM이 따로 필요하지 않다.

→ 그래서 **`use_figma` 단일 스크립트가 검증에 필요한 모든 것을 자급**한다. MCP는 `get_metadata`(연결 확인, 가벼움) + `get_screenshot`(요소 역할 추론 보조)만 남긴다. `get_design_context`는 토큰 검증 흐름에 불필요하다(사람이 읽을 코드 스니펫/컴포넌트 props가 따로 필요한 경우에만 쓰는 별개 도구).

**단, 통합의 조건**: 대비 검사는 **트리의 부모-자식 중첩으로 배경↔전경 관계가 드러나는 범위에서만** 판정한다. 구조로 배경을 단정 못 하는 경우(z-order 형제 겹침·`ABSOLUTE` 포지셔닝·반투명, §3 한계)는 `backgroundHex: null`로 두어 evaluate가 미검사(info)로 보류한다. "구조로 잡히는 만큼만" 대비를 결정하고 나머지는 정직하게 보류한다 — 억지 통과 금지.

## 2. 스크립트 작성 — 불변 원칙과 참고 골격

`/figma-use`를 먼저 로드한 뒤 `use_figma`로 **read-only JS를 즉석 작성**해 실행한다(고정 스크립트를 박아 두지 않는다 — 노드/페이지/mode 상황에 맞춰 매번 짠다). 작성 시 지킬 **불변 원칙**:

1. **재귀 정지 조건**: 변수의 `valuesByMode[modeId]`가 `{type:'VARIABLE_ALIAS', id}`면 그 `id`로 다음 hop, `{r,g,b,a}`(실제 색)면 primitive 도달로 정지.
2. **mode 고정**: 따라갈 mode는 노드의 `resolvedVariableModes[collectionId]`로 정한다(없으면 첫 mode). light/dark 중 엉뚱한 체인을 따라가지 않도록 **첫 mode를 임의로 고르지 마라**.
3. **collection 단계 판별(이름 기준)**: `💙`·`{Component}/Color` → component, `● Token`·`Token/Color` → semantic, `⚙️Primitives`·`Primitive` → primitive. 체인에서 **semantic 단계 변수의 `.name`** 이 복원 대상.
4. **API 제약**: `figma.variables.getVariableByIdAsync`(sync `getVariableById`는 deprecated — 금지), read-only(`return`만, `set*` 호출 금지), 방문 id `Set`으로 alias 루프 가드, 모든 Promise `await`.
5. **스키마 키 변환**: 복원한 semantic 변수 이름을 vapor 스키마 키 형태로 바꾼다 — **`color-` 접두 → `colors.`, 나머지 하이픈 → `.`**. 예: `color-foreground-primary-200` → `colors.foreground.primary.200`, `color-foreground-inverse` → `colors.foreground.inverse`(tier 없는 토큰도 성립). 오타(`color-backgroud-primary` → `colors.backgroud.primary`)는 스키마에 없어 `evaluate`가 `unknown-token`으로 잡는다.
6. **배경 전파**: 컨테이너 fill의 hex를 자식들에게 배경으로 내려보내되, 그 fill이 **불투명(opacity≥1·visible·SOLID)일 때만**. 불확실하면 전파하지 않는다(`backgroundHex: null` → 미검사 보류). 전경 노드(TEXT, 또는 stroke 바인딩)의 `backgroundHex`는 가장 가까운 불투명 조상 컨테이너 배경 hex다. **단 outset 인디케이터(이름이 `/focus|ring/i`인 stroke 노드 — focus ring 등)는 예외다.** 이들은 트리상 컴포넌트의 자손이지만 시각적으로 컴포넌트 *바깥*에 그려지므로, 배경은 직속 조상 fill이 아니라 "이 노드가 속한 가장 안쪽 컴포넌트 경계(COMPONENT/COMPONENT_SET/INSTANCE)의 바깥 불투명 배경"이다(WCAG 1.4.11 "컴포넌트가 놓인 배경"). 바깥 배경을 못 잡으면 `backgroundHex: null`로 미검사 보류 — 컴포넌트 내부 fill로 오판하지 마라. 상세는 §3.
7. **Element 직접 출력**: `{nodeId, name, property, token, hex, opacity, backgroundHex, nearestToken, tokenStatus}` 형식 배열을 반환한다. `evaluate.mjs`가 바로 받는다(별도 정규화 없음). `nearestToken`은 항상 `null`(제안은 이 스킬의 비목표 — 검증만 한다).
8. **정직성**: 체인이 semantic collection에 도달했으면 그 키를 `token`에 넣고 `tokenStatus:'ok'`. 도달 못 했으나 변수 바인딩은 있으면(오타/깨진 별칭) `token:null, tokenStatus:'unknown'`. 변수 미바인딩(raw 색)이면 `token:null, tokenStatus:'raw'`. **hex가 같다는 이유로 token을 추론해 채우지 마라** — 그러면 결정론 층이 거짓을 신뢰해 적합률이 부풀려진다(Callout 교훈). 역추적은 추측이 아니라 MCP가 평탄화해 숨긴 사실의 복원이다.
9. **remote 변수 방어(예외)**: `getVariableByIdAsync(id)`가 `null`/throw면(team library 미enabled), `variable.remote === true`일 때 한정 `importVariableByKeyAsync(key)`를 한 번 시도하고 재조회한다. 그래도 실패면 체인을 중단하고 `token:null`로 둔다(거짓 통과 금지). 대부분 파일은 컬렉션이 enabled라 이 분기는 안 탄다 — 일반화를 위한 방어 코드일 뿐.

참고 골격(예시일 뿐 — 실제 코드는 매번 새로 짠다):

```js
// use_figma read-only. skillNames:"figma-use". ROOT_ID=검증 대상 루트 노드.
figma.skipInvisibleInstanceChildren = true;

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
// 스키마 키 변환: color-foreground-primary-200 → colors.foreground.primary.200
function toSchemaKey(name) {
  return name && name.startsWith("color-")
    ? "colors." + name.slice("color-".length).replace(/-/g, ".")
    : null;
}

// alias 체인 역추적: 시작 변수 id → 체인(각 단 name/tier) + 최종 hex
async function walk(node, startId) {
  const modes = node.resolvedVariableModes || {};
  const chain = [];
  const seen = new Set();
  let id = startId;
  let finalHex = null;
  while (id && !seen.has(id)) {
    seen.add(id);
    let v = await figma.variables.getVariableByIdAsync(id);
    // remote 방어(예외): import 한 번 시도 후 재조회. 실패하면 체인 중단.
    if (!v) break;
    const coll = await figma.variables.getVariableCollectionByIdAsync(
      v.variableCollectionId,
    );
    chain.push({ name: v.name, tier: tierOf(coll && coll.name) });
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
// 체인 → token + tokenStatus. semantic 미도달이면 unknown(체인은 있음) / raw(체인 없음).
function toToken(chain) {
  const sem = chain.find((c) => c.tier === "semantic");
  if (!sem)
    return { token: null, tokenStatus: chain.length ? "unknown" : "raw" };
  const key = toSchemaKey(sem.name);
  // 변환은 했으나 스키마에 실제 있는지 최종 판정은 evaluate(스키마 보유)가 한다.
  // 여기선 변환 키를 싣고 ok로 둔다. evaluate가 tokenKeys로 unknown을 가린다.
  return key
    ? { token: key, tokenStatus: "ok" }
    : { token: null, tokenStatus: "unknown" };
}

const out = [];
// 컴포넌트 경계 — 진입 직전의 배경이 곧 "이 컴포넌트가 놓인 바깥 배경".
const COMPONENT_BOUNDARY = new Set(["COMPONENT", "COMPONENT_SET", "INSTANCE"]);
// outset 인디케이터(focus ring 등): 컴포넌트 바깥 배경과 대비해야 한다(불변 원칙 6).
const isFocusRing = (node) => /focus|ring/i.test(node.name || "");

async function visit(node, ancestorBgHex, outerBgHex) {
  const bv = node.boundVariables || {};
  let myBg = ancestorBgHex;
  // 컴포넌트 경계에 "진입"하는 순간의 ancestorBgHex가 이 컴포넌트의 바깥 배경.
  const myOuterBg = COMPONENT_BOUNDARY.has(node.type)
    ? ancestorBgHex
    : outerBgHex;

  // fill 바인딩 — 컨테이너 배경이 되어 자식에 전파(불투명일 때만)
  for (const a of bv.fills || []) {
    if (!a || !a.id) continue;
    const { chain, finalHex } = await walk(node, a.id);
    const { token, tokenStatus } = toToken(chain);
    out.push({
      nodeId: node.id,
      name: node.name,
      property: "fill",
      token,
      hex: finalHex,
      opacity: node.opacity ?? 1,
      backgroundHex: null,
      nearestToken: null,
      tokenStatus,
    });
    const opaque = (node.opacity ?? 1) >= 1 && finalHex;
    if (opaque) myBg = finalHex; // 불투명 컨테이너 fill만 배경으로 전파
  }
  // raw fill(변수 미바인딩 SOLID) 탐지
  if (Array.isArray(node.fills)) {
    node.fills.forEach((p, i) => {
      if (
        p &&
        p.type === "SOLID" &&
        p.visible !== false &&
        !(bv.fills && bv.fills[i])
      ) {
        const hex = rgbaToHex(p.color);
        out.push({
          nodeId: node.id,
          name: node.name,
          property: "fill",
          token: null,
          hex,
          opacity: node.opacity ?? 1,
          backgroundHex: null,
          nearestToken: null,
          tokenStatus: "raw",
        });
        if ((node.opacity ?? 1) >= 1 && hex) myBg = hex;
      }
    });
  }
  // stroke 바인딩 — 전경 취급(테두리). 일반 stroke=조상 배경, focus ring=컴포넌트 바깥 배경.
  for (const a of bv.strokes || []) {
    if (!a || !a.id) continue;
    const { chain, finalHex } = await walk(node, a.id);
    const { token, tokenStatus } = toToken(chain);
    out.push({
      nodeId: node.id,
      name: node.name,
      property: "stroke",
      token,
      hex: finalHex,
      opacity: node.opacity ?? 1,
      // focus ring은 박스 바깥 outset이라 컴포넌트 바깥 배경과 대비(없으면 null→미검사 보류).
      backgroundHex: isFocusRing(node) ? (myOuterBg ?? null) : ancestorBgHex,
      nearestToken: null,
      tokenStatus,
    });
  }
  // TEXT fill은 위 fills 루프에서 push되지만, 텍스트는 전경이므로 backgroundHex를 조상으로 채워야 한다.
  // (실제 작성 시: node.type==='TEXT'이면 fill Element의 property를 'text'로, backgroundHex=ancestorBgHex로 둔다.)

  if ("children" in node)
    for (const ch of node.children) await visit(ch, myBg, myOuterBg);
}
await visit(await figma.getNodeByIdAsync(ROOT_ID), null, null);
return out; // evaluate.mjs 입력 형식 그대로
```

> 위 골격은 fill/stroke의 뼈대만 보인다. **실제 작성 시 주의**: TEXT 노드의 fill은 `property:'text'`로 두고 `backgroundHex = ancestorBgHex`(조상 배경)로 채운다(focus ring 예외는 stroke에만 적용 — TEXT/아이콘은 outset이 아니므로 조상 배경 그대로). 아이콘(VECTOR) fill도 전경이면 같은 처리. 컨테이너 fill은 `backgroundHex:null`. `visit`는 `(node, ancestorBgHex, outerBgHex)` 3인자로 순회하며, `outerBgHex`는 컴포넌트 경계마다 갱신돼 focus ring 배경 교정에 쓰인다(불변 원칙 6). 노드가 비-기본 페이지면 `await figma.setCurrentPageAsync(page)`를 호출당 1회.

## 3. 배경↔전경 매핑 알고리즘 (대비 검사의 토대)

`evaluate.mjs`의 contrast 검사와 foreground-surface 검사는 둘 다 `backgroundHex`를 입력으로 받는다(계산하지 않는다 — 추출이 채워 넣는다). 매핑 규칙:

> **전경 노드(TEXT, 또는 stroke 바인딩)의 `backgroundHex`** = 트리를 루트→리프로 순회하며 누적한 **"가장 가까운 불투명(opacity≥1, visible, SOLID) 조상 컨테이너 fill의 hex"**. 컨테이너가 변수 바인딩이면 그 체인을 푼 hex, raw면 그 hex. 못 잡으면 `null`(→ evaluate가 contrast/foreground 미검사 info로 보류).

부모-자식 중첩이 곧 배경-전경 연결이다. 예(Callout): 컨테이너 `<div>` fill = `colors.background.primary.100`(#c6e6ff) → 그 자식 텍스트의 `backgroundHex = #c6e6ff`.

**휴리스틱 한계(자동 판정하지 않음)** — 이 세 경우는 부모 fill 추적만으로 배경을 단정할 수 없다:

1. **z-order 형제 겹침**: 같은 부모 안에서 아래 형제가 실제 배경일 때.
2. **`layoutPositioning === "ABSOLUTE"`**: 흐름에서 빠져 부모-자식 관계로 배경을 못 정할 때.
3. **반투명 배경의 알파 합성**: 여러 반투명 레이어가 겹쳐 실효색이 합성될 때.
4. **outset 인디케이터(focus ring 등)**: 트리상 컴포넌트의 자손이나 시각적으로 컴포넌트 *바깥*에 그려진다. 배경은 직속 조상 fill이 아니라 "컴포넌트가 놓인 바깥 배경"이다(WCAG 1.4.11 "컴포넌트가 놓인 배경"). 이름이 `/focus|ring/i`인 stroke 노드는 `outerBgHex`(가장 안쪽 컴포넌트 경계의 바깥 불투명 배경)로 교정하고, 못 잡으면 `null`로 보류한다 — 컴포넌트 내부 fill(예: checked 박스 색)로 오판하지 않는다. 이름 외 신호로 명명된 outset(예: `outline`)은 아직 자동 교정 못 해 일반 stroke로 처리(=기존 조상 배경)된다.

상용 도구(Stark·Contrast)조차 "선택 요소 바로 뒤 색" 휴리스틱 + 수동 fallback에 의존한다. 잡히면 쓰되, **불확실하면 `backgroundHex: null`로 두어 미검사 보류**한다. 통과로 위장하지 않는다.

## 4. 추출 후 셀프체크 — semantic 변환 완전성

추출 스크립트를 돌린 직후, `evaluate.mjs`에 넘기기 전에 **추출 결과(Element 배열)를 스스로 점검한다.** 추출이 조용히 어긋나면 — 특히 alias 역추적이 실패해 정상 semantic이어야 할 노드가 raw/unknown으로 떨어지면 — evaluate 결과만 보고는 놓치기 쉽다. 이 체크는 그걸 막는 안전장치다.

**1순위 — semantic 변환 완전성(반드시 확인):** component 변수 진입점(`💙 {Component}/Color` 소속, 즉 alias 체인 depth≥3 후보)이 **하나도 빠짐없이 semantic까지 풀려 semantic 이름이 복원됐나?** component를 진입점으로 바인딩했는데 결과가 `raw`/`unknown`으로 떨어진 건이 있으면 **alias 역추적 실패를 의심**한다. 그 노드가:

- **시안의 실제 상태**(애초에 변수 미바인딩 raw)인지, 아니면
- **스크립트가 체인을 못 따라간 것**(mode 잘못 고름·`getVariableByIdAsync` null·remote 미import)인지

를 구분해 확인한다. 후자면 추출 스크립트를 고쳐 재실행한다.

**보조 점검:**

2. `tokenStatus:'ok'` 건의 `token`이 전부 `colors.*` 형태(스키마 키 변환 성공)인가? `color-` 접두 변환이 누락된 건이 없는지.
3. `raw`/`unknown` 건수가 `get_screenshot`·`get_metadata`로 본 시안과 모순 없나? **raw가 갑자기 폭증하면 추출 이상 신호**다(예: 6 variant 중 5개는 semantic인데 1개만 raw면 그 1개를 따로 확인).
4. 전경 노드(TEXT/아이콘)의 `backgroundHex`가 조상 컨테이너 fill과 일치하나?(배경 전파 정상성, §3) 못 잡았으면 `null`인 게 정상이고, 엉뚱한 hex가 들어갔으면 전파 로직을 본다.
5. **focus ring 배경 교정 점검(outset 케이스):** 이름이 `/focus|ring/i`인 stroke 요소가 있으면, 그 `backgroundHex`가 **컴포넌트 내부 fill(예: checked 박스 색)을 물고 있지 않은지** 확인한다. 정상은 ⓐ 컴포넌트 바깥 배경 hex 또는 ⓑ `null`(바깥 배경 미상 → 미검사 보류) 둘 중 하나다. 직속 조상의 박스 fill이 들어가 있으면 `outerBgHex` 전파가 누락된 것 — 추출 스크립트를 고쳐 재실행한다. (추출은 매 실행 새로 짜는 비결정 단계라, 이 점검이 교정 누락을 잡는 안전장치다.)

> **셀프체크 실패 시**: 추출 스크립트의 결함이면 고쳐서 재실행한다. 시안 자체의 문제(디자이너가 토큰 안 씀)면 **정직하게 raw/unknown으로 보고**하고 통과로 위장하지 않는다(불변 원칙 8과 동일). 셀프체크는 "스크립트 결함"과 "시안 결함"을 가르는 단계지, 시안 결함을 덮는 단계가 아니다.
