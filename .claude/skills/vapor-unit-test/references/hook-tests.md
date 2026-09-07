# 커스텀 hook 유닛 테스트 가이드

React 커스텀 hook을 테스트합니다.
파일 위치·import·`it()` 네이밍·mock·커버리지 같은 공통 규칙은 `SKILL.md` 참조. 이 문서는 hook 전용 컨벤션만 다룹니다.

## 최상위 describe

hook 이름을 문자열로 사용합니다.

```ts
describe('useInterval', () => {
    // ...
});
```

## `renderHook` 사용

`@testing-library/react`의 `renderHook`을 사용합니다. 결과 변수명은 `view`(`rendered`는 컴포넌트 테스트 전용).

```ts
import { act, renderHook } from '@testing-library/react';

const view = renderHook(() => useCounter(0));

expect(view.result.current.count).toBe(0);
```

### prop 변경 (rerender)

`initialProps`와 `rerender`로 prop 변화를 검증합니다.

```ts
const view = renderHook(({ delay }) => useDebounce('value', delay), {
    initialProps: { delay: 500 },
});

view.rerender({ delay: 1000 });
```

## 상태 변경은 반드시 `act`로 감싸기

hook이 노출한 setter나 핸들러는 `act` 안에서 호출합니다. 그래야 React가 상태 업데이트를 flush합니다.

```ts
import { act } from '@testing-library/react';

it('increments count', () => {
    const view = renderHook(() => useCounter(0));

    act(() => {
        view.result.current.increment();
    });

    expect(view.result.current.count).toBe(1);
});
```

## 타이머·비동기

`setTimeout`/`setInterval`을 쓰는 hook은 `vi.useFakeTimers()`로 가짜 타이머를 활성화합니다.

```ts
beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

it('fires callback every interval', () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 1000));

    act(() => {
        vi.advanceTimersByTime(3000);
    });

    expect(callback).toHaveBeenCalledTimes(3);
});
```

`Promise` 기반 비동기:

```ts
await act(async () => {
    await view.result.current.fetchData();
});

expect(view.result.current.data).toEqual(...);
```

## 언마운트 정리 검증

cleanup 로직(이벤트 리스너 제거, 타이머 해제 등)이 있는 hook은 `view.unmount()` 후 사이드이펙트가 더 이상 발생하지 않는지 확인합니다.

```ts
it('clears interval on unmount', () => {
    const callback = vi.fn();
    const view = renderHook(() => useInterval(callback, 1000));

    view.unmount();
    act(() => {
        vi.advanceTimersByTime(5000);
    });

    expect(callback).not.toHaveBeenCalled();
});
```

## 무엇을 테스트할 가치가 있는가

- **자체 로직** — 상태 전이, 디바운스/스로틀, 계산된 반환값, cleanup 동작
- **prop 의존성** — `dependencies` 배열 변화 시 재실행 여부
- **에러 처리** — invalid 입력 시 throw 하는지, fallback 반환하는지

**테스트하지 않아도 되는 것** — React 자체 동작(useState가 렌더를 트리거하는지 등).

## Context를 요구하는 hook

Provider로 감싸는 wrapper 옵션을 사용합니다.

```ts
const wrapper = ({ children }) => (
    <ThemeProvider value="dark">{children}</ThemeProvider>
);

const view = renderHook(() => useTheme(), { wrapper });
expect(view.result.current).toBe('dark');
```

## 풀 예시

`references/examples/use-hook.test.ts` 참고.
