# RFC-0002: Figma 시안의 정답 트리를 만드는 도구 figma-blueprint

- **상태**: Draft
- **제안자**: @MaxLee-dev
- **댓글 마감**: 2026-11-16
- **관련 이슈**: VAPOR-318

## Summary

`@vapor-ui/figma-blueprint`를 npm 패키지로 만듭니다. Figma 시안이 요구하는 vapor-ui 요소를 정답 트리로 내는 도구입니다. 시안의 노드 트리를 Figma REST API로 받고, 레포의 Code Connect 템플릿을 직접 실행해 라이브러리 인스턴스마다 태그와 props, Figma node id, 박스를 붙인 노드를 만듭니다. 템플릿은 각 컴포넌트 패키지(core, composites, icons)가 컴파일해 함께 배포하므로, 정답은 소비자 레포에 설치된 버전을 따릅니다.

정답 트리 옆에는 시각 점수에 쓸 시안 정보도 함께 냅니다. 채점하는 프레임의 크기와 텍스트 줄의 박스입니다.

생성 코드가 정답을 만족하는지는 이 패키지가 판정하지 않습니다. 판정은 Claude 플러그인 스킬의 검증 에이전트가 코드를 직접 읽고 노드 id마다 내립니다. 정답은 결정적이어야 하고, 판단이 필요한 것은 "이 코드가 정답을 만족하나"뿐이기 때문입니다.

## Motivation

에이전트가 Figma 시안을 vapor-ui 코드로 옮기면, 시안에 놓인 컴포넌트와 그 variant가 코드에 모두 들어갔는지 확인해야 합니다.

Figma MCP만 사용하여 Code Connect 스니펫을 모아 정답을 만드는 방식에는 아래의 문제가 존재합니다.

- Figma에서 디자인 맥락 정보를 받아오는 경우 하위 요소가 placeholder로 감싸져 있는 경우에는 하위 요소에 들어간 컴포넌트를 확인하기 위해 figma mcp요청을 매번 해야 합니다.

처음 설계는 정답을 만든 뒤 생성 코드의 JSX를 정적으로 스캔해 대조까지 했습니다. 시안은 하나의 틀 안에서 만들어지지만 제품 코드는 복잡한 모듈 구조 속에 있습니다. 스캐너는 여러 파일, spread props, `.map()` 행까지는 따라가지만 `memo()`·`forwardRef()`·HOC로 감싼 컴포넌트와 모듈마다 이름이 겹치는 로컬 컴포넌트는 따라가지 못합니다. 범용 스크립트로 모든 코드 모양을 덮기는 어렵습니다. 그래서 정답 생성과 판정을 나눕니다.

| 쪽                                | 하는 일                                 | 결정적? |
| --------------------------------- | --------------------------------------- | ------- |
| `@vapor-ui/figma-blueprint`       | 시안 → node id가 붙은 정답 트리         | 예      |
| 플러그인 스킬의 검증 서브에이전트 | 코드를 읽고 시안 노드와 짝지어 판정한다 | 아니오  |

## Detailed Design

### 용어

| 용어        | 뜻                                                                                                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 정답 트리   | 한 시안에서 생성 코드에 반드시 있어야 하는 요소의 트리. 노드 하나는 태그, 리터럴 props, Figma node id로 이루어진다                                         |
| 노드 id     | 노드를 쓴 템플릿의 Figma 인스턴스 id. 템플릿 하나가 요소를 여럿 쓰면 첫 요소는 `<id>`, 나머지는 스니펫 순서대로 `<id>#1`, `<id>#2`이다                     |
| 제외 사유   | 시안이 그리는 라이브러리 인스턴스가 정답 트리에 들어가지 않는 이유에 붙인 이름                                                                             |
| 채점 불가   | 시안의 정보 일부를 확인할 수 없어서 그 시안은 끝까지 채점할 수 없다는 결과                                                                                 |
| `entries`   | Figma 컴포넌트 키 → Code Connect 템플릿(batch면 그 행)의 표. 패키지마다 `figma-entries.json`으로 커밋하고, `figma-blueprint entries`가 Figma에 물어 만든다 |
| ship        | 컴포넌트 패키지를 빌드할 때 템플릿과 헬퍼를 JS로 컴파일해 표와 함께 `figma-blueprint/` 폴더에 담는 단계. `figma-blueprint ship`이 한다                     |
| `Catalog`   | 정답 트리를 만드는 쪽이 템플릿과 표를 받는 포트 `{ entries, tables, runTemplate }`. `fromRepo`와 `fromInstalled`가 만든다                                  |
| `blueprint` | 시안 트리와 `Catalog`를 받아 정답 트리를 내는 함수                                                                                                         |
| 박스        | 채점하는 프레임의 왼쪽 위를 원점으로 한 Figma 노드의 `{ x, y, w, h }`. 템플릿 하나가 쓴 요소는 모두 그 인스턴스의 박스를 함께 쓴다                         |

