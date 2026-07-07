# 컴포넌트 유닛 테스트 가이드

React 컴포넌트를 **Vitest + React Testing Library**로 테스트합니다.
파일 위치·import·`it()` 네이밍·mock·커버리지 같은 공통 규칙은 `SKILL.md` 참조. 이 문서는 컴포넌트 전용 컨벤션만 다룹니다.

## 최상위 describe

컴포넌트 이름을 문자열로 사용합니다.

```tsx
describe('Button', () => {
    // ...
});
```

`cleanup`은 RTL이 자동으로 호출하므로 명시적으로 추가하지 않습니다.

## describe 그룹

테스트가 **2개 이상의 카테고리**로 나뉠 때만 nested describe로 묶습니다. 카테고리가 1개거나 테스트 케이스가 적어 카테고리를 분류할 수 없는 경우 nested 없이 최상위 `describe`에 평탄하게 둡니다 — 불필요한 중첩은 가독성을 해칩니다.

| 그룹 이름                          | 사용 시점                      |
| ---------------------------------- | ------------------------------ |
| `'given a default <Component>'`    | 기본 uncontrolled 상태         |
| `'given a controlled <Component>'` | controlled value/onChange 상태 |
| `'ARIA attributes'`                | `aria-*` 속성 검증 전용        |
| `'keyboard navigation'`            | Tab, 화살표, Enter/Space 동작  |
| `'prop: <propName>'`               | 특정 prop 동작                 |

## 렌더 결과는 항상 `rendered` (테스트별로 직접 렌더)

각 `it()` 안에서 직접 `render`를 호출하고 반환값을 `rendered`에 담습니다. 동일한 테스트베드를 여러 케이스가 쓰더라도 `beforeEach`로 공유하지 말고 각 테스트가 자기 렌더를 소유합니다.

```tsx
describe('Checkbox', () => {
    it('is unchecked by default', () => {
        const rendered = render(<CheckboxTest />);
        const checkbox = rendered.getByRole('checkbox');

        expect(checkbox).not.toBeChecked();
    });

    it('toggles when clicked', async () => {
        // 동일한 테스트베드라도 케이스마다 새로 렌더
        const rendered = render(<CheckboxTest />);
        const checkbox = rendered.getByRole('checkbox');

        await userEvent.click(checkbox);

        expect(checkbox).toBeChecked();
    });
});
```

이유:

- **격리** — `beforeEach` 공유 렌더는 어떤 케이스만 다른 prop으로 렌더하고 싶어질 때, 이미 마운트된 트리를 지우려고 케이스 안에서 `cleanup()`을 부르는 지역적 회피를 강제합니다. 각 테스트가 자기 렌더를 소유하면 이 결합이 사라집니다.
- **가독성** — `render`와 해당 단언이 같은 스코프에 있어 케이스 하나만 읽어도 전체 흐름을 파악할 수 있습니다.
- **RTL 자동 cleanup** — 테스트가 끝나면 RTL이 마운트한 노드를 `document.body`에서 제거하므로 다음 테스트의 `render`는 항상 깨끗한 body 위에서 시작합니다.

`rendered`라는 이름은 `screen`(전역) 대비 어느 렌더 트리에 대한 쿼리인지 코드에 그대로 드러내기 위함입니다 — 한 파일에 여러 `render`가 공존해도 추적이 쉽고, "이 단언은 방금 렌더한 트리에 대한 것"이라는 의도가 명확해집니다.

### 렌더 결과를 참조하지 않는 경우

트리를 마운트만 하고 쿼리는 `userEvent`, mock, 전역 side effect로만 검증하는 경우 — `rendered` 변수를 만들지 말고 `render()`만 호출합니다.

```tsx
it('should call onClick when Enter is pressed on focused item', async () => {
    const onClick = vi.fn();

    render(
        <Breadcrumb.Root>
            <Breadcrumb.Item href="away" onClick={onClick}>
                Away
            </Breadcrumb.Item>
        </Breadcrumb.Root>,
    );

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
});
```

사용하지 않는 `rendered`는 "이 렌더에서 뭔가 조회할 것"이라는 잘못된 신호를 줍니다. 참조가 없으면 변수도 없어야 의도가 맞습니다.

## 요소 쿼리

쿼리는 `rendered`에서 chain하고, **반드시 의미 있는 이름의 변수에 담은 뒤 assert** 합니다. `expect()` 안에 인라인하지 않습니다.

```tsx
const trigger = rendered.getByRole('button', { name: 'Open' });
const popup = rendered.getByRole('dialog');
expect(trigger).toBeInTheDocument();
expect(popup).toBeInTheDocument();

// bad — anonymous
const el = rendered.getByRole('button');

// bad — inlined query
expect(rendered.getByRole('listbox')).toBeInTheDocument();
```

부재(absence) 검증 시에는 `queryBy*` 사용:

```tsx
const popup = rendered.queryByRole('listbox');
expect(popup).not.toBeInTheDocument();
```

### 비동기 등장/사라짐

Testing Library 공식 가이드 그대로 따릅니다.

- **비동기 등장** → `findBy*` (Promise 반환, 기본 timeout까지 polling)
- **비동기 사라짐** → `waitFor` + `queryBy*`

```tsx
// 등장
const popup = await rendered.findByRole('dialog');
expect(popup).toBeInTheDocument();

// 사라짐
await waitFor(() => {
    expect(rendered.queryByRole('dialog')).not.toBeInTheDocument();
});
```

`getBy*`를 `waitFor`로 감싸는 패턴은 피하세요 — `findBy*` 한 줄이면 됩니다.

### ARIA role이 아니라 컴포넌트 이름으로 변수명 짓기

