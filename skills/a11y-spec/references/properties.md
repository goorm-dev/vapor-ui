# 성질 어휘 (property vocabulary)

컴포넌트 이름에서 추론하는 태그 집합. **SC에서 귀납적으로 도출됐다** — 각 태그는 최소 하나의
성공 기준을 발동시킨다. 발동시키는 SC가 없는 태그는 존재해선 안 된다.

성공 기준은 컴포넌트가 아니라 **콘텐츠의 속성**에 걸린다. 그래서 판정 단위는 컴포넌트 이름이
아니라 여기 태그다.

| 태그             | 정의                                                                    | 판별 질문                               | 예                             |
| ---------------- | ----------------------------------------------------------------------- | --------------------------------------- | ------------------------------ |
| `interactive`    | 사용자 조작을 받는다 (포커스를 받거나 포인터에 반응)                    | 탭으로 도달하는가?                      | Button, Checkbox, Tabs         |
| `composite`      | 여러 자식 항목을 하나의 위젯으로 관리한다 (roving tabindex·화살표 이동) | 탭 정지점이 1개인데 내부 이동이 있는가? | Tabs, RadioGroup, Menu, Select |
| `text`           | 텍스트를 직접 렌더한다                                                  | 컴포넌트가 글자를 그리는가?             | Text, Badge, Button            |
| `icon`           | 아이콘·이미지를 렌더하거나 받는다                                       | 비텍스트 요소가 의미를 나르는가?        | IconButton, Avatar, Alert      |
| `visible-label`  | 보이는 텍스트 레이블을 갖는다                                           | 화면에 이름이 글자로 보이는가?          | Button, Checkbox, Tab          |
| `form-control`   | 값을 갖고 폼에 제출된다                                                 | `name`/`value`를 갖는가?                | Input, Select, Switch          |
| `text-input`     | 자유 텍스트를 입력받는다                                                | 키보드로 임의 문자열을 넣는가?          | Input, Textarea                |
| `validatable`    | 오류 상태를 가질 수 있다                                                | invalid 상태가 있는가?                  | Input, Field, Select           |
| `state-visual`   | 상태를 시각 신호로 표시한다                                             | 선택·활성·에러가 눈으로 구분되는가?     | Checkbox, Tab, Badge           |
| `ui-boundary`    | 테두리·배경으로 자기 경계나 컨트롤 형태를 그린다                        | 인접 콘텐츠와 경계선이 필요한가?        | Card, Input, Button            |
| `overlay`        | 다른 콘텐츠 위에 레이어로 뜬다 (대개 Portal)                            | DOM 위치와 시각 위치가 어긋나는가?      | Dialog, Popover, Toast         |
| `transient`      | 포인터/포커스에 의해 떴다가 사라진다                                    | hover를 떼면 사라지는가?                | Tooltip, HoverCard, Popover    |
| `modal`          | 배경 상호작용을 차단하고 포커스를 가둔다                                | 열려 있는 동안 배경을 못 쓰는가?        | Dialog, Drawer                 |
| `auto-dismiss`   | 사용자 조작 없이 시간이 지나면 사라진다                                 | 타이머로 닫히는가?                      | Toast, Snackbar                |
| `auto-motion`    | 자동으로 움직이거나 재생된다 (5초 초과)                                 | 사용자가 시작하지 않은 움직임이 있는가? | Carousel, Skeleton, Spinner    |
| `pointer-target` | 포인터로 누르는 대상 영역을 갖는다                                      | 클릭 히트 영역이 있는가?                | Button, Checkbox, IconButton   |
| `gesture`        | 경로·다중 포인터 제스처로 조작한다                                      | 드래그·스와이프·핀치가 있는가?          | Slider, Carousel, Drawer       |
| `device-motion`  | 기기 자체의 움직임(흔들기·기울이기)에 반응한다                          | 가속도계·자이로를 쓰는가?               | (해당 컴포넌트 드묾)           |
| `char-shortcut`  | 수식키 없는 단일 문자 키를 바인딩한다                                   | `a` 같은 키 하나로 동작하는가?          | Menu(typeahead), Combobox      |
| `status-message` | 포커스를 옮기지 않고 상태 변화를 알린다                                 | 화면 변화를 AT가 알아야 하는가?         | Toast, Alert, Progress         |
| `link`           | 다른 위치로 이동시킨다                                                  | `<a href>` 의미인가?                    | Link, Breadcrumb, Pagination   |
| `table`          | 행·열 구조로 데이터를 배치한다                                          | 헤더-셀 관계가 있는가?                  | Table, DataGrid                |
| `media`          | 오디오·비디오를 재생한다                                                | 시간 기반 미디어인가?                   | VideoPlayer                    |

## 추론 규칙

컴포넌트 이름만 주어졌을 때:

1. 이름이 위 예시에 있으면 그 행의 태그를 우선 채택한다.
2. 없으면 판별 질문에 답해서 태그를 붙인다. **애매하면 붙인다** — 이 스킬의 출력은 명세지
   판정이 아니므로, 위양성(불필요한 SC 1건)이 위음성(놓친 SC 1건)보다 싸다.
3. `interactive`가 붙으면 `pointer-target`도 거의 항상 붙는다 (키보드 전용 컴포넌트가 아닌 한).
4. `modal`이 붙으면 `overlay`도 붙는다. `transient`가 붙으면 `overlay`도 붙는다.
5. `text-input`·`form-control`이 붙으면 `validatable`을 붙일지 확인한다 —
   오류 상태를 안 갖는 폼 컨트롤은 드물다.
6. 붙인 태그와 그 근거를 리포트에 남긴다. 사용자가 반박할 수 있어야 한다.
