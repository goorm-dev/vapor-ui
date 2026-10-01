---
name: vapor-figma-compose
description: Vapor core 라이브러리(Figma 팀 라이브러리 "Vapor Design System") 컴포넌트로 Figma 시안을 조립한다. instance를 detach하지 않고 원본 컴포넌트를 바라보게 유지하는 것이 목표다. 디자이너가 "vapor로 시안 만들어줘", "이 화면 Figma에 그려줘", "결제 확인 Dialog 시안", "vapor 컴포넌트로 목업", "Figma에 폼 화면 만들어줘", "compose a Figma screen with Vapor components"처럼 말하거나, Figma 파일 URL을 주며 vapor 컴포넌트로 화면·모달·폼을 만들거나 고쳐 달라고 하면 반드시 이 스킬을 쓴다. 코드 구현(Figma → React)은 vapor-ui 스킬, 토큰 검수는 token-usage-review 스킬 소관이다.
---

# Vapor core 컴포넌트로 Figma 시안 조립

**목표: 시안의 모든 vapor 컴포넌트가 라이브러리 원본과 연결된 instance로 남는다.** detach는 라이브러리가 표현하지 못하는 요구가 있을 때만 쓰는 최후 수단이고, 쓰면 반드시 표시하고 보고한다. detach된 레이어는 라이브러리가 업데이트돼도 따라가지 않고, 개발 핸드오프 때 어떤 컴포넌트인지 알 수 없게 된다.

**범위: core 라이브러리만.** Composites(`[Composites] Vapor Design System`), Alpha·Archive·Deprecated 컴포넌트는 쓰지 않는다. 요청에 core에 없는 컴포넌트가 필요하면 그 사실을 보고하고, 대체안(core 조합)을 제안한다.

## 시작 전 필수

- **`figma-use` 스킬을 먼저 로드한다.** 모든 `use_figma` 호출 규칙(색 범위, 폰트 로드, page 전환, `return`으로만 출력 등)이 거기 있다. Figma 공식 plugin이 설치돼 있어야 한다.
- **대상 Figma 파일 URL을 받는다.** 없으면 `create_new_file`로 drafts에 만든다.
- [references/catalog.md](references/catalog.md)를 읽는다 — 컴포넌트 이름 → key → 상세 파일 색인이다.

### 라이브러리 key

`search_design_system`은 `includeLibraryKeys`로 한정하지 않으면 V1.0·Kid·Site·Community·레거시 라이브러리 결과가 섞여 나온다. 아래 key로 한정한다. 이 도구는 **호출 1회에 쿼리 1개만** 처리하니 컴포넌트·토큰마다 따로 호출한다.

| 라이브러리                      | 용도                                                           | libraryKey                                                                                                                            |
| ------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Vapor Design System             | core 컴포넌트                                                  | `lk-2085bf5ecc9782f8d58fa756be1ad6bb533e6967dd39eec7c9fb7ab4a7dc7b52b1249ee418b225444a5416432dd36e2d10dc982b1329d141115780fcf521e6f7` |
| [V2.0] [Goorm theme] Foundation | 색·간격 변수, Text Style                                       | `lk-7886ae01051a0e537a8f7f12d057999c77db2a7d267f3a7d323c5dbac9ae8b58ebcbd7a976b384e4c819a61d82abee32c4a00057c97aac10aea9d6f209451791` |
| Icon [goorm]                    | 아이콘 (Community 라이브러리의 같은 이름 아이콘은 쓰지 않는다) | `lk-929890530de6c44edcef6f532f68a16cff0c3147d3f42b54f38e55bc925a5b270f096eb2f7b9284b7e10e9f80bf4819bd9aa6f03c5bf496c8473dbb083175d47` |

## 맥락은 네 곳에서 온다