```text
<Dialog.Popup />  3066:58954
  <Dialog.Header />  I3066:58954;32449:9769
  <Dialog.Footer />  I3066:58954;32449:9771
    <Button size="lg" colorPalette="primary" variant="fill" />  I3066:58954;32449:9771;32449:9773;32449:9682
unscorable:
  Nav/신분증/💙Dialog.Body (I3066:58954;32449:9770): no-template
texts: 15
```

### 동작

figma-blueprint는 Figma 서버가 하는 일을 로컬에서 재현합니다.

1. 시안 프레임의 노드 트리를 Figma REST API로 받습니다.
2. 트리를 돌며 라이브러리 컴포넌트 인스턴스마다 매핑 표에서 Code Connect 템플릿을 찾습니다.
3. 템플릿을 실행합니다. 템플릿이 import하는 `figma` 모듈 자리에는 REST 노드를 읽어 같은 API(`selectedInstance`, `getEnum`, `getInstanceSwap`, `findConnectedInstances` 등)를 제공하는 대역을 넣습니다.
4. 템플릿이 낸 JSX 스니펫에서 시안이 실제로 그리는 파트만 남겨 노드로 만들고, 가장 가까운 라이브러리 조상 노드 아래에 둡니다.
5. 같은 트리에서 텍스트 줄을 모읍니다.

MCP, Figma 앱, OAuth 없이 `FIGMA_ACCESS_TOKEN` 하나로 동작합니다. 토큰은 셸 환경 변수나 현재 디렉터리의 `.env`에서 읽습니다. 시안 트리 JSON을 직접 넘기면 토큰도 필요 없습니다.

### 패키지 구성

`packages/figma-blueprint`에 `@vapor-ui/figma-blueprint`를 새로 만들고 PoC를 TypeScript로 옮깁니다. `typescript`는 JSX 파싱에 쓰는 정식 dependency가 됩니다.

| 진입점                                                              | 역할                                                              |
| ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `figma-blueprint <tree.json \| Figma URL> [--json] [--repo <root>]` | 정답 트리와 텍스트 줄을 출력한다                                  |
| `figma-blueprint ship`                                              | 컴포넌트 패키지 빌드에서 템플릿과 표를 컴파일한다                 |
| `figma-blueprint entries`                                           | 토큰으로 `entries` 표를 생성한다. 사람이 실행하고 결과를 커밋한다 |
| `figma-blueprint library`                                           | 토큰으로 발행된 Figma 라이브러리를 `entries`·예외 목록과 대조한다 |
| JS API `blueprint`, `fromInstalled`, `fromRepo`                     | 비공개 벤치가 import해서 쓴다. 플러그인 스킬은 CLI를 실행한다     |

빌드는 `@vapor-ui/codemod`처럼 tsup으로 합니다. `src`는 바뀔 수 있는 결정 하나를 모듈 하나가 맡도록 나눕니다. 바깥 시스템(Figma REST API, Code Connect, `@vapor-ui` 패키지)마다 모듈이 하나 있고, 흐름이 만드는 산출물(`figma-entries.json`, `figma-blueprint/` 폴더와 `Catalog`, 정답 트리, 라이브러리 점검)마다 모듈이 하나 있습니다. 한 형식을 쓰는 쪽과 읽는 쪽은 같은 모듈에 둡니다. import는 아래 표에서 위쪽 잎 모듈(`figma.ts`, `packages.ts`, `code-connect/files.ts`) 방향으로만 향하고, `eslint.config.mjs`의 zone 규칙이 이 방향을 강제합니다.

