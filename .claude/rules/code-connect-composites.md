---
paths:
    - 'packages/composites/src/**/*.figma.ts'
    - 'packages/composites/src/**/*.figma.batch.*'
    - 'packages/composites/src/utils/figma-utils.ts'
    - 'packages/composites/figma.config.json'
---

# Figma Code Connect 템플릿 (composites)

`@figma/code-connect` v2 raw template 포맷으로 Composites 컴포넌트의 Dev Mode 스니펫을 작성한다. 템플릿 파일은 각 컴포넌트의 `code-connects/` 디렉터리에 둔다. 전역 설정은 `packages/composites/figma.config.json`이 보유한다.

## 1. 작성 방식 선택 — batch 또는 single

서브 컴포넌트(dot-notation 부품 혹은 `renderInnerInstances`로 재귀 렌더되는 자식 instance) 보유 여부로 두 방식 중 하나를 선택한다.

| 서브 컴포넌트 | 방식       | 파일 쌍                                                       |
| ------------- | ---------- | ------------------------------------------------------------- |
| 보유          | **batch**  | `<component>.figma.batch.json` + `<component>.figma.batch.ts` |
| 미보유        | **single** | `<component>.figma.ts`                                        |

접미사 `.figma.batch.{ts,json}`과 `.figma.ts`는 `@figma/code-connect` CLI 하드코딩이다. 접미사를 바꾸면 CLI가 batch로 인식하지 못하거나 raw template으로 파싱하지 못한다. 설정의 `codeConnect.include`도 두 접미사를 모두 커버해야 한다.

## 2. Batch 방식

### 2-1. `<component>.figma.batch.json`

- 최상위 `templateFile`에 짝이 되는 `.figma.batch.ts`의 상대 경로를 둔다.
- `components` 배열에 서브 컴포넌트별 엔트리를 둔다. 각 엔트리 필드:
    - `part` — Code Connect ID이자 `.figma.batch.ts` switch 분기 값. kebab-case (예: `menu-root`, `dialog-action`).
    - `component` — Figma Dev Mode에 표시될 컴포넌트 경로 (예: `Menu.Root`).
    - `source` — 원본 TSX 상대 경로.
    - `url` — Figma 노드 URL.
- 그 외 커스텀 필드는 그대로 `figma.batch`로 노출되므로 분기 외 데이터가 필요하면 자유롭게 추가한다.

### 2-2. `<component>.figma.batch.ts`

- 파일 상단에 directive 주석은 두지 않는다. `url`·`component`·`source`는 batch.json 엔트리값이 공급한다.
- `import figma from 'figma'`와 상대 경로 helper(`../../../utils/figma-utils`)만 import한다. 그 외 import는 번들러가 거부한다.
- 엔트리 접근은 캐스팅 없이 `const batch = figma.batch;`로 받는다.
- **서브 컴포넌트별 섹션을 `build<SubComponentName>()` 함수로 분리한다.** 각 함수는 `{ example, imports }` 객체를 반환한다.
- 여러 섹션이 공유하는 로직은 별도 헬퍼로 추출한다 (예: 버튼 slotLayer 추출 → `buildButtonSlot()`).
- 최하단에 `build()` 디스패처를 두고 `switch (batch.part)`로 분기한다. `case`와 batch.json의 `part`는 1:1 매칭.
- 마지막 `export default`는 다음 형태로 고정한다:
    ```ts
    const result = build();

    export default {
        id: batch.part,
        imports: result?.imports,
        example: result?.example,
        metadata: { nestable: true },
    };
    ```

> 런타임은 모듈의 마지막 `export default`만 `return`으로 치환하고, 자식 함수가 반환한 `figma.code` 템플릿은 호출 지점에 인라인한다. 따라서 `build*()` 함수가 `figma.code` 템플릿을 반환해도 안전하다.

## 3. Single 방식

- 파일명 `<component>.figma.ts`.
- 파일 상단에 `// url=`, `// source=`, `// component=` directive 세 줄을 둔다. raw template 판별이 이 directive로 이뤄진다.
- 모듈 바디에서 `figma.selectedInstance`로 인스턴스를 받고 `getProperties`/`renderInnerInstances`로 props를 뽑는다.
- `export default { example, imports, id, metadata: { nestable: true } }` 한 번만 둔다.
- `id`는 kebab-case로 작성한다.

## 4. 공통 규칙

- Figma 노드 조작은 `../../../utils/figma-utils`의 `getProperties`·`renderInnerInstances`·`findChild`만 사용한다. helper는 그 파일 한 곳에만 둔다.
- `../../../utils/figma-utils`를 import 할 때 상대 경로만 사용한다.
- `getProperties(instance, nodeName, spec)` 두 번째 인자는 하위 노드 이름 문자열(예: `'(Popup)'`, `'(Header)'`, `'(Footer)'`, `'Item'`) 또는 `null`(=instance 자체)이다. 괄호 네이밍은 Figma frame 이름을 그대로 쓴 것이다.
- `example`의 JSX 문자열은 소비자가 그대로 복사해 쓸 수 있어야 한다. 결정이 필요한 자리(트리거, aria-label 등)에는 `// TODO: ...` 또는 `/* TODO: ... */` 주석으로 명시한다.
- 템플릿 파일을 추가/삭제할 때 `packages/composites/figma.config.json`의 `codeConnect.include` 패턴이 새 파일을 커버하는지 확인한다. 현재 패턴은 `src/**/*.figma.ts` + `src/**/*.figma.batch.json`이다.

## 체크리스트

- [ ] 서브 컴포넌트 보유 여부에 맞게 batch 또는 single 방식을 선택했다.
- [ ] batch 방식이면 `.figma.batch.json`의 `components[]` 엔트리와 `.figma.batch.ts`의 `switch (batch.part)` case가 1:1로 매칭된다.
- [ ] 서브 컴포넌트별 로직이 `build<SubComponentName>()` 함수로 분리되어 있고, 공유 로직은 별도 헬퍼로 추출되어 있다.
- [ ] 모든 템플릿의 `export default` 형태가 `{ id, imports, example, metadata: { nestable: true } }`이다.
- [ ] 모든 `id`가 kebab-case이고 batch 방식에서는 엔트리의 `part`와 일치한다.
- [ ] `figma.config.json`의 `codeConnect.include` 패턴이 추가/변경된 파일을 커버한다.
