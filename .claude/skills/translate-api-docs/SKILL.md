---
name: translate-api-docs
description: ts-api-extractor가 추출한 컴포넌트 API JSON의 한국어 번역을 검증하고, 번역 시 지켜야 할 vapor-ui 용어 사전을 제공합니다. 번역 결과의 코드 스팬 훼손·미번역·빈 번역·번역 누락·용어 사전 위반을 결정론적으로 잡아냅니다. 사용자가 "번역 검증", "API 문서 번역 확인", "용어 일관성 검사", "번역 누락 확인", "generated JSON 번역 검수"를 언급하거나 `/translate-api-docs`를 요청할 때 사용하세요. 새로 번역을 돌리기 전에 "무슨 용어 규칙을 지켜야 해?"라고 물을 때도 이 스킬의 용어 사전을 근거로 답합니다. 번역 실행 자체(LLM 호출)는 이 스킬이 하지 않습니다 — 검증과 규칙 제공만 합니다.
---

# translate-api-docs

## 사용 시점

`packages/core`의 영어 JSDoc을 `ts-api-extractor`로 뽑은 뒤, 그 설명문을 한국어로 옮긴 결과가 쓸 만한지 확인할 때 사용합니다.

트리거 표현:

- `/translate-api-docs <extracted-dir> <glossary.json>`
- "번역 검증해줘"
- "용어 일관성 확인"
- "번역 빠진 거 없나"

## 동작 방식

레포의 결정론적 스크립트(`scripts/translate-api-docs/verify.mjs`)가 검사 전부를 수행합니다. LLM을 호출하지 않으므로 같은 입력에 항상 같은 결과를 냅니다.

1. 추출 디렉터리의 모든 `*.json`을 읽어 번역 대상 문자열을 모읍니다 — 컴포넌트 레벨 `description`과 각 `props[].description`.
2. 번역 사전(`glossary.json`, `{ 영어 원문: 한국어 번역 }` 형태)과 대조해 다섯 가지를 검사합니다.
    - **번역 누락** — 고유 원문에 대응하는 번역이 없음
    - **빈 번역** — 값이 비었거나 공백뿐
    - **미번역** — 번역문에 한글이 하나도 없음
    - **코드 스팬 훼손** — 원문의 백틱 스팬(`` `<button>` ``)이 번역문에서 사라지거나 바뀜
    - **용어 사전 위반** — `terms.json`의 `avoid` 표기가 번역문에 등장
3. 위반이 없으면 `요약: 위반 0건` 한 줄과 함께 exit 0, 있으면 케이스별 블록을 출력하고 exit 1로 끝냅니다. 인자 오류만 exit 2입니다.

## 실행 방법

검증기는 스킬이 아니라 레포에 있습니다 — CI도 같은 스크립트를 쓰기 때문입니다. 레포 루트에서 실행하세요.

```bash
node scripts/translate-api-docs/verify.mjs <extracted-dir> scripts/translate-api-docs/translations.ko.json
```

- `<extracted-dir>`: `ts-api-extractor`가 JSON을 쓴 디렉터리. **번역을 적용하기 전의 영어 JSON이어야 합니다** — 번역이 적용된 디렉터리를 넘기면 한국어를 원문으로 착각합니다.
- 번역 사전 기본 위치는 `scripts/translate-api-docs/translations.ko.json`입니다. `--terms <path>`로 다른 용어 사전을 지정할 수 있습니다(기본값은 `scripts/translate-api-docs/terms.json`).

스크립트의 stdout을 **있는 그대로** 사용자에게 전달하세요. 요약·재배치·테이블 변환 금지. exit 코드는 따로 언급하지 않아도 됩니다 — 마지막 `요약:` 줄이 결과를 말해줍니다.

## 용어 사전

`scripts/translate-api-docs/terms.json`이 정본입니다. 번역을 새로 돌릴 때 이 파일의 `terms`와 `sentencePatterns`를 프롬프트에 그대로 넣으세요.

**등재 기준: 실제 번역에서 갈린 것만 올립니다.** 예방적으로 추가하지 마세요 — 검증기가 `avoid` 표기를 기계적으로 잡기 때문에, 근거 없는 항목은 정당한 번역을 오탐으로 막습니다.

현재 등재된 네 건은 전수 파일럿(고유 원문 321개)에서 실제로 표기가 갈렸던 것들입니다. 예를 들어 `dialog`는 배치 경계에서 "대화 상자" 24건과 "다이얼로그" 18건으로 갈렸습니다.

## 한계

- 검사하는 것은 **형식**입니다. 번역이 원문의 뜻을 옳게 옮겼는지는 판정하지 않습니다.
- `avoid` 문자열 포함 여부만 보므로, 정당한 맥락에서 그 표기를 써야 하는 경우에도 위반으로 잡습니다. 그런 사례가 나오면 `scripts/translate-api-docs/terms.json`에서 해당 항목을 빼는 쪽이 맞습니다.
- 번역 사전의 키는 원문과 **정확히 일치**해야 합니다. 공백·줄바꿈이 다르면 다른 원문으로 취급합니다.
