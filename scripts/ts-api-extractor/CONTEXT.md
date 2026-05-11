# ts-api-extractor — Domain Glossary

## Translation pipeline

**Translation Unit**
번역 파이프라인이 처리하는 최소 단위. 컴포넌트 description 또는 prop description 하나에 해당하며, component-scoped stable id를 가진다.

- id 예시: `component.description`, `props[0].size.description`
- 파일: `src/translate/translation-units.ts`

**Component Translation Request**
하나의 `PropsInfoJson` component에서 cache miss `Translation Unit`만 모은 LLM JSON-mode 요청.

- 응답 shape: `{ translations: [{ id, translated }] }`
- 파일: `src/translate/llm-translation.ts`

**Translation Outcome**
각 `Translation Unit`의 최종 산출 상태. `verified`는 MQM 품질 게이트를 실제로 통과한 결과이고, `unverified`는 품질 게이트 실패/불가/스킵 결과다.

- 캐시 hit와 MQM disabled는 `reportable: false`
- 파일: `src/translate/types.ts`, `src/translate/lifecycle.ts`

**MQM (Multidimensional Quality Metrics)**
번역 품질 평가 분류 체계. validation model이 unit 단위로 `{ verdict, errors }` JSON을 반환한다.

- 타입 정의: `src/translate/types.ts`
- 파일: `src/translate/mqm-validator.ts`

**Postprocess**
초기 MQM FAIL 후 postprocess model이 `{ translated }` JSON으로 개선 번역을 반환하는 단계. 응답 검증 실패는 hard failure가 아니며 초기 번역을 `unverified`로 출력한다.

- 파일: `src/translate/llm-postprocess.ts`

**Verified Cache**
다음 실행에서 재사용하기 위한 text-unit 기반 저장소. `verified` 최종 outcome만 저장한다.

- entry shape: `{ source, translated }`
- 파일: `src/translate/cache.ts`

**Pipeline**
`Translation Unit` 수집 → cache hit/miss 분리 → component-scoped JSON translation → unit MQM lifecycle → props 재구성 → report 생성 순서로 실행되는 전체 번역 워크플로.

- 파일: `src/translate/pipeline.ts`