| 모듈                       | 맡는 결정                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| `figma.ts`                 | Figma REST API. 노드 트리 타입, URL 해석, `FIGMA_ACCESS_TOKEN`, 요청. `fetch`는 여기서만 부른다 |
| `packages.ts`              | `@vapor-ui` 패키지 목록, 라이브러리 표시(💙 ❤️ 🩵), 빌드할 때 담는 composites 키                |
| `code-connect/files.ts`    | Code Connect 파일 형식. `figma.config.json` 범위, `// url=`·`// component=` 헤더, batch 행      |
| `code-connect/compile.ts`  | 템플릿을 실행할 수 있는 모듈로 쓰고(ship은 `.mjs`, `fromRepo`는 `.mts`) 다시 import한다         |
| `code-connect/stand-in.ts` | 템플릿이 import하는 `figma` 모듈의 대역, `FIGMA_KEY`, 템플릿 id 읽기                            |
| `entries.ts`               | `figma-entries.json`의 형식과 읽기, 빠진 항목 검사, `figma-blueprint entries`                   |
| `catalog/catalog.ts`       | `figma-blueprint/` 폴더 구성, `figma-blueprint ship`, `Catalog` 포트와 어댑터 두 개             |
| `catalog/tables.ts`        | 소스에서 추출한 표                                                                              |
| `blueprint/blueprint.ts`   | REST 트리 → 정답 트리                                                                           |
| `blueprint/design.ts`      | REST 트리 → 텍스트 줄과 박스                                                                    |
| `blueprint/output.ts`      | 정답 트리 타입(`--json` 형식)과 텍스트 출력                                                     |
| `library.ts`               | `figma-blueprint library`와 `figma-exceptions.json`                                             |
| `cli.ts`                   | 명령 진입점                                                                                     |
| `index.ts`                 | JS API                                                                                          |

`code-connect/stand-in.ts`와 `blueprint/`는 데이터만 받습니다. REST 트리는 객체로 받고, I/O를 하는 모듈에서는 타입만 가져옵니다.

템플릿과 표는 `Catalog` 포트 `{ entries, tables, runTemplate }` 하나로 받습니다. 어댑터는 두 개입니다. `fromRepo`는 레포 소스에서 표를 추출하고 템플릿을 그 자리에서 변환해 실행합니다. `fromInstalled`는 `node_modules`에 설치된 컴포넌트 패키지의 `figma-blueprint/` 폴더를 읽습니다. 두 어댑터는 같은 변환 함수를 씁니다.

테스트는 소스 옆 `*.test.ts`에 두고, 손으로 만든 REST 트리는 `src/__fixtures__/*.json`에 둡니다.

### 템플릿과 표의 배포

core, composites, icons는 빌드할 때 `figma-blueprint ship`으로 자기 Code Connect 템플릿과 헬퍼(`utils/figma` 등)를 JS로 컴파일하고 아래 표와 함께 별도 폴더에 담아 배포합니다. `@vapor-ui/core`가 이미 `files: ["dist", "docs"]`로 문서를 함께 배포하는 것과 같은 방식입니다. figma-blueprint는 실행할 때 소비자 레포의 `node_modules`에서 이 폴더를 읽습니다. 그래서 정답 트리는 소비자가 실제로 설치한 버전의 API를 따릅니다.

| 표              | 내용                                                                                                                   | 출처                    | 쓰는 쪽                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------- |
| `entries`       | Figma 컴포넌트 키 → 템플릿(batch면 행)                                                                                 | Figma REST. 커밋된 파일 | 정답 트리                  |
| `internalIcons` | core 파트 → 스스로 그리는 아이콘 (`Select.Trigger`의 화살표)                                                           | core 소스               | 정답 트리(제외)            |
| `internalParts` | composites 파트 → 스스로 그리는 core 컴포넌트 (`Dialog.Root`의 닫기 `IconButton`)                                      | composites 소스         | 정답 트리(제외)            |
| `presets`       | composites wrapper → 렌더링하는 core 요소와 고정 props (`Dialog.Action` = `<Button size="lg" colorPalette="primary">`) | composites 소스         | 검증 에이전트(치환)        |
| `defaults`      | core 파트 → recipe `defaultVariants` (`Button`의 `variant="fill"`)                                                     | core 소스               | 검증 에이전트(생략값 보충) |

