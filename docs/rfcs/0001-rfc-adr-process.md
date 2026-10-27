# RFC-0001: RFC·ADR 프로세스 도입

- **상태**: Draft
- **제안자**: @MaxLee-dev
- **댓글 마감**: 2026-11-04
- **관련 이슈**: VAPOR-275

## Summary

vapor-ui에 두 가지 문서를 도입합니다. 여러 결정이 얽힌 큰 변경은 RFC(`docs/rfcs/`)로 제안해 의견을 모으고, 확정된 결정 하나하나는 ADR(`docs/adr/`)로 남겨 팀의 규칙으로 씁니다. 이 RFC가 첫 RFC이며 이 PR의 머지가 승인 신호입니다.

## Motivation

설계 결정의 근거가 저장소 밖에 흩어져 있습니다. 예를 들어 API 레퍼런스를 `fumadocs-typescript`가 아닌 자체 extractor로 만들고 결과 JSON을 커밋하는 이유는 개인 메모에만 있습니다. 새 기여자가 "이거 왜 이렇게 했어?"라고 물으면 답을 아는 사람을 찾아야 하고 코드 리뷰에서 같은 논의가 반복됩니다.

CONTRIBUTING에는 "큰 변경은 먼저 이슈로 논의한다"는 문장만 있습니다. 어디에 무엇을 써서 누구의 동의를 받아야 결정된 것인지는 정해져 있지 않습니다.

## Detailed Design

### RFC와 ADR의 구분

"RFC는 결정 전, ADR은 결정 후"로 나누지 않습니다. ADR도 Proposed로 올라와 리뷰를 받고 반려될 수 있기 때문입니다([AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html)). 대신 아래 세 축으로 구분합니다.

| 축                  | RFC                                                                    | ADR                                                 |
| ------------------- | ---------------------------------------------------------------------- | --------------------------------------------------- |
| 결정 단위·참여 범위 | 결정 여러 개가 얽힌 변경 제안. 팀 바깥까지 열고 비동기 댓글로 받습니다 | 결정 하나. 팀 안에서 정합니다                       |
| 결정 이후의 쓰임    | 보관 문서. 방향이 나온 이유를 보여 주는 기록                           | 계속 참조하는 규칙. 코드 리뷰에서 근거로 링크합니다 |
| 탐색 분량           | Detailed Design, Alternatives를 길게 씁니다                            | Context에 검토한 선택지를 짧게 언급합니다           |

흐름은 **RFC(방향과 후보 비교) → ADR(결론) → 구현 중 생기는 ADR → 티켓(실행)** 입니다. RFC의 결론도 ADR로 남깁니다. 팀 안에서 정할 수 있는 결정은 RFC 없이 ADR로 바로 시작합니다.

### 무엇을 ADR로 남기나

아래 중 하나에 해당하면 남깁니다.

- 나중에 "이거 왜 이렇게 했어?"라는 질문이 나올 것 같은 결정
- 되돌리는 비용이 큰 결정
- 코드 리뷰에서 근거로 링크할 일이 있는 결정

버그 수정, 리팩터링, 시각적 디자인 선택에는 RFC도 ADR도 쓰지 않습니다.

### 위치와 형식

- RFC: `docs/rfcs/NNNN-<kebab-case-title>.md`, 형식은 [`docs/rfcs/template.md`](./template.md)
- ADR: `docs/adr/NNNN-<kebab-case-title>.md`, 형식은 [`docs/adr/template.md`](../adr/template.md)
- 번호는 폴더마다 0001부터 순서대로 매깁니다
- 문서는 한국어로만 씁니다. 코드 식별자와 기술 용어는 원어를 씁니다

### 리뷰와 결정

- RFC는 Draft PR로 올리고 리뷰는 PR 댓글로 받습니다. PR 본문과 RFC 머리말에 **댓글 마감일**을 적습니다
- 결정은 **제안자를 제외한 핵심 기여자의 approve**로 합니다. 핵심 기여자는 [`.github/CODEOWNERS`](../../.github/CODEOWNERS)에 등록된 사람입니다
- 승인되면 RFC 상태를 Accepted로 바꾸고 결론을 ADR로 같은 PR에 추가해 머지합니다
- 반려되면 RFC 상태를 Rejected로 바꾸고 사유를 남깁니다. 반려된 RFC를 머지해 기록으로 남길지, PR만 닫을지는 제안자가 정합니다
- ADR은 일반 PR과 같은 방식으로 리뷰합니다

### 이 PR의 범위

- `docs/rfcs/0001-rfc-adr-process.md` (이 문서)
- `docs/rfcs/template.md`
- `docs/adr/template.md`
- `docs/adr/0001-rfc-adr-process.md` (승인 시 추가)

아래 작업은 승인 후 후속 PR로 진행합니다. 합의되지 않은 프로세스를 먼저 적용하지 않기 위해서입니다.

- CONTRIBUTING에 RFC 절차 추가
- PR 템플릿에 RFC·ADR 링크 칸 추가
- 과거 결정을 ADR로 소급 작성
- ADR 형식을 검사하는 CI

## Drawbacks

- 큰 변경을 시작하기 전에 문서를 쓰고 마감일까지 기다리는 시간이 듭니다
- ADR이 쌓이면 Superseded 처리 같은 관리 비용이 생깁니다. 관리하지 않으면 낡은 ADR이 잘못된 근거로 쓰입니다
- 공개 저장소라서 RFC·ADR 내용이 외부에 그대로 보입니다. 사내 사정에 기댄 근거는 쓰기 어렵습니다

## Alternatives

- **Notion에 기록**: 팀 내부에서는 쓰기 편하지만 외부 기여자가 볼 수 없고 코드와 같은 커밋 이력으로 추적되지 않습니다. 코드 리뷰에서 링크하기도 어렵습니다
- **GitHub Discussions**: 토론에는 맞지만 결정이 스레드 안에 묻힙니다. "지금 유효한 결정"을 한 곳에서 찾을 수 없습니다
- **GitHub 이슈만 사용 (현행 CONTRIBUTING)**: 이슈는 닫히면 검색에서 멀어지고 상태(Accepted, Superseded)를 표현할 방법이 없습니다
- **ADR만 도입**: 결정 하나는 ADR로 충분하지만 여러 결정이 얽힌 변경(예: 문서 사이트 교체)을 팀 바깥까지 열어 논의할 자리가 없습니다

## Unresolved Questions

- 승인에 필요한 approve 수: 제안자를 제외한 핵심 기여자 1명이면 충분한지, 전원이어야 하는지
- 댓글 마감일의 기본 기간을 정할지 (이 RFC는 2주)
