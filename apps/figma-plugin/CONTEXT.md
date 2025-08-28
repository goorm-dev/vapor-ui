# color generator 피그마 플러그인

## 핵심 목적

Vapor UI 디자인 시스템의 컬러 시스템을 Figma에서 직접 생성하고 관리할 수 있는

## 주요 기능 요구사항:

1. @vapor-ui/color-generator를 활용해서 dark / light 10단계 색상 팔레트 자동 테이블 UI 생성 (50-900)
1. 사용자가 accept하면, 해당 색상 팔레트를 Figma Variables API 연동으로 변수 생성 (`apps/figma-plugin/working-with-variables.html` 문서화 사이트 내용 참고할 것)
1. color-generator의 `DEFAULT_MAIN_BACKGROUND_LIGHTNESS`에서 숫자값을 수정할 수 있어야함
1. color-generator의 `DEFAULT_PRIMITIVE_COLORS`에서 Hue(색조)를 더하거나 뺄 수 있어야함.
1. color-generator의 `DEFAULT_PRIMITIVE_COLORS`에서 Hue(색조)의 hexcode를 변경할 수 있어야함
1. color-generator의 `DEFAULT_CONTRAST_RATIOS`에서 ratio 숫자값을 변경할 수 있어야함

## 기술적 요구사항:

- 모노레포 내부 패키지, @vapor-ui/color-generator 패키지 활용 (`packages/color-generator`)
- Pnpm, Vite, React, Ts, Tailwindcss V4 (4.1.12 이상), @figma/plugin-typings 사용
- Figma API와의 원활한 통합
- OKLCH/Hex 컬러 포맷 지원
