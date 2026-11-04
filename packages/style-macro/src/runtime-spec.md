# Runtime helper 명세 (Phase 6)

compile 시 plugin 이 치환한 코드가 호출하는 3개의 런타임 helper. 모두 `@vapor-ui/style-macro/__runtime__` 에서 export.

## `_mkStyle(map)`

**역할**: property-key → atomic className map 을 받아 `toString` 이 심어진 `VaporClass` 를 반환.

```ts
function _mkStyle(map: Record<string, string>): VaporClass
```

**규칙**:
- 반환 object 에 `toString()` 정의 — map 의 **value** (atomic className) 만 space-join.
- 추가 non-enumerable Symbol tag(`VAPOR_CLASS_TAG`) 로 `_mergeStyles` 가 vapor 결과물인지 식별.
- React 가 `className={x}` 에서 `String(x)` 호출 시 `toString()` 자동 트리거 → DOM 반영.

**예**:
```ts
const base = _mkStyle({
    'padding-top': 'vapor_pt_16_abc',
    'padding-right': 'vapor_pr_16_def',
});
String(base);  // → "vapor_pt_16_abc vapor_pr_16_def"
```

## `_mergeStyles(...parts)`

**역할**: 이미 compile 된 `VaporClass` 들을 property 단위로 last-wins 머지.

```ts
function _mergeStyles(...parts: VaporClass[]): VaporClass
```

**규칙**:
- 왼쪽 → 오른쪽으로 property 를 덮어씀. **뒤 argument 가 이김** (StyleX 관례).
- Symbol tag 가 없는 인자는 무시 (사용자 실수 방지 — 예: template literal 결과).
- 결과도 `_mkStyle` 호출로 생성 → 재머지 가능.

**예**:
```ts
const a = _mkStyle({ 'padding-top': 'pt-16', 'padding-right': 'pr-16' });
const b = _mkStyle({ 'padding-top': 'pt-32' });
const merged = _mergeStyles(a, b);
String(merged);  // → "pt-32 pr-16"   (b 의 pt 가 이김)
```

## `_toClass(x)`

**역할**: 단일 `VaporClass` 를 string 으로 강제 변환. jsx-inject 가 소비자의 변수 참조(`className={base}`) 를 unwrap 할 때 사용.

```ts
function _toClass(x: VaporClass | undefined): string
```

**규칙**:
- `x` 가 Symbol tag 있는 object → `x.toString()` 호출.
- `undefined` / `null` → 빈 string.
- 그 외 → `String(x)` fallback.

**예**:
```ts
_toClass(undefined);                         // → ""
_toClass(_mkStyle({ 'color': 'c-1' }));      // → "c-1"
```

## 호출 지점 대응표

| 소스 패턴 | plugin 치환 결과 |
|---|---|
| `const x = css({...})` | `const x = _mkStyle({...})` |
| `css(a, b)` | `_mergeStyles(a, b)` |
| `css(style, a)` | `_mergeStyles(_mkStyle(style), a)` |
| `<div className={x}>` (x 가 지역 var) | `<div className={x}>` 그대로 — React 가 toString 호출 |
| `<div className={css({...})}>` (인라인) | `<div className={_mkStyle({...})}>` |
| `<div className={`${a} ${b}`}>` | **compile error** — "use css(a, b) instead" |

## Symbol tag 설계 고찰

### 왜 Symbol 인가

- 사용자가 실수로 plain object `{ color: 'c' }` 를 `_mergeStyles` 에 넘겨도 조용히 통과하지 않도록 식별 필요.
- 문자열 property 를 쓰면 CSS property 이름과 충돌 가능 (`"$vapor"` 같은).
- Symbol 은 for-in / Object.keys 에 노출 안 됨 → merge 로직에서 저절로 무시됨.

### 왜 non-enumerable

- `for (const prop in obj)` 머지 루프가 tag 를 property 로 오해하지 않도록.
- `Object.assign` / spread 로 복제 시에도 tag 는 전파 안 됨 — `_mkStyle` 이 매 호출마다 심음.

## CSS variable slot 통합

dynamic 값 (prop 변수) 은 기존처럼 CSS variable slot 으로 처리하되, jsx-inject 는 slot 을 **같은 object 안**에 넣고 `style` 는 jsx 쪽 처리 유지.

```ts
// 소스
function Box({ w }) {
  return <div className={css({ width: w })} />
}

// plugin 치환
import { _mkStyle, _resolveToken } from '@vapor-ui/style-macro/__runtime__';
function Box({ w }) {
  return <div
    style={{ '--vapor-_w': _resolveToken(axisDim, w) }}
    className={_mkStyle({ 'width': 'vapor_width_abc' })}
  />
}
```

CSS variable slot 은 react 쪽 style attribute 로 분리. `_mkStyle` 의 object 는 class 머지만 담당. 역할 분리 유지.