| 출처                          | 무엇을 얻나                                                                                          | 언제                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **A. 이 스킬의 references**   | key, 구조 경로(라벨이 어느 레이어에 있나), swap 대상, 알려진 버그와 우회법, Guidelines·do/don't 요약 | 쓸 컴포넌트마다 `references/components/<name>.md`를 읽는다                                 |
| **B. 라이브러리 실시간 읽기** | variant 값, 속성 이름의 `#…` ID 접미사, 컴포넌트 `description`                                       | 조립 직전, `use_figma`로 읽는다 (아래 코드)                                                |
| **C. 토큰**                   | 색 변수, Text Style                                                                                  | `search_design_system`. **반드시 `[V2.0] [Goorm theme] Foundation` 라이브러리로 한정**한다 |
| **D. 대상 파일**              | 기존 화면, 레이아웃, 이미 쓰인 컴포넌트                                                              | `get_metadata` · `get_screenshot`                                                          |

속성 이름과 값은 references에 적힌 것을 믿지 말고 **B로 실시간으로 읽는다.** 라이브러리는 계속 바뀐다. references는 "어디를 봐야 하는지"를 알려주는 지도다.

## 워크플로우

1. **요청을 컴포넌트로 분해한다.** 화면의 각 영역에 어떤 core 컴포넌트가 들어갈지 정하고, catalog에서 찾는다.
2. **Guidelines·Usecase를 대조한다.** 각 컴포넌트 파일의 `## Guidelines`와 `## Usecase`를 요청과 대조한다.
    - 요청이 **정하지 않은 부분**은 가이드를 따른다(예: 취소 버튼이 있으면 Header close 아이콘을 끈다, 위험한 확인 버튼은 danger).
    - 요청이 **명시한 것**(컴포넌트 종류, 문구, 개수)이 가이드와 충돌하면 요청대로 만들고, 보고의 "가이드 대조"에 충돌과 대안을 적는다. 디자이너가 쓴 문구를 임의로 고치지 않는다.
3. **어긋남을 점검한다.** 쓸 컴포넌트를 `search_design_system`(core 라이브러리 키로 한정)으로 조회해 `updatedAt`을 본다. 컴포넌트 파일의 `reviewedAt`보다 새로우면 "references가 오래됐을 수 있음"을 보고에 적고, B로 읽은 실제 구조를 우선한다.
4. **실시간으로 읽는다** (B). 쓸 컴포넌트의 속성 정의를 한 번의 `use_figma`로 읽는다. 중첩 구조(어느 레이어에 무엇이 있나)는 import한 component에서는 비어 보일 수 있다 — **임시 instance를 만들어 읽고 지운다.**
5. **조립한다.** 아래 "보존 사다리" 순서로만 편집한다.
6. **검수한다.** 아래 검수 코드를 돌리고, 스크린샷을 1회 찍어 눈으로 확인한다. raw 색이 의심되면 `token-usage-review` 스킬로 넘긴다.
7. **보고한다.** 아래 보고 형식대로.
8. **신규 라이브러리 이슈를 기록한다 — 디자이너 확인 후.** 아래 "라이브러리 이슈 기록" 절차를 따른다. 신규 이슈가 없으면 건너뛴다.

## 보존 사다리

앞 단계로 해결되면 거기서 멈춘다. 아래로 내려갈수록 원본과의 연결이 약해진다.

