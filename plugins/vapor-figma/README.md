# vapor-figma

Claude Code에서 Vapor core 라이브러리(Figma 팀 라이브러리 `Vapor Design System`) 컴포넌트로 Figma 시안을 만드는 plugin입니다. 시안 속 컴포넌트를 detach하지 않고 라이브러리 원본과 연결된 instance로 유지하는 것이 목표입니다.

## 필요한 것

- Claude Code
- Figma 공식 plugin (`figma@claude-plugins-official`) — Figma MCP 서버와 `figma-use` 스킬
- 시안을 만들 Figma 파일에서 `Vapor Design System`, `[V2.0] [Goorm theme] Foundation` 라이브러리 사용 권한

## 설치

```bash
# main 브랜치
/plugin marketplace add goorm-dev/vapor-ui
/plugin install vapor-figma@vapor-ui
```

머지 전 브랜치에서 설치하려면 마켓플레이스를 브랜치로 추가합니다.

```bash
/plugin marketplace add goorm-dev/vapor-ui#feature/vapor-321
/plugin install vapor-figma@vapor-ui
```

브랜치에 새 커밋이 올라오면 `/plugin marketplace update vapor-ui`로 받습니다.

## 사용

Figma 파일 URL과 함께 만들 화면을 말합니다.

```
https://www.figma.com/design/<fileKey>/... 여기에 결제 확인 Dialog 시안 만들어줘
```

스킬 이름은 `vapor-figma:vapor-figma-compose`입니다. 요청에 맞으면 Claude가 알아서 불러오고, 직접 호출해도 됩니다.

## 범위

core 라이브러리의 🟢 Stable 컴포넌트만 다룹니다. Composites, Alpha, Archive, Deprecated 컴포넌트는 쓰지 않습니다.