`entries`만 Figma에 물어야 만들 수 있습니다. 컴포넌트 키는 라이브러리를 발행할 때 Figma가 붙이는 값이라 레포에 없습니다. 키는 라이브러리를 다시 발행할 때만 바뀌므로, `figma-blueprint entries`로 생성한 결과를 각 패키지에 커밋합니다. 빌드와 PR CI에는 토큰이 필요 없습니다. 토큰은 main에서 매주 도는 job만 씁니다(아래 "검증" 참고). 나머지 네 표는 빌드할 때 소스에서 만듭니다.

core, composites, icons는 각각 아래처럼 바뀝니다.

- 패키지 루트의 `figma.config.json` 옆에 `figma-entries.json`을 커밋합니다. `figma-blueprint entries`가 생성합니다.
- 일부러 Code Connect를 연결하지 않는 라이브러리 컴포넌트는 `figma-exceptions.json`에 Figma 키와 사유로 적습니다. 사유가 비어 있으면 `library`가 실패합니다. 검사 대상은 core에서는 이름에 💙가 붙은 컴포넌트, composites에서는 전부이고, icons는 검사하지 않습니다.
- 빌드 산출물 `figma-blueprint/` 폴더를 `dist`와 나란히 둡니다. git에는 넣지 않고 `files`와 `clean` 스크립트에 추가합니다.
- `figma-blueprint/tables.json`에는 자기 패키지 몫의 `entries`와 나머지 네 표가 들어갑니다. core는 `internalIcons`와 `defaults`, composites는 `presets`와 `internalParts`를 가집니다.
- `figma-blueprint/templates/` 아래에 템플릿과 헬퍼를 소스 경로 그대로 컴파일합니다.
- `exports`에 `"./figma-blueprint/*": "./figma-blueprint/*"`를 추가합니다.
- `@vapor-ui/figma-blueprint`는 devDependencies(`workspace:*`)에만 넣습니다. 런타임 dependencies에는 넣지 않습니다.

`figma-blueprint ship`은 템플릿 모듈 본문을 함수로 감쌉니다. 인스턴스마다 `figma.selectedInstance`를 바꿔 다시 실행하기 위해서입니다. 이때 `import figma from 'figma'`는 `globalThis[Symbol.for('@vapor-ui/figma-blueprint')]` 조회로 바꿉니다. 컴파일된 템플릿은 figma-blueprint의 파일 경로를 몰라도 실행 중인 대역을 찾습니다.

### 정답 트리 규칙

정답 트리는 시안과 1:1이어야 합니다. 비교 대상은 MCP 응답이 아니라 시안 자체입니다.