1. **variant / boolean 속성** — `instance.setProperties({ size: 'lg' })`
2. **text 속성** — `setProperties({ 'label#123:4': '저장' })`. 텍스트 레이어의 `characters`를 직접 바꾸지 않는다(속성이 없을 때만 5번).
3. **instance swap 속성** — 아이콘·하위 컴포넌트 교체. `INSTANCE_SWAP` 속성이 있으면 그것을, 없으면 중첩 instance의 `swapComponent()`.
4. **슬롯 채우기** — core에는 두 종류의 슬롯이 있다. 컴포넌트 파일의 구조 트리가 어느 쪽인지 알려준다.
    - **SlotLayer placeholder (대부분)** — 🟨`…/SlotLayer`가 일반 INSTANCE로 들어 있다. 라이브러리에 맞는 swap 대상이 있으면 그것으로, 없으면 내용을 **로컬 컴포넌트로 만들어** `slotLayer.swapComponent(localComponent)`로 교체한다.
    - **네이티브 SLOT (SegmentedControl, RadioGroup, Table, Toolbar 등)** — 속성 타입이 `SLOT`이고 instance 안에 `type === 'SLOT'` 노드가 있다. `setProperties`로는 못 바꾼다. `inst.findAll(n => n.type === 'SLOT')`의 레이어 순서대로 `slot.appendChild(child)`로 넣는다. 넣을 컴포넌트는 그 SLOT 속성의 `preferredValues`(key 목록)에서 고른다. **넣은 뒤에는 노드 id가 바뀐다**(`I<instance>;…` 형태) — 이후 편집은 `slot.children`에서 다시 찾는다.
    - 로컬 컴포넌트는 화면 프레임 옆 `Local components` 섹션에 모아 둔다. 너비를 슬롯 너비에 맞춰 만들고, swap한 뒤 그 instance에 `layoutSizingHorizontal = 'FILL'`을 준다. 안의 텍스트는 Text Style, 색은 토큰 변수를 쓴다.
5. **링크를 유지한 override** — 속성으로 노출되지 않은 텍스트·fill을 직접 바꾼다. 색은 반드시 변수 바인딩(`setBoundVariableForPaint`)으로. **core에는 TEXT 속성이 없는 라벨이 많다**(Select·Menu Item, Tabs, Tooltip, Table Cell, Pagination 등). 이 경우 텍스트 레이어의 `characters`를 바꾸는 게 정상 경로다 — 폰트를 먼저 로드한다.
6. **detach — 최후 수단.** `detachInstance()` 전에 1~5로 정말 안 되는지 다시 확인한다. 하면 레이어 이름을 `⚠ detached: <사유>`로 바꾸고 보고에 넣는다. 사유는 "라이브러리에 무엇이 없어서"로 쓴다(예: "Dialog footer에 버튼 3개를 넣을 slot 없음"). 이 사유가 라이브러리 개선 백로그가 된다(워크플로우 8단계에서 기록).

### 슬롯 정리 (매번 확인)

placeholder의 미리보기 스타일이 결과에 남는 경우가 많다. 아래는 사다리 5번(override)이며 detach가 아니다.

- **SlotLayer swap 뒤**: 회색 fill과 테두리가 남는다. swap한 instance에서 `fills = []`, `strokes = []`.
- **SlotLayer variant 프리셋을 고른 뒤**(예: 🟨Field/SlotLayer `type=TextInput`): 미리보기용 패딩·배경이 남을 수 있다. 컴포넌트 파일의 "알려진 버그와 우회"를 따른다.
- **네이티브 SLOT을 일부만 채운 뒤**: 빈 SLOT이 회색 칸으로 보이고 너비를 차지한다. 빈 SLOT에 `visible = false`.

## 공통 규칙

