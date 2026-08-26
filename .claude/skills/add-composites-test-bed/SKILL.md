---
name: add-composites-test-bed
description: packages/composites의 대상 컴포넌트에 시각적 회귀용 `Test Bed` 스토리를 추가한다.
disable-model-invocation: true
---

# Add Composites Test Bed

`packages/composites` 컴포넌트의 시각적 회귀 diff를 위한 정적 `Test Bed` 스토리 하나를 대상 `*.stories.tsx`에 추가한다.

- 회귀 하네스 필터: `story.name === 'Test Bed'` + `title`이 `'Composites/'`로 시작. (`packages/composites/__tests__/regressions.test.ts:12`)
- 컴포넌트당 스토리 하나. 회귀 조건을 컬럼으로 갖는 테이블 하나만 렌더.
- 테이블 구조: 회귀 조건별 컬럼(현재는 각 variant prop 하나) + 마지막 `render` 컬럼(조건 적용된 컴포넌트 렌더 결과).
- 테이블 렌더는 `packages/composites/src/utils/regressions.tsx`의 `Regression.Table` 편의 컴포넌트를 재사용한다. `conditions`(각 조건의 `key`·`label`·`values`·`format`), `render`(row + container → 컴포넌트) 2개 prop만 넘기면 카테시안 곱 rows·ColumnGroup·Header·Condition 셀·Render 셀이 자동 생성된다. 세밀한 커스텀이 필요하면 하위 컴파운드(`Regression.Root / ColumnGroup / ConditionColumn / RenderColumn / Header / Body / Row / Heading / Condition / Render`)를 직접 조립한다. Vapor `Table` 위에 얹혀 있고, 스타일은 `$css`로 붙는다.

## Steps

### 1. 대상 컴포넌트 확정

사용자가 지정하지 않았다면 `AskUserQuestion`으로 묻는다. 대상은 `packages/composites/src/components/<kebab-name>/` 하위.

완료: 폴더 경로가 확정되어 있고, 해당 폴더에 `<name>.tsx`와 `<name>.stories.tsx`가 존재한다.

### 2. Default 스토리 확인

`<name>.stories.tsx`에서 `export const Default`를 찾는다.

- 부재 시 즉시 종료. 사용자에게 "Default 스토리를 먼저 추가하라"라고 안내.
- 존재 시 `Default.args`와 `Default.render`를 완전히 읽고, 각 슬롯 자리에 넘긴 JSX 값과 args를 목록으로 적어 둔다.

완료: 각 슬롯 이름 → JSX 값, 각 arg 이름 → 값의 매핑이 목록으로 정리돼 있다.

### 3. 구현체 파악

`<name>.tsx`를 읽고 컴포넌트의 모든 prop을 나열한다. `createSlots(...)` 호출 인자로 슬롯 이름을 확정한다. 필수 슬롯은 `SlotProps<typeof slots, ...>`의 두 번째 제네릭 인자로 식별한다.

완료: 프로젝트 규약이 `packages/composites/**` 진입 시 `.claude/rules/composites.md`로 자동 로드됨을 확인했고, 컴포넌트의 모든 prop을 흠 없이 열거할 수 있다.

### 4. Prop 분류

각 prop을 세 카테고리 중 정확히 하나로 배타 분류한다.

- **variants** — 시각 표현을 바꾸는 prop. 값 도메인이 유한한 리터럴 유니온이거나 boolean. 예: `size: 'md' | 'lg' | 'xl'`, `disabled: boolean`.
- **slots** — `createSlots`로 선언된 슬롯. `children`이 슬롯 역할이면 슬롯. variants 셀에서 재사용할 defaultSlots 상수의 원본이 된다.
- **functional** — 제어 상태(`open`/`defaultOpen`/`onOpenChange`), `ref`, `container`, `keepMounted`, `ariaLabels`, `closeOnClick` 등. Test Bed는 다루지 않는다.

각 variant prop의 값 리스트를 확정한다. 값 도메인이 무한하거나 임의 문자열이면 variants에서 제외한다.

완료: 세 카테고리에 분배되지 않은 prop이 0개이고, 각 variant prop에 대응하는 값 배열이 리터럴 상수로 확정돼 있다.

### 5. Variants 테이블 렌더

모든 variant prop 값의 **카테시안 곱**을 `Regression` 컴파운드로 렌더한다. 조건 컬럼은 각 variant prop 하나씩 + 마지막 `render` 컬럼. variants가 0개면 스토리 자체가 무의미 — 사용자에게 확인 요청 후 종료.

- `conditions`는 `{ key, label, values, format }[]` 배열. `key`는 row 필드명, `label`은 헤더 텍스트, `values`는 그 조건의 후보 값 배열(카테시안 곱 재료), `format`은 셀 표시용 값 변환기(예: `(v) => \`description = ${v ? 'O' : 'X'}\``). Boolean/null 인코딩된 조건은 반드시 `format`으로 O/X·리터럴 등으로 변환한다.
- `Regression.Table`이 `values`들로부터 카테시안 곱 rows를 자동 생성한다. rows를 밖에서 만들 필요 없다.
- 마크업: `<Regression.Table conditions={[...]} render={(row, container) => <Component ... />} />` 한 줄로 rows·헤더·ColGroup·조건 컬럼·render 셀이 자동 생성된다.
- 슬롯은 파일 최상단 `defaultSlots` 상수에서 spread. functional prop(예: `defaultOpen`)은 `render` 함수 안에서 지정.
- 컬럼 폭·셀 스타일·wrapper overflow·portal reset은 `Regression.Table` 내부가 담당. 스토리에서 손대지 않는다.
- 컴포넌트별 우회(예: Dialog overlay 숨김)는 스토리 자체 `<style>` 태그로 `.regression-cell` 하위 selector에 추가한다.
- `Regression.Table`은 테이블 하단 `<tfoot>`에 총 케이스 개수(`총 N개 케이스`)를 자동으로 표기한다. 소비자는 별도 처리 불필요.

