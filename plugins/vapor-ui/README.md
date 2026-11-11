# vapor-ui

Figma 시안을 vapor-ui 코드로 옮기고 시안과 대조해 채점하는 개발자용 plugin입니다. Figma에서 시안을 만드는 디자이너용 plugin은 [vapor-figma](../vapor-figma)입니다.

## 설치

```bash
/plugin marketplace add goorm-dev/vapor-ui
/plugin install vapor-ui@vapor-ui
```

Claude Code가 아닌 에이전트는 `npx skills add goorm-dev/vapor-ui`로 설치합니다.

## 스킬

| 스킬               | 하는 일                                                                  |
| ------------------ | ------------------------------------------------------------------------ |
| `setup`            | 하네스가 쓰는 환경을 확인하고 빠진 것을 설치한다. 직접 실행한다          |
| `components`       | 컴포넌트·아이콘·props 조회                                               |
| `implement-figma`  | 채점 없이 Figma 시안을 vapor-ui 코드로만 옮긴다                          |
| `check-components` | 관문 1, 컴포넌트 재현율(`figma-blueprint` 정답 트리 + 검증 서브에이전트) |
| `visual-score`     | 시각 점수(`figma-blueprint` 정답 트리 + `visual.mjs`)                    |
| `figma-to-code`    | 구현 → 관문 1 → 최대 2회 개선 → 시각 점수                                |

## 필요한 환경

처음 쓰기 전에 앱 폴더에서 setup을 한 번 실행합니다. Node 버전, 컴포넌트 패키지, `@vapor-ui/figma-blueprint`, `FIGMA_ACCESS_TOKEN`, Figma MCP, Playwright를 확인하고 빠진 것을 설치합니다.

```
/vapor-ui:setup
```

필요한 환경의 목록과 점수 읽는 법, 예외의 의미는 [Agent Skills 문서](https://vapor-ui.goorm.io/docs/getting-started/ai-skill)에 있습니다.
