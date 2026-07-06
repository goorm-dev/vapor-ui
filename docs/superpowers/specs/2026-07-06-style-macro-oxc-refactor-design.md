# style-macro: babel → oxc-parser + magic-string 리팩터링

- Date: 2026-07-06
- Package: `@vapor-ui/style-macro`
- Author: noah.choi
- Status: Approved (design), pending implementation plan

## 1. 배경

현재 `@vapor-ui/style-macro`는 `$style({...})` 호출을 빌드 타임에 atomic class name + CSS 청크로 변환한다. 파이프라인은 `@babel/parser` → `@babel/traverse` → AST 조작 → `@babel/generator` 3단 구성이며, transform 파일마다 이 세 무거운 단계를 모두 실행한다. 이로 인해 빌드 속도가 저하된다.

리팩터링 목표는 파서 스택을 `oxc-parser` (Rust native)로 교체하고, generator 단계를 제거하여 `magic-string` splice 기반 emit으로 전환하는 것이다. `@react-spectrum/s2` 계열의 style-macro가 사용하는 “parse → find call sites → string splice” 패턴을 채택한다.

## 2. 목표

- `transform()` 성능을 파일당 최소 5배, 목표 5–15배 개선
- `@babel/*` 런타임 의존성 4종 제거 (`@babel/parser`, `@babel/generator`, `@babel/traverse`, `@babel/types`) 및 관련 `@types/babel__generator`, `@types/babel__traverse` 제거
- 기존 unplugin 다중 타깃 (Vite, webpack, Rollup, rspack, esbuild) 지원 유지
- 기존 test 스위트 pass — 6개 파일은 무수정, AST 헬퍼를 쓰는 2개 파일은 헬퍼만 oxc 로 포팅 (§8.1)
- Determinism 계약 유지: 동일 `(source, manifest)` → byte-identical `code` / `css` / `classes`

## 3. 비목표

- 소스 맵 개선 (현행 `map: null` 유지)
- Parcel 어댑터 추가 (unplugin이 이미 Parcel 미지원)
- `$style` DSL 확장 (spread, computed key 등은 현재대로 에러 유지)
- CSS emit 로직 변경 (`emit-css.ts`, `condition.ts`, `tokens.ts` 등 downstream 그대로)
- Feature flag 기반 dual-parser 유지 — big-bang 교체

## 4. 결정 사항

| 항목 | 결정 |
|---|---|
| Parser | `oxc-parser` (Rust native, parse-only) |
| Emit | `magic-string` splice (generator 미사용) |
| Source map | `null` 유지 |
| Marker early-out | 유지 (`source.includes(importName)`) |
| 마이그레이션 | Big-bang, 단일 PR, feature flag 없음 |
| `@babel/code-frame` | 유지 — 에러 포매팅 전용, hot path 아님 |

## 5. 아키텍처

### 5.1 현행 (babel)

```
transform(source, opts)
  ├─ source.includes(importName) early-out
  ├─ @babel/parser.parse(...)                   ← 병목 1
  ├─ @babel/traverse
  │    ├─ ImportDeclaration       → bindingName
  │    ├─ JSXOpeningElement       → ThemeProvider layer prop
  │    └─ CallExpression          → $style() 매치
  │         └─ replaceWith(t.stringLiteral(...))
  ├─ @babel/generator.generate(ast)             ← 병목 2
  └─ emitCss(tuples)
```

### 5.2 신규 (oxc + magic-string)

```
transform(source, opts)
  ├─ source.includes(importName) early-out       (유지)
  ├─ oxc-parser.parseSync(filename, source, { sourceType: 'module', lang: 'tsx' })
  ├─ MagicString(source)
  ├─ Program.body 얕은 순회
  │    └─ ImportDeclaration → bindingName, providerBindingName
  ├─ 재귀 walk (수동, visitor overhead 없음)
  │    ├─ JSXOpeningElement → parseLayerProp()
  │    └─ CallExpression    → handleStyleCall()
  │         ├─ parseCallArgs(node)         → RawEntry[]
  │         ├─ validateInput(entries)      → BuildError[]
  │         ├─ buildClassString(entries)   → 문자열 리터럴
  │         └─ ms.overwrite(node.start, node.end, replacement)
  ├─ code = ms.toString()
  ├─ css  = emitCss(tuples, mode)
  └─ return { code, css, classes, layerOrder, errors }
```

