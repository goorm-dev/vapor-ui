# vapor-ui

Figma 시안을 vapor-ui 코드로 옮기고 `@vapor-ui/figma-eval`로 채점하는 개발자용 plugin입니다. Figma에서 시안을 만드는 디자이너용 plugin은 [vapor-figma](../vapor-figma)입니다.

## 설치

```bash
/plugin marketplace add goorm-dev/vapor-ui
/plugin install vapor-ui@vapor-ui
```

Claude Code가 아닌 에이전트는 `npx skills add goorm-dev/vapor-ui`로 설치합니다.

## 스킬

| 스킬               | 하는 일                                            |
| ------------------ | -------------------------------------------------- |
| `components`       | 컴포넌트·아이콘·props 조회                         |
| `implement-figma`  | Figma 시안을 vapor-ui 코드로 옮긴다                |
| `check-components` | 관문 1, 컴포넌트 재현율(`figma-eval compare`)      |
| `check-styling`    | 관문 2, absolute·하드코딩 값(`figma-eval styling`) |
| `visual-score`     | 시각 점수(`figma-eval visual`)                     |
| `figma-to-code`    | 구현 → 관문 2개 → 최대 2회 개선 → 시각 점수        |

필요한 환경, 점수 읽는 법, 예외의 의미는 [Agent Skills 문서](https://vapor-ui.goorm.io/docs/getting-started/ai-skill)에 있습니다.