- **접두사로 고른다.** 💙 = 디자이너가 쓰는 공개 컴포넌트. 🟨 = SlotLayer·내부 파트(swap 대상으로만 쓴다). 🔶 = InteractionLayer, 🟩 = RenderLayer, ❤️ = 아이콘 슬롯(건드리지 않는다, 아이콘은 swap 속성으로). 🟣 = Pattern. 이름 끝에 `[@goorm-dev/vapor-core]`, `[@goorm-dev/vapor-components]`가 붙은 것은 **레거시**라 쓰지 않는다. 검색 결과에 섞여 나온다. 접두사가 없는 공개 파트도 있다(FloatingBar, Popover Body 등) — 컴포넌트 파일을 따른다.
- **import는 key로, 이름으로 하지 않는다.** 같은 이름의 컴포넌트가 둘 이상인 경우가 있다(`🟨\bSelect/SlotLayer` 두 벌, `💙Toolbar.Button` 두 벌 등). 컴포넌트 파일에 적힌 key를 쓴다.
- **이름으로 레이어를 찾을 때는 정규화한다.** 이름에 백스페이스(`\b`), 이모지 뒤 공백(`💙 Select.Item`), 끝 공백(`💙Menu.CheckboxItem `)이 섞여 있다. 비교 전에 `name.replace(/[\u0000-\u001f]/g, '').replace(/\s+/g, '')`로 정규화한다.
- **값과 속성 이름은 원문 그대로 쓴다.** 제어문자가 섞인 값이 있다(Button `variant`의 `"\bghost"`, Breadcrumb `size`의 `"\bsm"`, Field `type`의 `"\bcheckbox"` 등). `setProperties`에는 정의에서 읽은 문자열을 그대로 넣는다.
- **없는 variant 조합이 있다.** Switch·TextInput·Textarea·Checkbox 등은 속성 조합의 일부만 variant로 존재한다. `setProperties`가 조합 오류로 실패하면 component set의 `children` 이름에서 실제 있는 조합을 확인하고 가장 가까운 조합을 고른 뒤 보고에 적는다.
- **속성 이름은 접두사로 찾는다.** `#` 뒤 ID는 바뀔 수 있다: `Object.keys(inst.componentProperties).find(k => k.startsWith('taxt#'))`.
- **텍스트는 Text Style을 쓴다.** `[V2.0] [Goorm theme] Foundation`의 `body1~4`, `heading*` 등을 `importStyleByKeyAsync`로 불러와 `textStyleId`를 지정한다. `fontSize`를 직접 쓰지 않는다.
- **색은 토큰 변수만.** `[V2.0] [Goorm theme] Foundation`의 `● Token/Color` 컬렉션(예: `foreground/foreground-normal`). 이름이 비슷한 V1.0·Kid·Site·Community 라이브러리 변수를 쓰지 않는다.
- **간격도 토큰 변수.** auto-layout의 `itemSpacing`·padding은 Foundation `● Token/Scaling`의 `size/size-space-*` 변수를 `setBoundVariable('itemSpacing', v)` 등으로 바인딩한다(변수 값은 `resolveForConsumer` 또는 `valuesByMode`로 확인하고 원하는 px에 맞는 것을 고른다).
- **레이아웃 컨테이너는 auto-layout.** 컴포넌트를 담는 화면 프레임은 `figma.createAutoLayout()`으로 만든다. 화면·폼 배경은 `background/canvas/canvas-base`, 단순 묶음(행·그룹)은 `fills = []`.
- **variant는 instance를 만든 뒤 고른다.** `set.defaultVariant.createInstance()` → `inst.setProperties({ size: 'md', ... })`. children 이름을 문자열로 찾지 않는다.
- **import가 실패하는 key는 상위 instance 안에서 바꾼다.** 내부 전용으로 publish되지 않은 파트가 있다(Select Popup 안 슬롯 등). 그 파트를 품은 상위 컴포넌트를 instance로 만든 뒤 안에서 `setProperties`.

## 코드 조각

### 실시간 속성 읽기 (워크플로우 4)

```js
// KEYS: references/components/*.md 에서 가져온 key. set = component set, comp = 단일 component
const KEYS = { Dialog: ['set', '8d3b8f457fd498e1789857600411cabf64c905a1'] };
const out = {};
for (const [name, [kind, key]] of Object.entries(KEYS)) {
    const node = kind === 'set' ? await figma.importComponentSetByKeyAsync(key) : await figma.importComponentByKeyAsync(key);
    const owner = node.type === 'COMPONENT' && node.parent?.type === 'COMPONENT_SET' ? node.parent : node;
    const props = {};
    for (const [p, d] of Object.entries(owner.componentPropertyDefinitions)) {
        props[JSON.stringify(p)] = { type: d.type, default: d.defaultValue, values: d.variantOptions?.map((v) => JSON.stringify(v)) };
    }
    out[name] = { name: owner.name, description: owner.description, props };
}
return out;
```

`JSON.stringify`로 감싸는 이유: 제어문자가 섞인 이름·값이 눈에 보이게 된다(`"\bghost"`).

### 검수 (워크플로우 6)