개발자가 코드에서 보는 것은 컴포넌트 이름입니다. 변수명도 그에 맞추면 JSX와 테스트가 같은 어휘를 공유합니다.

| 컴포넌트         | ARIA role  | 변수명                       |
| ---------------- | ---------- | ---------------------------- |
| `Select.Trigger` | `combobox` | `trigger`                    |
| `Select.Popup`   | `listbox`  | `popup`                      |
| `Select.Item`    | `option`   | `appleItem`, `bananaItem`, … |
| `Dialog.Trigger` | `button`   | `trigger`                    |
| `Dialog.Popup`   | `dialog`   | `popup`                      |
| `Menu.Item`      | `menuitem` | `deleteItem`, `editItem`, …  |

여러 item 중에서는 콘텐츠 라벨을 접두사로 붙여 구분(`appleItem`, `item1` 금지).

## 접근성 테스트 (필수)

모든 컴포넌트 테스트 파일에 a11y 체크 1개는 반드시 포함합니다.

`axe`는 **`vitest-axe`**에서 import (`jest-axe` 아님 — Vitest 환경).

```tsx
import { axe } from 'vitest-axe';

it('should have no a11y violations', async () => {
    const rendered = render(<ComponentTest />);
    const result = await axe(rendered.container);

    expect(result).toHaveNoViolations();
});
```

`toHaveNoViolations` matcher는 프로젝트 vitest setup이 등록합니다(개별 import 불필요).

## 사용자 인터랙션

모든 액션은 `@testing-library/user-event`로. **기본은 직접 호출 (`userEvent.click(...)`).**

```tsx
import userEvent from '@testing-library/user-event';

await userEvent.click(button);
await userEvent.tab();
await userEvent.keyboard('{Escape}');
await userEvent.keyboard('{Enter}');
await userEvent.type(input, 'hello');
```

`userEvent.setup()`은 **옵션을 넘겨야 할 때만** 사용. 옵션이 없으면 인스턴스를 만들지 않습니다.

```tsx
// 옵션이 필요한 경우 — fake timer, delay, pointerEventsCheck 비활성화 등
const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
await user.click(button);
```

`userEvent`가 아니라 DOM 메서드를 직접 부를 때는 React가 상태를 flush할 시간을 주기 위해 `waitFor`로 감쌉니다.

```tsx
// good
await waitFor(() => trigger.focus());

// bad — focus()는 동기지만 다음 keyboard 호출이 렌더 사이클보다 먼저 발화할 수 있음
trigger.focus();
```

## 상태 단언

### 네이티브 HTML 상태

브라우저가 네이티브로 반영하는 상태는 의미 있는 matcher를 씁니다.

```tsx
expect(checkbox).toBeChecked();
expect(button).toBeDisabled();
expect(input).toBeRequired();
expect(input).toHaveFocus();
expect(element).toBeInTheDocument();
```

### JS가 관리하는 상태 (div 기반, Base UI 컴포넌트)

`<div>`나 비네이티브 인터랙티브 요소가 `aria-*` / `data-*`로 상태를 표현하면 `toHaveAttribute` 사용.

```tsx
// aria-*
expect(element).toHaveAttribute('aria-disabled', 'true');
expect(element).toHaveAttribute('aria-checked', 'mixed');
expect(element).toHaveAttribute('aria-invalid', 'true');
expect(element).toHaveAttribute('aria-current', 'page');

// data-* (Base UI 패턴)
expect(element).toHaveAttribute('data-disabled', '');
expect(element).toHaveAttribute('data-checked', '');
```

원칙: 진짜 `<input>`, `<button>`, `<select>` → 의미 있는 matcher / 그 외 → `toHaveAttribute`.

## 컴포넌트가 정의한 콜백만 테스트

자체 API로 정의한 콜백만 다룹니다. 단순히 DOM으로 forward되는 네이티브 이벤트는 테스트하지 않습니다.

- **테스트 대상** — 컴포넌트 로직이 들어간 콜백:
  `onCheckedChange`, `onValueChange`, `onOpenChange`, `onSelect`, `onDismiss`
- **건너뛰기** — 단순 forward되는 네이티브 이벤트:
  `onFocus`, `onBlur`, 단순 wrapper의 `onClick`, `onKeyDown`, `onMouseEnter`

이유: 네이티브 이벤트는 브라우저가 처리합니다. 테스트해 봤자 React의 이벤트 시스템이 동작하는지 확인할 뿐 컴포넌트 동작 검증이 아닙니다. 컴포넌트 콜백은 발화 시점, payload, `disabled`/`readOnly` 같은 조건 존중 여부를 검증할 가치가 있습니다.

콜백 실행은 실제 사용자 인터랙션(`userEvent.click`, `userEvent.tab`, `userEvent.type`)을 통해 트리거하세요. 그래야 콜백 주변의 컴포넌트 로직까지 함께 검증됩니다.

## 테스트용 wrapper 패턴

파일 하단에 가벼운 wrapper를 정의해 JSX를 깔끔하게 유지합니다.

```tsx
const LABEL_TEXT = 'My Checkbox';

const CheckboxTest = (props: Checkbox.Root.Props) => (
    <>
        <Checkbox.Root id="cb" aria-label={LABEL_TEXT} {...props} />
        <label htmlFor="cb">{LABEL_TEXT}</label>
    </>
);
```

`TRIGGER_TEXT`, `CLOSE_TEXT`, `LABEL_TEXT` 같은 상수는 모듈 최상단(파일 위쪽)에 둡니다.

## 풀 예시

`references/examples/breadcrumb.test.tsx` 참고.
