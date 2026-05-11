# ts-api-extractor — CLAUDE.md

## 패키지 목적

vapor-ui 컴포넌트 소스 파일에서 TypeScript AST를 파싱해 props/description JSON을 추출하는 도구.
**이 도구는 컴포넌트 소스가 아래 "파서가 기대하는 파일 구조"를 지킨다는 전제 하에 동작한다.**
구조가 맞지 않으면 파싱이 조용히 실패하거나 결과가 누락된다.

번역은 별도 패키지 `@vapor-ui/translation-pipeline`이 담당한다. 이 패키지에는 LLM 관련 코드가 없다.

---

## 실행 방법

```bash
# apps/website 디렉토리에서
pnpm extract
# 또는 turbo를 통해
pnpm --filter website extract
```

`outputDir/en/` 아래에 컴포넌트별 EN JSON 파일을 쓴다. 이 파일들이 `@vapor-ui/translation-pipeline`의 입력이 된다.

### CLI 플래그

| 플래그 | 설명 |
|---|---|
| `--component, -n` | 특정 컴포넌트만 처리 (기본: 전체) |
| `--package, -p` | 패키지 이름 지정 (기본: `core`) |
| `--verbose, -v` | 상세 로그 출력 |

---

## 환경 변수

CLI는 **`process.cwd()/.env`** 를 로드한다. turbo로 실행하면 cwd가 `apps/website/`이므로 실제로 읽히는 파일은 `apps/website/.env`다. 이 패키지는 환경 변수에 의존하지 않지만, .env 로딩 자체는 호환성을 위해 유지된다.

---

## 파서가 기대하는 소스 파일 구조

이 도구는 다음 패턴으로 작성된 컴포넌트 파일만 인식한다.

```tsx
/**
 * 컴포넌트 description
 */
export const Button = ...

export namespace Button {
  export type Props = {
    /** prop description */
    size?: 'sm' | 'md' | 'lg';
  };
}
```

- **네임스페이스 패턴 필수**: `export namespace ComponentName { export type Props = ... }` 형태여야 파싱됨
- **컴포넌트 description**: `const ComponentName = ...` 변수 선언 위의 JSDoc에서 읽음
- **prop description**: `Props` type alias 안의 각 프로퍼티 JSDoc에서 읽음

---

## 추출 파이프라인 (AST → JSON)

`extract.ts`가 오케스트레이션하며 단계별 파일은 `src/stages/`에 있다.

```
scan.ts       — glob으로 .tsx 파일 목록 수집 (.stories, .css.ts, .test 제외)
  ↓
parse.ts      — ts-morph로 AST 파싱. 네임스페이스/Props/JSDoc 추출 → ParsedComponent[]
  ↓
filter.ts     — react/dom/external/sprinkles props 제거. include 목록(className, style)만 통과
  ↓
transform.ts  — ParsedComponent → ComponentModel. 타입 정규화, prop 카테고리 분류, 정렬
  ↓
serialize.ts  — ComponentModel → PropsInfoJson (출력 JSON shape)
  ↓
write.ts      — `outputDir/en/` 아래에 파일 쓰기 + prettier 포맷
```

출력 JSON shape (`PropsInfoJson`):

```ts
{
  name: string;
  description?: string;
  props: {
    name: string;
    type: string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
  }[];
}
```

---

## 하지 말 것

- 번역 로직을 다시 추가하지 않는다 — 번역은 `scripts/translation-pipeline` 패키지의 책임이다
- `src/stages/`, `src/resolve/`, `src/rules/` 디렉토리의 추출 단계 코드는 별도 관심사다
