# base-ui 실측 (agent-browser)

`sc-map.md`에서 `컴포넌트` 책임으로 떨어진 SC 중, base-ui가 이미 보장하는 것을 **실행 중인
데모에서 확인**한다. 소스를 읽지 않는다 — 소스는 의도를 보여주고 브라우저는 결과를 보여주는데,
성공 기준이 걸리는 건 결과다.

데모: `https://base-ui.com/react/components/<컴포넌트>` (kebab-case)

## 검증 매핑

SC마다 어떤 명령이 증거를 만드는지. **명령이 없는 칸은 실측 불가**이므로 리포트에 "미확인"으로
남긴다.

| SC                        | 검증 방법                                                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1.2 이름·역할·값        | `snapshot -c` — 접근성 트리에 role·이름·상태가 나타나는지. 상태 변경(클릭) 후 재스냅샷해 `expanded`/`checked`/`selected`가 따라 바뀌는지 |
| 1.3.1 정보와 관계         | `eval`로 `aria-labelledby`·`aria-describedby`·`aria-controls`가 실제 id를 가리키는지                                                     |
| 1.3.2 의미 있는 순서      | `snapshot` 전체 — Portal 이동 후에도 트리 순서가 읽기 순서와 맞는지                                                                      |
| 2.1.1 키보드              | `press` 로 APG 키 표대로 눌러보고 매번 `snapshot`으로 상태 변화 확인                                                                     |
| 2.1.2 키보드 트랩 없음    | `press Tab` 반복 + `eval`로 `activeElement.closest("[role=dialog]")` 추적. Esc로 탈출되는지                                              |
| 2.4.3 초점 순서           | 열림 시 첫 포커스 위치, 닫힘 후 트리거 복귀를 `eval`로 확인                                                                              |
| 2.4.7 초점 표시           | `press Tab` 후 `screenshot` — 포커스 링이 눈에 보이는지                                                                                  |
| 2.4.11 초점 가려지지 않음 | 포커스 요소와 오버레이의 `get box`를 비교해 겹침 계산                                                                                    |
| 2.5.8 타깃 크기           | `get box @eN` — width·height ≥ 24                                                                                                        |
| 1.4.3 / 1.4.11 대비       | `get styles @eN`로 색을 뽑고 대비비 계산                                                                                                 |
| 1.4.13 호버 콘텐츠        | `hover` → 팝업 위로 포인터 이동 가능한지, Esc로 닫히는지, 호버 유지 중 안 닫히는지 3건                                                   |
| 4.1.3 상태 메시지         | `snapshot`에 `status`/`alert` role이 있는지 + 내용 변경 시 발화되는지                                                                    |
| 전 항목 자동 훑기         | `agent-browser a11y --json` (axe-core). **보조 신호일 뿐이다** — axe가 통과해도 준수가 아니고, axe 규칙은 SC와 1:1이 아니다              |

## 실전 함정 (실측에서 걸린 것)

1. **ref는 페이지가 바뀌는 즉시 무효다.** Dialog를 열거나 Esc로 닫았으면 **재스냅샷 후**
   새 `@eN`을 쓴다. 이전 ref는 엉뚱한 요소를 잡는다.
2. **`eval`은 스코프가 호출 간에 유지된다.** `const a = ...`를 두 번 실행하면
   `Identifier 'a' has already been declared`로 죽는다. IIFE로 감싼다:
   `(()=>{ const a=...; return ... })()`
3. **`box`가 아니라 `get box`다.** `styles`도 `get styles`.
4. **role 검증에는 `snapshot -c`(전체)를 쓴다.** `snapshot -i`는 인터랙티브 요소만 보여준다.

## 실측 예 — Dialog (2026-08-14)

```bash
agent-browser open https://base-ui.com/react/components/dialog
agent-browser snapshot -i -c -s "main"     # 트리거 ref 확보
agent-browser click @eN
agent-browser snapshot -c                  # role/이름/배경 소멸 확인
agent-browser eval '(()=>{const d=document.querySelector("[role=dialog]");return {ariaModal:d.ariaModal,labelledby:d.getAttribute("aria-labelledby")}})()'
```

판정 근거는 **수단이 아니라 결과**다. 위 Dialog는 `role="dialog"` +
`aria-labelledby`/`describedby`로 4.1.2를 충족하고, 배경이 트리에서 사라져 1.3.2를
충족한다 — 단 수단은 `aria-modal`이 아니라 배경 `aria-hidden`이다(`ariaModal: null`,
네이티브 `<dialog>` 미사용). **이 사실까지 적어야 판정이 방어된다.**

⚠️ **prop 조합별로 따로 실측한다.** 위 결과는 `modal` 기본값이다. `modal="trap-focus"`는
배경 `aria-hidden`을 켜면서 백드롭을 끄므로 **AT에게만 배경이 숨겨진다** — 시각 사용자는
배경을 클릭할 수 있는데 스크린리더 사용자는 존재를 모른다. 이 조합은 1.3.2 판정이 뒤집힌다.

## 리포트 표기

| 표기          | 뜻                                                                |
| ------------- | ----------------------------------------------------------------- |
| `위임`        | 실측으로 base-ui가 보장함을 확인. 근거(스냅샷·속성)를 함께 적는다 |
| `조건부 위임` | 특정 prop 조합에서만 보장. 조건을 명시한다                        |
| `자체 구현`   | base-ui가 안 함 — vapor가 보장해야 함                             |
| `미확인`      | 실측 안 했거나 브라우저로 판정 불가. **`위임`으로 쓰지 않는다**   |
