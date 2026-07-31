# 한계 (정직성 기록)

이 스킬이 결정론으로 단정 못 하는 지점을 모은다. "미검사"를 "통과"로 오해하지 않으려고 둔다.

## 1. WCAG 명도비 ratio는 계산하지 않는다

4축은 foreground 토큰의 배경이 **순백/투명/그 외** 중 무엇이냐의 3분류(`gradeRules.100/200`)만 본다.
다음은 전부 범위 밖이다:

- oklch → sRGB 변환, gamut mapping
- 4.499:1 같은 반올림 경계 함정
- opacity/blend 합성으로 얻는 effective color
- gradient/image 위 텍스트의 worst-pixel 대비
- z-order 정밀 재구성(Polychrom)

즉 "fg-200이 충분한 대비를 갖느냐"는 묻지 않는다 — "fg-100이 비순백 배경에 쓰였나"만 본다.

## 2. 배경 식별의 결정론 한계

`classifyBackground`는 조상 체인의 가장 가까운 불투명 SOLID fill을 배경으로 채택한다. 단순 케이스만
정확하다. 다음은 `ambiguous`로 떨어뜨려 **보류(info)** 한다 — 오판보다 보류가 낫다("파란 fill 오판 전례"):

- z-order 겹침(형제가 위에 덮인 경우)
- opacity:0 InteractionLayer, 반투명 fill로 아래 색과 섞이는 경우
- absolute positioning으로 트리 구조와 시각 배경이 어긋나는 경우

`ambiguous`는 적합률에 중립이며 "검토 필요"로 노출된다 — 사람이 직접 봐야 한다.

## 3. CI 헤드리스 자동화 미지원

추출은 Figma 파일 컨텍스트에서 JS를 실행하는 `use_figma`에 의존한다. 사람이 스킬을 호출하는
인터랙티브 흐름만 지원하고, 헤드리스 CI 파이프라인은 범위 밖이다.

## 4. typography 수치 분해 비교 안 함

3축은 Text Style 이름 매칭(바인딩 여부)만 본다. 개별 fontSize/lineHeight/letterSpacing 수치를 분해해
type ramp 이탈을 잡지 않는다. Text Style에 바인딩됐으면 수치는 정의상 일치하고, 불일치면 그건 raw/detach
문제로 바인딩 검출이 잡는다. lineHeight AUTO/PERCENT 정규화도 범위 밖.

## 5. LLM 의미 판정의 비결정성

2·3축 의미 판정은 LLM이 한다. temp=0도 run-to-run 변동이 있다. 그래서:

- PASS/FAIL을 단정하지 않고 **confidence**를 함께 낸다. 저confidence는 human 라우팅.
- 점수화(0-100)는 기준 모호·재현성 저하로 쓰지 않는다.
- 같은 시안이라도 판정이 미세하게 달라질 수 있음을 전제로 읽어야 한다.

## 6. 스키마 버전 동기화는 운영 전제

스키마 키 부재 = 위반(2축)은 **assets/CDN 스키마 = 시안 토큰셋**이 같은 세대일 때만 정확하다.
구버전 스키마면 정상 토큰을 오탐할 수 있다. 버전 핀/일치 가드는 두지 않으므로(코드가 버전을
비교·차단하지 않음), 스키마를 최신으로 유지하는 운영 규율이 정확도의 전제다. unknown-token이
비정상적으로 많으면 시안 결함이 아니라 스키마가 구버전인지 의심하라.