- **노드가 담는 정보**는 라이브러리 인스턴스의 태그, Code Connect 템플릿이 표현하는 리터럴 props, 트리에서의 위치, 박스입니다. 텍스트 문구는 노드에 담지 않고 아래 "텍스트 줄과 박스"에서 따로 냅니다.
- 트리는 라이브러리 인스턴스끼리만 중첩합니다. 레이아웃 프레임은 노드가 되지 않으므로, 위치는 가장 가까운 라이브러리 조상이 같은지로 봅니다. 라이브러리 조상이 없는 노드는 최상위에 둡니다.
- self-closing 파트(`<Table.Column />`) 안의 슬롯처럼 Figma의 중첩이 코드의 중첩과 다른 자리의 노드는 `anyParent`를 받습니다. 읽기 편하도록 owner 템플릿의 루트 아래에 두지만, 위치는 판정하지 않습니다.
- Figma 텍스트에서 온 값과 `aria-label`은 값 대신 `"*"`로 씁니다. 있는지만 보라는 뜻입니다. 문구까지 비교하면 에이전트가 문구를 다듬었을 뿐인 올바른 구조가 불합격합니다.
- 숫자 prop은 Figma 속성에서 나올 수 없으므로 템플릿의 예시 값으로 보고 뺍니다.
- 값이 정확히 `...`인 문자열 prop(`<Radio.Root value="..." />`)도 템플릿이 넣은 예시 값으로 보고 뺍니다. 그 `...`가 Figma 텍스트에서 왔다면 다른 문구처럼 `"*"`로 씁니다.
- 자식이 `...`뿐인 요소(Dialog 템플릿의 `trigger={<Button>...</Button>}`)는 템플릿이 덧붙인 사용 예시라서 넣지 않습니다. 시안의 텍스트 자체가 `...`인 경우는 예시가 아니므로 남깁니다.
- Figma가 Code Connect로 연결하지 않은 **예전 발행본 사본**도 시안이 그리고 있으면 넣습니다. 이름이 매핑 표에서 유일하고, REST 응답의 `remote`가 `false`가 아닐 때(라이브러리에서 온 컴포넌트일 때)만 이름으로 찾습니다. 시안 파일에 직접 만든 `Dialog`는 이름이 같아도 라이브러리 사본이 아닙니다.
- 코드 작성자가 낼 수도 뺄 수도 없는 요소는 넣지 않습니다. composites Dialog의 `Header`는 조건 없이 `<CloseButton />`을 그리므로(`packages/composites/src/components/dialog/dialog.tsx`), 시안의 닫기 버튼은 제외 사유 "파트가 스스로 그림"을 받습니다. `internalParts`에 넣는 기준은 다음과 같습니다. 파트가 반환하는 JSX에서 core 요소까지 내려가는 길에 `&&`, 삼항, `if`, prop에 따른 분기가 하나도 없어야 합니다. 조건이 하나라도 있으면 작성자가 prop으로 조절할 수 있으므로 정답 트리에 남깁니다. `createSlots()`로 받는 요소는 호출하는 쪽이 넘기므로 넣지 않습니다. 같은 파일의 로컬 컴포넌트(`Header`, `CloseButton`)는 호출 위치의 조건을 이어받아 따라갑니다. `VStack`, `Box` 같은 레이아웃 요소는 시안의 라이브러리 인스턴스가 아니므로 넣지 않습니다.
- 그 밖의 규칙(시안이 그리는 파트만 남기기, 바깥 템플릿이 렌더링한 인스턴스의 위치 등)은 PoC의 규칙을 그대로 옮기고, 규칙마다 단위 테스트를 둡니다.

### 텍스트 줄과 박스

시각 점수는 시안의 박스와 실행 중인 앱의 DOM 박스를 비교합니다. 이 비교에 필요한 시안 쪽 정보를 정답 트리와 같은 실행에서 냅니다.

- **텍스트 줄**은 보이는 TEXT 노드의 줄마다 하나씩, 라이브러리 인스턴스 안의 텍스트까지 모두 냅니다. 박스는 `absoluteRenderBounds`가 있으면 그것을, 없으면 `absoluteBoundingBox`를 쓰고, 노드 높이를 빈 줄까지 포함한 줄 수로 나눕니다. `absoluteRenderBounds`는 글자에 딱 맞으므로 첫 줄 위와 마지막 줄 아래의 빈 줄은 세지 않습니다. 빈 줄은 높이만 차지하고 출력에서는 뺍니다. Figma는 빈 문단을 zero-width space 하나로 남기므로 그런 줄도 빈 줄입니다. id는 남은 줄 순서대로 매겨, 한 노드의 두 번째 줄부터 `<id>#1`, `<id>#2`입니다.
- 텍스트 줄은 평평한 목록입니다. 위치는 판정하지 않습니다.
- **박스**는 노드, 제외된 인스턴스, 채점 불가 인스턴스에 모두 붙습니다. 제외된 인스턴스도 코드가 그리므로 시각 점수에서는 잽니다.

### 출력과 종료 코드

시안의 모든 라이브러리 인스턴스는 정답 트리의 노드가 되거나, 제외 사유나 채점 불가 원인 하나를 가져야 합니다. 제외된 인스턴스 안의 라이브러리 인스턴스는 바깥 인스턴스와 같은 제외 사유를 받습니다. 템플릿 실행이 실패한 인스턴스와, 연결하는 템플릿이 없는 composites 인스턴스 안의 라이브러리 인스턴스는 제외 사유 `inside-unscorable`을 받습니다. 둘 다 노드는 만들지 않습니다.