핵심: parse 이후 **AST 재생성 없음**. `magic-string`이 원본 offset 기반 splice + 자동 map을 제공하지만 `map: null` 유지 결정에 따라 map 생성은 스킵.

## 6. 컴포넌트 변경

### 6.1 대규모 재작성

| 파일 | 변경 |
|---|---|
| `src/transform.ts` | babel 임포트 제거, oxc-parser + magic-string 기반 재작성. 수동 walker 포함. |
| `src/parse-call.ts` | RawEntry / RawValue 시그니처 유지. `t.isXxx()` 가드 → `node.type === 'Xxx'` 비교로 전환. |
| `src/parse-layer-prop.ts` | 동일 로직, AST 매칭만 oxc 노드로 교체. |
| `package.json` | `@babel/parser`, `@babel/generator`, `@babel/traverse`, `@babel/types` 및 `@types/babel__generator`, `@types/babel__traverse` 제거. `oxc-parser`, `magic-string` 추가. `@babel/code-frame` + `@types/babel__code-frame`는 유지. |

### 6.2 유지 (변경 없음)

- `src/emit-css.ts`
- `src/tokens.ts`
- `src/validate-input.ts`
- `src/condition.ts`
- `src/class-name.ts`
- `src/property-shorthand.ts`
- `src/types.ts`
- `src/unplugin.ts`, `src/unplugin-entry.ts`, `src/unplugin-types.ts`
- `src/code-frame.ts` (`@babel/code-frame` 계속 사용)
- `src/$style.stories.tsx`
- 모든 `*.test.ts` — regression gate

### 6.3 신규 test

- `transform.oxc.test.ts`
  - AST shape 변환 정확성
  - splice 정확성 (다중 호출 파일)
  - 주석 보존
  - 삼항 원본 test expr 재활용
  - import 리네이밍 (`import { $style as s }`)
  - Marker 부재 시 parseSync 미호출 (spy)
  - TSX generic 문법 파싱

- `transform.oxc.bench.ts` (vitest bench, CI 옵션)
  - 1KB / 10KB / 100KB 소스 벤치
  - babel 대비 ≥ 5배 강제

## 7. Data flow — 대표 케이스

### 7.1 기본 케이스

입력:
```tsx
import { $style } from '@vapor-ui/style-macro';
const cls = $style({ padding: '$400', color: '$primary', fontSize: 14 });
```

RawEntry:
```ts
[
  { property: 'padding',  value: { kind: 'token',   token: '400' } },
  { property: 'color',    value: { kind: 'token',   token: 'primary' } },
  { property: 'fontSize', value: { kind: 'literal', literal: 14 } },
]
```

Splice:
```ts
ms.overwrite(callStart, callEnd, '"p400 cprim fs14"');
```

출력:
```tsx
import { $style } from '@vapor-ui/style-macro';
import "~vapor-style/<hash>.css";
const cls = "p400 cprim fs14";
```

### 7.2 삼항

입력:
```tsx
const cls = $style({ color: isActive ? '$primary' : '$muted' });
```

Splice (전체 CallExpression 대체, testNode는 원본 소스 slice 재활용):
```ts
const testSrc = source.slice(testNode.start, testNode.end); // "isActive"
ms.overwrite(callStart, callEnd, `(${testSrc} ? "cprim" : "cmuted")`);
```

babel의 `t.conditionalExpression(...)` AST 재구성 불필요.

### 7.3 조건 객체 (반응형)

입력:
```tsx
$style({ padding: { default: '$200', md: '$400' } });
```

`parseCallArgs` → `conditions: [...]`. 이후 `condition.ts` / `emit-css.ts` 로직 재사용. 결과는 문자열 리터럴 splice.

### 7.4 Marker 부재 early-out

```ts
if (!source.includes(importName)) {
  return { code: source, css: null, classes: [], layerOrder: null, errors: [] };
}
```

parseSync 호출 자체 스킵 — babel 시절과 동일.

### 7.5 ThemeProvider layer prop

