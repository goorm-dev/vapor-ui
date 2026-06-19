# 일반 JS/TS 코드 유닛 테스트 가이드

React 컴포넌트와 hook이 아닌 모든 JS/TS 파일의 테스트를 다룹니다. 순수 함수, 변환기(transform), 생성기(generator), 린트 규칙 등 카테고리에 상관없이 동일한 패턴이 적용됩니다.

파일 위치·외부 fixture·import·`it()` 네이밍·mock·커버리지 같은 공통 규칙은 `SKILL.md` 참조. 이 문서는 일반 JS/TS 코드 전용 컨벤션만 다룹니다.

## 기본 패턴: input → output 검증

대상이 순수 함수면 setup도 mock도 거의 필요 없습니다. 입력을 주고 반환값을 검증하는 것이 본질.

```ts
import { mergeStatefulProps } from './stateful-props';

describe('mergeStatefulProps', () => {
    it('merges static className and style values', () => {
        const merged = mergeStatefulProps(
            { className: 'base', style: { opacity: 0.4 } },
            { className: 'external', style: { pointerEvents: 'none' as const } },
        );

        expect(merged.className).toBe('base external');
        expect(merged.style).toEqual({ opacity: 0.4, pointerEvents: 'none' });
    });
});
```

## describe 그룹

- 검증 대상이 함수 1개면 그 함수 이름을 최상위 `describe`로 사용
- 한 파일이 여러 함수를 export하면 함수별로 `describe`를 만들고, 파일 이름을 최상위 `describe`로 감쌈
- 단일 함수의 동작이 여러 카테고리로 나뉘면(예: 정상 경로 / 에러 / 옵션별 분기) 동작별 nested `describe`

```ts
describe('color-generator', () => {
    describe('generatePrimitiveColorPalette', () => {
        it('returns default palette when no options provided', ...);
        it('applies brand color when given', ...);
    });

    describe('getSemanticDependentTokens', () => {
        it('maps standard brand color', ...);
    });
});
```

## 엣지 케이스를 반드시 다룬다

순수 함수가 빠지기 쉬운 함정:

- 빈 입력 (`''`, `[]`, `{}`, `null`, `undefined`)
- 경계값 (0, 음수, `Number.MAX_SAFE_INTEGER`)
- 잘못된 입력 형식 → throw 하는지 fallback 반환하는지
- 유니코드, 멀티바이트, 이모지
- 부동소수점 정밀도

```ts
it('throws on invalid hex color', () => {
    expect(() =>
        generatePrimitiveColorPalette({
            brandColor: { name: 'invalid', hexcode: 'invalid-hex' },
        }),
    ).toThrow('Invalid brand color hex');
});
```

## 언제 snapshot을 쓸까

`toMatchSnapshot()`은 **큰 결정론적 출력**(생성된 토큰 트리, AST 변환 결과, 생성된 CSS) 검증에만 사용합니다.

**쓰기 좋은 경우**:

- 옵션별로 큰 객체를 생성하는 함수의 회귀 방지
- 변환 전/후를 fixture 파일로 비교할 때 (보통은 도메인 헬퍼가 처리)

**쓰지 말아야 할 경우**:

- 1~2 줄 출력 — 그냥 `expect(...).toBe(...)`로 명시
- 동작별 의도가 다른 케이스 — snapshot은 "변하지 않음"만 보장하지 "왜 그래야 하는지"를 표현하지 못함
- 부동소수점·시간·랜덤이 섞인 출력

snapshot 갱신 시 의도된 변경인지 반드시 확인 후 `pnpm test -u`.

## 도메인 헬퍼·테스트 유틸이 있다면 그것을 우선 사용

대상 도메인이 자체 테스트 헬퍼를 제공하면 직접 fixture를 읽거나 변환을 호출하지 말고 그 헬퍼를 통해 작성. 헬퍼는 fixture 로드, 정규화, diff 표시 같은 보일러플레이트를 처리합니다.

예시 — codemod transform 테스트 (`__testfixtures__/` 안의 input/output 쌍을 자동 비교):

```ts
import { join } from 'node:path';

import { runTestTransform } from '~/utils/test';

import transform from './index';

runTestTransform({
    transform,
    fixturesDir: join(__dirname, '__testfixtures__'),
});
```

예시 — ESLint 규칙 테스트는 `RuleTester`의 `valid`/`invalid` 배열에 코드 스니펫과 기대 메시지를 적습니다. 새 규칙을 만들 때는 기존 규칙의 구조를 그대로 따르세요.

새로운 도메인 헬퍼를 만들고 있다면, 헬퍼 호출 1줄로 끝낼 수 있는 형태(테스트 의도가 한눈에 보이도록)를 우선 검토.

## 풀 예시

`references/examples/util.test.ts` 참고.