| 종료 코드 | 조건                                                                                  |
| --------- | ------------------------------------------------------------------------------------- |
| 0         | 정답 트리를 냄                                                                        |
| 2         | 정답 트리를 냈지만, 템플릿 실행이 실패했거나 템플릿이 없는 라이브러리 인스턴스가 있음 |
| 1         | 시안 트리나 템플릿을 읽지 못함                                                        |

채점 불가는 확인하지 못한 정보로 합격이 나오는 오채점을 막습니다. 소비자 레포에 composites가 설치되지 않았는데 시안에 composites 인스턴스가 있는 경우도 채점 불가입니다. composites 컴포넌트의 Figma 이름에는 core의 💙, icons의 ❤️ 같은 표시가 없어서, 이름만으로는 다른 라이브러리의 컴포넌트와 구별되지 않습니다. 그래서 figma-blueprint는 빌드할 때 `packages/composites/figma-entries.json`의 컴포넌트 키를 함께 담습니다. 그 키의 인스턴스를 연결하는 템플릿이 없으면 원인은 `not-installed`입니다. composites가 설치돼 있지만 그 컴포넌트가 없는 예전 버전이면 원인은 `no-template`입니다. 어느 쪽이든 composites 컴포넌트는 안의 요소를 스스로 그리므로(Dialog의 닫기 `IconButton`), 안의 라이브러리 인스턴스는 노드가 되지 않습니다. 담는 것은 키뿐이고 템플릿은 여전히 설치된 패키지에서 읽으므로, 정답은 그대로 설치된 버전을 따릅니다. 검증 에이전트는 채점 불가가 하나라도 있으면 그 시안의 결과를 `unscorable`로 냅니다.

`--json`은 아래 형식을 냅니다. 플러그인 스킬과 비공개 벤치가 함께 읽으므로, 필드를 바꾸거나 지우면 `version`을 올립니다.

```json
{
    "version": 4,
    "size": { "w": 1440, "h": 900 },
    "nodes": [
        {
            "id": "2:1",
            "tag": "Table.Root",
            "props": [],
            "pkg": "core",
            "box": { "x": 40, "y": 120, "w": 960, "h": 400 },
            "children": [
                {
                    "id": "2:1#1",
                    "tag": "Table.ColumnGroup",
                    "props": [],
                    "pkg": "core",
                    "box": { "x": 40, "y": 120, "w": 960, "h": 400 },
                    "children": []
                },
                {
                    "id": "2:5",
                    "tag": "Badge",
                    "props": ["size=\"md\"", "aria-label=\"*\""],
                    "pkg": "core",
                    "anyParent": true,
                    "box": { "x": 56, "y": 180, "w": 48, "h": 20 },
                    "children": []
                }
            ]
        }
    ],
    "excluded": [
        {
            "node": "I529:7899;2847:43442",
            "name": "💙IconButton",
            "reason": "part-draws-itself",
            "box": { "x": 1380, "y": 24, "w": 32, "h": 32 }
        }
    ],
    "unscorable": [{ "node": "I529:7906;3022:63949", "name": "💙Toolbar", "cause": "no-template" }],
    "texts": [{ "id": "4:2", "text": "주문 내역", "box": { "x": 40, "y": 72, "w": 120, "h": 28 } }]
}
```

