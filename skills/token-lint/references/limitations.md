# token-lint 한계

이 스킬이 **구조적으로** 해결할 수 없는 문제만 정리합니다. 설계 의도로 범위에서 제외한 항목(예: Figma 단계의 의미 검증, ignore 주석 미지원 등)은 한계가 아니라 비목표이므로 여기 없습니다.

깨끗한 exit 0을 신뢰할 때, 또는 신고된 항목을 사용자에게 보고할 때, 아래 카테고리 중 하나라도 해당 상황이 의심되면 결과 해석을 보정해야 합니다.

## 1. regex 기반 검출의 표현 한계

스크립트는 파일 전체를 단일 정규식으로 스캔해 `var(--vapor-...)` 패턴을 잡습니다(공백/개행 포함). 토큰 참조의 구문 트리를 파싱하지 않으므로 다음은 **검출이 누락**됩니다 (false negative — 깨끗하게 통과하지만 실제로는 검사되지 않은 코드).

- 동적 조립: ``var(`--vapor-color-${variant}`)``, `var('--vapor-' + name)`, 객체 매핑에서 토큰 키만 저장한 뒤 런타임 조립.
- helper 간접: `buildToken('color-primary-100')`, `getCssVar(token)` 같은 래퍼를 거치면 정규식은 토큰 이름 자체를 보지 못합니다.
- 폴백 체인 안쪽: `var(--vapor-a, var(--vapor-typo))` — 정규식은 `var(...)` 두 개를 각각 잡지만 폴백 위치의 의미(첫 토큰이 없을 때만 사용되는 디폴트)는 알지 못해, 진짜 사용 토큰과 디폴트 토큰을 같은 무게로 검사합니다.
- CSS Custom Property 정의 사이트: `--vapor-team-x: red;` 같은 사용자 측 vapor prefix 확장 정의는 `var()` 래퍼가 없어 검사 대상에서 제외됩니다. 카탈로그 외 prefix 확장은 침묵 통과합니다.

반대로 문자열 리터럴/주석/픽스처 안의 완성된 `var(--vapor-foo)` 표기는 **실제 참조와 구분되지 않아 검사 대상이 됩니다** (false positive). regex로는 "코드 위치"와 "그저 같은 모양의 문자열"을 가를 수 없습니다.

→ 보정: 검출 누락이 의심되면 같은 파일을 grep으로 `--vapor-` 직접 검색해 비교하세요. false positive는 사용자에게 "이 위치는 실제 사용이 아닐 수 있다"고 명시하세요.

## 2. 세그먼트 정렬 Damerau-Levenshtein의 의미 맹점

제안 알고리즘은 토큰을 `--vapor-` prefix 제거 후 `-`로 세그먼트 분해하고, 같은 위치 세그먼트끼리 Damerau-Levenshtein(전치 1 ops)을 계산해 per-seg 1, total 2 cutoff 내 후보를 골라냅니다. 글자 단위 거리만 보므로 다음 케이스는 침묵합니다.

- **의미축 오타**: `--vapor-color-foreground-primary-100` ↔ `--vapor-color-background-primary-100`. 같은 세그먼트 개수지만 `foreground` ↔ `background` per-seg 거리 5 — per-seg cutoff 1 즉시 탈락. 사용자가 카탈로그를 직접 봐야 합니다.
- **세그먼트 경계 깨진 오타**: dash 누락/추가로 토큰 길이가 달라지면(`--vapor-colorforeground-primary-100`, `--vapor-color-foreground-primary` 등) length mismatch로 후보 집합이 비어 침묵합니다.
- **세그먼트 내부 2글자 이상 오타**: 같은 세그먼트 안에서 인접 전치가 아닌 2-substitution 오타(`--vapor-color-fxrxground-primary-100`)는 per-seg 거리 2를 넘어 탈락합니다. transposition은 d=1로 잡지만 그 외의 다중 오타는 못 잡습니다.
- **동일 거리 다수 후보**: 동률일 때 알파벳 순으로 잘리므로 상위 3개가 의미상 가장 가까운 후보가 아닐 수 있습니다.

→ 보정: 제안이 비어 있거나 직관과 다른 unknown이 나오면 "토큰 카탈로그를 직접 확인하라"고 안내하세요. 자동 fix-it 도구가 아닙니다.

## 3. 단방향 존재 검사 (타입/맥락 인지 없음)

스킬은 "이름이 정식 집합에 있는가"만 봅니다. 다음은 검사하지 않습니다:

- **타입 부적합**: color 토큰을 `font-size`에 사용, dimension 토큰을 `color`에 사용 — 이름이 존재하면 통과합니다.
- **deprecated/대체 권장 토큰**: 정식 집합에 남아 있으면 통과합니다. "쓰지 말라"는 메타정보를 DTCG에서 읽지 않습니다.
- **참조 그래프**: `--my-x: var(--vapor-foo);` 같이 사용자 정의 변수가 vapor 토큰을 감쌀 때, `--my-x` 사용처는 vapor 토큰 검사에서 보이지 않습니다.

→ 보정: 토큰 의미·타입·deprecated 검증이 필요한 작업이면 이 스킬만으로 충분하지 않다고 명시하고, Figma 단계 또는 별도 디자인 시스템 린트가 필요함을 안내하세요.
