# ProgressBar 경고 유틸 적용

중복 개발 경고를 한 번만 출력하도록 공용 `warn` 유틸을 추가하고 ProgressBar의 경고 경로를 통합한다.

## 설계

- `packages/core/src/utils/warn.ts`에 메시지를 저장하는 모듈 범위 `Set<string>`과 `warn(message)`를 둔다.
- production에서는 출력하지 않고, development에서는 메시지마다 `Vapor UI: ` 접두사를 붙여 한 번만 `console.warn`을 호출한다.
- ProgressBar의 잘못된 범위 경고와 접근 가능한 이름 누락 경고를 모두 `warn`으로 전달한다.
- 유틸은 내부 모듈로만 사용하며 공개 패키지 export는 추가하지 않는다.

## 확인

- 같은 메시지를 두 번 전달해도 한 번만 출력하는 테스트를 추가한다.
- 서로 다른 메시지는 각각 출력하는 테스트를 추가한다.
- 기존 ProgressBar 테스트와 core 타입 검사를 실행한다.