| 필드                 | 값                                                                                                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nodes[].props`      | `size="md"`, `disabled`, `aria-label="*"`처럼 JSX에 쓰는 모양 그대로                                                                                                                                                    |
| `nodes[].pkg`        | 노드를 쓴 템플릿의 패키지. composites `Dialog.Root`와 core `Dialog.Root`를 가른다                                                                                                                                       |
| `nodes[].anyParent`  | 위치를 판정하지 않는 노드에만 `true`                                                                                                                                                                                    |
| `excluded[].reason`  | `part-draws-icon`(`internalIcons`), `part-draws-itself`(`internalParts`), `inside-self-closing-part`(self-closing 파트 안, 슬롯 밖), `inside-unscorable`(템플릿 실행이 실패했거나 템플릿이 없는 composites 인스턴스 안) |
| `unscorable[].cause` | `no-template`, `template-error`, `not-installed`(composites 미설치). `template-error`는 오류 문구를, `not-installed`는 설치되지 않은 패키지를 `message`에 담는다                                                        |
| `size`               | 채점하는 프레임의 크기. 시각 점수의 viewport와 위치 정규화에 쓴다. 트리에 박스가 없으면 빠진다                                                                                                                          |
| `*.box`              | 노드, `excluded`, `unscorable`의 박스. 템플릿 하나가 쓴 요소는 인스턴스의 박스를 함께 쓴다                                                                                                                              |
| `texts[]`            | 텍스트 줄. `id`, `text`, `box`                                                                                                                                                                                          |

### 검증

공개 레포에는 실제 시안 픽스처를 두지 않습니다. 픽스처와 에이전트 실행 결과는 비공개 벤치 데이터입니다.

- **vapor-ui CI**: 규칙마다 손으로 만든 작은 REST 트리로 단위 테스트를 둡니다(슬롯 밖 인스턴스 제외, node id, `anyParent` 위치 등). 레포의 모든 Code Connect URL이 `entries`에 있는지도 토큰 없이 검사합니다. 매주 main에서 도는 job은 토큰으로 `entries`를 다시 생성해 커밋된 것과 다르면 실패하고, `figma-blueprint library`로 Figma에서 사라진 `entries` 키, 연결도 예외 사유도 없는 컴포넌트, 이미 연결됐거나 사라진 예외를 잡아 실패합니다.
- **비공개 벤치**: figma-blueprint를 버전 고정해 씁니다. 처음 설계의 정적 대조 스크립트는 벤치로 옮기고, 같은 run을 그 스크립트와 검증 에이전트로 모두 채점해 일치율을 잽니다.

완료 조건은 정답 트리의 **오류 0**입니다. 벤치의 픽스처 25개에서 채점 불가가 없어야 하고, 사람이 코드를 읽고 판정해 둔 에이전트 실행 12개를 이 트리로 채점했을 때 FP 0, FN 0이어야 합니다.

이 RFC를 쓸 때 PoC를 RFC의 종료 코드 규칙으로 돌리면 픽스처 25개 중 17개가 채점 불가였습니다. PoC는 템플릿이 없는 인스턴스와 템플릿 실행 실패를 정답에서 조용히 빼 왔기 때문입니다. 원인은 두 가지입니다.

- Code Connect가 없는 컴포넌트입니다. core의 `Field`, `Toolbar`, `Menu.GroupLabel`, `Progress.Track`이 해당합니다.
- 템플릿과 Figma 속성의 불일치입니다. `Pagination.Previous`와 `Pagination.Next`의 `disabled`, `Button`의 `variant`가 해당합니다.

규칙은 그대로 두고 빠진 연결과 불일치를 고칩니다. 이 작업은 Code Connect 작업(VAPOR-232)과 Figma·코드 불일치 수정(VAPOR-245)에서 합니다. `Toolbar`처럼 이후 연결된 컴포넌트가 있으므로, 지금 남은 항목은 두 이슈에서 확인합니다.

## Drawbacks

- core, composites, icons의 배포 산출물이 커지고 세 패키지의 빌드가 figma-blueprint에 의존합니다. 앱 번들에는 들어가지 않습니다.
- figma 대역은 Figma의 템플릿 API를 다시 구현한 것입니다. Code Connect에 새 API가 생기거나 템플릿이 대역에 없는 API를 쓰면, 대역을 고칠 때까지 그 인스턴스는 채점 불가가 됩니다.
- 판정은 에이전트가 내리므로 결정적이지 않습니다. 판정이 흔들리는 정도는 벤치 일치율로 보고, 그때 검증자를 늘릴지 정합니다.
- `entries`가 Figma 재발행을 따라가는 데 최대 일주일이 걸립니다. 그 사이 PR CI는 빠진 항목만 잡고 키가 바뀐 경우는 잡지 못합니다. 주간 job이 실패하면 사람이 `figma:entries`로 재생성해 일반 PR로 올립니다. 봇이 `GITHUB_TOKEN`으로 연 PR에서는 CI가 돌지 않고 changeset도 사람이 판단해야 해서 자동 PR을 두지 않습니다.
- 실제 시안 회귀는 비공개 벤치에서만 돌아갑니다. 외부 기여자는 공개 단위 테스트까지만 확인할 수 있습니다.
- figma-blueprint는 빌드할 때의 composites 키만 압니다. composites가 컴포넌트를 새로 발행하면, figma-blueprint를 다시 배포하기 전까지 composites가 설치되지 않은 소비자에서는 그 컴포넌트를 알아보지 못합니다.

## Alternatives

- **패키지가 생성 코드를 정적으로 스캔해 대조**: 처음 설계입니다. 결정적이지만 `memo()`·`forwardRef()`·HOC, 이름이 겹치는 로컬 컴포넌트를 읽지 못하고, 그런 모양이 나올 때마다 스캐너가 커집니다. 벤치에서 에이전트 판정과 비교하는 기준으로만 남깁니다.
- **MCP 스니펫으로 정답 만들기**: 기존 벤치 방식입니다. 데스크톱 MCP 서버는 `fileKey` 인자가 없어 앱에 열린 파일만 다루고 `I529:7899;2847:43442` 같은 인스턴스 내부 ID를 거부합니다. 정답이 필요한 노드는 대부분 이런 중첩 노드입니다. 원격 MCP는 중첩 ID를 받지만 CLI가 OAuth 토큰을 발급하고 갱신해야 합니다.
- **템플릿에서 prop 대응표만 뽑아 JSON으로 배포**: 가볍지만 템플릿의 분기 로직을 재현하지 못합니다. 템플릿을 직접 실행하면 Figma 서버와 같은 결과가 나옵니다.
- **템플릿을 figma-blueprint 안에 번들하고 버전이 다르면 경고**: 패키지 하나만 바뀌지만 소비자의 core 버전과 정답 트리가 어긋날 수 있습니다. 문서를 core에 함께 배포하게 된 이유도 같은 버전 drift였습니다.
- **어느 `entries`에도 없는 라이브러리 인스턴스를 모두 채점 불가로**: composites 키를 담지 않아도 되지만, 다른 라이브러리의 컴포넌트(사이드바, 아바타)와 컴포넌트 내부 인스턴스(`🔶InteractionLayer`, 슬롯 레이어)까지 채점 불가가 됩니다. 벤치 시안 25개 모두에 그런 인스턴스가 있어서, 모든 패키지가 설치된 소비자에서도 지금 채점되는 시안 4개까지 채점 불가가 됩니다.
- **MCP 오라클을 정답 기준으로**: 오라클에도 잡음이 있습니다. 같은 IconButton의 `aria-label`이 응답마다 있다 없다 하고(14줄), 코드가 낼 수 없는 Dialog 닫기 버튼을 정답으로 봅니다. 오라클은 비공개 벤치의 참고 신호로만 씁니다.
- **릴리스 CI가 토큰으로 `entries`를 매번 생성**: 항상 최신이지만 Figma API 장애가 릴리스를 막고 fork PR의 CI에서는 secret을 쓸 수 없습니다. 대신 main에서 주간 job으로 돌립니다. 릴리스와 PR을 거치지 않으므로 두 문제가 생기지 않습니다.
- **시안이 바인딩한 Figma 변수를 함께 내서 스타일을 검사하는 관문 2**: 디자이너가 직접 그린 레이어의 바인딩 변수와 absolute 여부를 내고, 코드의 하드코딩 값과 `absolute`를 잡는 방식입니다. 플러그인 스킬을 개선한 뒤 벤치 run 103개 중 관문 2 때문에만 떨어진 run이 없어서 두지 않았고, 다시 넣더라도 시안과 비교하지 않고 코드만 보는 ESLint 규칙으로 하기로 했습니다(VAPOR-325).

## Unresolved Questions

없습니다. 폴더 이름과 `exports` 경로는 "템플릿과 표의 배포", `--json` 스키마는 "출력과 종료 코드", `internalParts`의 조건 구분은 "정답 트리 규칙"에서 정했습니다.

승인되면 아래 세 결정을 ADR로 남깁니다.

- 정답을 MCP 응답이 아니라 REST 트리와 Code Connect 템플릿 실행으로 만든다
- Code Connect 템플릿과 표를 각 컴포넌트 패키지에 함께 배포한다
- 정답 생성은 패키지가, 코드 판정은 플러그인 스킬의 검증 에이전트가 맡는다