완료: `<Regression.Body>` 내부 `<Regression.Row>` 개수 = `values[a].length * values[b].length * ...` 계산값. 각 row가 모든 조건 컬럼 셀 + 하나의 render 셀을 갖는다.

### 6. 스토리 파일에 반영

`<name>.stories.tsx` 하단에 `Test Bed` 하나를 export한다.

```tsx
import { Regression } from '~/utils/regressions';

export const TestBed: StoryObj<typeof Component> = {
    render: () => (
        <Regression.Table
            conditions={[
                {
                    key: 'size',
                    label: 'size',
                    values: ['md', 'lg', 'xl'],
                    format: (v) => `size = ${v}`,
                },
                {
                    key: 'hasDescription',
                    label: 'description',
                    values: ['설명 텍스트', null],
                    format: (v) => `description = ${v ? 'O' : 'X'}`,
                },
            ]}
            render={(row, container) => (
                <Component
                    {...defaultSlots}
                    size={row.size}
                    description={row.hasDescription ?? undefined}
                    defaultOpen
                    container={container ?? undefined}
                />
            )}
        />
    ),
};
```

- `meta.title`이 `'Composites/<Name>'`이 아니면 수정한다.
- `name: 'Test Bed'`는 공백 포함 정확히 이 문자열. 회귀 하네스가 문자열 비교로 매칭.
- Default와 Test Bed는 같은 `defaultSlots` 상수를 참조한다. 슬롯 JSX가 Default `render` 내부에서만 만들어져 재사용 불가면, 파일 최상단에 `const defaultSlots = { title: <...>, ... }`로 추출하고 Default `render`도 이를 사용하도록 리팩터.

완료: export된 `TestBed`의 `name`이 `'Test Bed'`, 파일의 `meta.title`이 `'Composites/<Name>'`, `<Regression.Body>` 내부 `<Regression.Row>` 개수 = 5단계 계산값, 각 row가 `<Regression.ConditionColumn />` 개수와 일치하는 `<Regression.Condition>` 셀 + 하나의 `<Regression.Render>` 셀을 갖는다.

### 7. 검증

1. `packages/composites/package.json`에서 lint·typecheck 스크립트 이름을 확인한다.
2. `pnpm --filter @vapor-ui/composites <lint-script>` 실행 후 실패 시 수정.
3. `pnpm --filter @vapor-ui/composites <typecheck-script>` 실행 후 실패 시 수정.
4. Storybook을 띄워 `Composites/<Name> > Test Bed` 트리 노드가 렌더되고, 셀 개수가 5단계 계산값과 일치하는지 육안 확인.

완료: 위 2·3 통과, 4의 셀 개수 일치. 스크린샷 기준 파일 갱신은 이 스킬 범위 밖 — 사용자가 `packages/composites/package.json`의 시각적 회귀 스크립트를 별도로 실행한다.

## Notes

- Test Bed는 정적 렌더 전용. 마운트 시 열려 있어야 의미 있는 컴포넌트(예: Dialog의 `defaultOpen: true`)는 functional args로 강제 오픈 상태를 지정한다.
- Overlay·Portal이 뷰포트 fixed로 잡혀 셀 안에 안 들어가는 컴포넌트(Dialog 계열)에서 popup 위치·containing block 우회는 `Regression.Render` 내부 CSS가 이미 처리한다 (`.regression-cell { transform: translateZ(0); min-width: 100% }` + `[data-base-ui-portal] > [data-open][role="presentation"] { position: static !important; ... }`). 컴포넌트별로 추가 override가 필요한 요소(예: Dialog overlay 숨김)만 스토리에서 `<style>` 태그로 얹는다 — selector는 `.regression-cell` 하위로 스코프.
- Render 셀은 컴포넌트 자연 폭 이상으로 유지된다. 뷰포트가 좁아지면 `Regression.Root`가 `overflow-x: auto`로 가로 스크롤을 만든다. 소비자가 이 폭을 override할 필요 없다.
- 컬럼 폭 배분(`Regression` 기본값): 조건 컬럼은 `$css={{ width: 'auto' }}` (컨텐츠 자연 폭), render 컬럼은 `$css={{ width: '100%' }}` (남는 폭 흡수). auto-table-layout에서 이 조합이 조건 컬럼을 컨텐츠 폭에 맞추고 render 컬럼이 뷰포트 잔여 폭을 흡수한다. Grid의 `1fr`은 `<col>`에 안 통하므로 이 트릭으로 대체한다.
- 필수 슬롯(예: Dialog의 `title`)은 회귀 조건에서 제외하고, 옵셔널 슬롯(예: `description`)만 존재 유무(`O`/`X`)로 조건 컬럼에 표기한다. 조건 셀 텍스트는 짧게 유지해 조건 컬럼 자연 폭을 좁힌다.