JSX walk에서 `<ThemeProvider layer={(l) => [l.theme, l.reset]}>` 감지. `parseLayerProp()`는 oxc AST 노드에서 `ArrowFunctionExpression.body`가 `ArrayExpression`인지, elements가 `StringLiteral` 또는 `MemberExpression(l.xxx)`인지 확인. Splice 없음, `layerOrder` 반환값에만 반영.

### 7.6 오류 경로

`readValueExpression`이 인식 못 하는 노드 → `RawValue { kind: 'unknown', loc }` → `validateInput` → `BuildError { code: 'dynamic-value', loc }`. `unplugin`이 `formatBuildError`로 pretty-print 후 `this.error()`.

## 8. 테스트 전략

### 8.1 Regression gate

**무수정 pass** (AST 미사용, 순수 계약 테스트):
```
$style.test.ts
class-name.test.ts
condition.test.ts
emit-css.test.ts
property-shorthand.test.ts
tokens.test.ts
```

**AST 헬퍼만 교체 후 pass** (테스트 케이스/기대값은 그대로):
```
validate-input.test.ts        # callArg() 헬퍼: @babel/parser → oxc-parser
parse-layer-prop.test.ts      # exprFromSource() 헬퍼: @babel/parser → oxc-parser
```
두 파일은 함수 시그니처가 babel `t.ObjectExpression` / `t.Expression` 에서 oxc AST 노드로 바뀌었기 때문에 헬퍼만 포팅한다. `describe`/`it` 케이스와 기대 결과는 손대지 않으며, 이 조건이 곧 회귀 방지 게이트다.

### 8.2 신규 test

`transform.oxc.test.ts` (§6.3 참조).

### 8.3 벤치

`transform.oxc.bench.ts` — CI 선택 실행. 목표 임계값 미달 시 fail.

### 8.4 E2E 게이트

- `apps/test-app` (Vite): `pnpm build` 성공
- `apps/next-test-app` (webpack): `pnpm build` 성공
- 두 앱의 산출물 CSS/JS 를 리팩터 전후로 diff → byte-identical 이어야 함 (Determinism 계약)

## 9. Rollout

1. 브랜치 `feat/style-macro-oxc` (현 `style-utility` 파생)
2. 단일 PR:
   - `package.json` dep 교체
   - `transform.ts`, `parse-call.ts`, `parse-layer-prop.ts` 재작성
   - `validate-input.test.ts` / `parse-layer-prop.test.ts` 의 AST 빌드 헬퍼만 oxc 로 포팅 (케이스/기대값 무수정)
3. CI 게이트 (모두 pass):
   - 기존 test 전부 pass
   - 신규 `transform.oxc.test.ts` pass
   - `apps/test-app` / `apps/next-test-app` 빌드 성공
   - 산출물 byte-diff = 0
   - 벤치 ≥ 5배
4. Rollback: 브랜치 revert. Feature flag 없음.

## 10. 리스크와 완화

| 리스크 | 완화 |
|---|---|
| oxc AST shape이 babel과 미묘하게 다름 (loc 위치, StringLiteral vs Literal 등) | `parse-call.ts` / `parse-layer-prop.ts`에 명시적 매핑 계층. `transform.oxc.test.ts`로 shape drift 감지 |
| oxc-parser native binary 미지원 플랫폼 | oxc-parser는 darwin/linux/windows × x64/arm64 prebuilt 제공. vapor CI target이 이 범위에 포함되는지 확인 |
| magic-string splice 순서 (중첩 호출) | oxc walker를 후위 순회로 구현. magic-string은 원본 좌표 기준이므로 splice 순서에 영향 없음 |
| `@babel/code-frame`만 남기는 잔재 | leaf 패키지이며 dep 그래프에 영향 없음 |
| dev app HMR 회귀 | Vite HMR은 transform 반환값만 소비. code/css 계약이 유지되면 자동 정상 |
| Determinism 회귀 (class name 순서, CSS 순서) | E2E byte-diff = 0 게이트로 검출 |

## 11. Out of scope

- source map 개선
- Parcel 어댑터
- 신규 DSL 문법 지원
- CSS emit 로직 변경

## 12. 성공 지표

- 기존 test 전부 pass, 신규 test 전부 pass
- `apps/test-app` / `apps/next-test-app` 빌드 성공 + 산출물 byte-identical
- `transform()` 벤치 ≥ 5배
- `pnpm why @babel/parser` (packages/style-macro 범위) 결과 없음