```js
const root = await figma.getNodeByIdAsync('ROOT_ID');
const all = root.findAll(() => true);
const instances = all.filter((n) => n.type === 'INSTANCE');
const rawFills = all.filter((n) => 'fills' in n && Array.isArray(n.fills) && n.fills.some((f) => f.type === 'SOLID' && f.visible !== false && !f.boundVariables?.color));
const rawText = all.filter((n) => n.type === 'TEXT' && !n.textStyleId);
// 이름을 바꾸지 않은 detach도 잡는다: detach된 frame은 detachedInfo가 있다
const detached = all.filter((n) => n.type === 'FRAME' && n.detachedInfo);
return {
    rootIsInstanceOrHasInstances: root.type === 'INSTANCE' || instances.length > 0,
    total: all.length,
    instances: instances.length,
    detached: detached.map((n) => [n.id, n.name, n.name.startsWith('⚠ detached') ? 'labeled' : 'UNLABELED']),
    rawFills: rawFills.map((n) => [n.id, n.name]),
    textWithoutStyle: rawText.map((n) => [n.id, n.name]),
};
```

`rawFills`와 `textWithoutStyle`은 우리가 만든 로컬 노드에서만 문제다. 라이브러리 instance 내부에서 나온 항목은 라이브러리 쪽 사정이므로 보고만 한다.

## 보고 형식

```
## 결과
- 프레임: <Figma 링크>
- instance <n>/<total>, 최상위: <instance|frame>
- detach: <0건 | 목록 + 사유>

## 가이드 대조
- <컴포넌트>: <지킨 가이드 / 이탈과 이유>

## 라이브러리 이슈
- <조립 중 만난 버그·우회. references에 없던 것이면 "신규"로 표시>

## references 신선도
- <reviewedAt보다 새로 갱신된 컴포넌트 목록, 없으면 "모두 최신">
```

## 라이브러리 이슈 기록

조립 중 만난 라이브러리 문제(속성 미연결, 제어문자, 오타, 잘못된 variant, detach를 부른 기능 부재 등)는 Vapor 팀의 노션 DB에 남긴다. 팀 공유 DB라 **디자이너에게 확인받기 전에는 쓰지 않는다.**

1. **신규만 고른다.** 해당 컴포넌트 파일의 "알려진 버그와 우회"에 이미 있는 이슈는 제외한다.
2. **노션에서 중복을 확인한다.** 노션 검색으로 `Vapor CS Archive` data source를 찾아, 그 안에서 `컴포넌트명`이 같고 `제목`이 `[Figma]`로 시작하는 행을 조회해, 같은 내용이 있으면 제외한다.
3. **디자이너에게 묻는다.** 남은 이슈를 제목 한 줄씩 보여주고 "노션 Vapor CS Archive에 기록할까요?"라고 한 번 묻는다. 고른 것만 기록한다.
4. **행을 만든다.** 이슈 하나에 행 하나.

| 속성       | 값                                                      |
| ---------- | ------------------------------------------------------- |
| 제목       | `[Figma] <컴포넌트> <현상 한 줄>`                       |
| 문의 종류  | `버그 리포트` (기능 부재로 detach한 경우는 `기능 요청`) |
| 패키지     | `Vapor UI - Core`                                       |
| 상태       | `미완료`                                                |
| 컴포넌트명 | 컴포넌트 이름 (여럿이면 `, `로 구분)                    |

본문 형식:

```
## 현상
<무엇이 어떻게 다른가. 속성 이름·값은 JSON.stringify한 원문 그대로>
## 재현
<key, 호출한 API, 고른 variant>
## 영향
<디자이너·자동화가 겪는 문제>
## 우회
<이번에 쓴 우회. 없으면 "확인 못 함">
---
발견: <시안 Figma 링크>
```

노션 도구가 없거나 DB에 쓸 권한이 없으면, 위 형식의 마크다운을 이슈별로 출력하고 "노션 Vapor CS Archive에 붙여 넣어 주세요"라고 안내한다.
