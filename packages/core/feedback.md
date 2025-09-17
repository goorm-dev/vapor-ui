현재 모노레포 구조를 분석한 결과, 전문적인 관점에서 CLI와 패키지 네이밍에 대해 분석해보겠습니다.

  CLI 패키지 위치 및 구조 분석

  현재 모노레포 구조 특성

  워크스페이스 분류:
  - apps/*: 사용자 대상 애플리케이션 (figma-plugin, website)
  - packages/*: 라이브러리 패키지 (core, color-generator, hooks, icons, eslint-config,
  typescript-config)
  - tools/cli: 비어있는 디렉토리 (미사용)

  CLI 패키지 위치 권고안

  결론: packages/* 하위에 위치

  이유:
  1. 패키지 성격: CLI도 결국 npm 배포 대상인 라이브러리 패키지
  2. 일관성: 기존 패키지들과 동일한 빌드/배포 파이프라인 활용
  3. 의존성 관리: @vapor-ui/theme-utils 의존성을 자연스럽게 해결
  4. 버전 관리: 다른 패키지와 동일한 릴리스 사이클 적용 가능

  구체적 구조:
  packages/
  ├── theme-cli/                    # 권고안
  │   ├── bin/
  │   │   └── vapor-theme.js       # CLI 진입점
  │   ├── src/
  │   │   ├── commands/
  │   │   │   ├── init.ts
  │   │   │   └── generate.ts
  │   │   └── index.ts
  │   ├── package.json
  │   └── tsconfig.json

  대안 검토:
  - tools/cli: 내부 도구용이므로 부적절
  - apps/cli: 가능하지만 앱이라기보다 도구에 가까움
  - 별도 폴더: 불필요한 복잡성 증가

  패키지 네이밍 분석

  @vapor-ui/theme-utils 네이밍 검토

  현재 packages 네이밍 패턴:
  - color-generator: 도메인 + 역할 (kebab-case)
  - typescript-config: 기술 + 역할 (kebab-case)
  - eslint-config: 도구 + 역할 (kebab-case)
  - core: 단순명 (주요 컴포넌트 패키지)
  - hooks: 단순명 (React 훅 모음)
  - icons: 단순명 (아이콘 컴포넌트)

  @vapor-ui/theme-utils 평가:

  ❌ 부적절한 이유:
  1. 일관성 부족: 기존 패키지는 모두 kebab-case 사용
  2. 모호한 의미: "utils"는 너무 포괄적
  3. 기능 불명확: CSS 생성이 주 기능임을 드러내지 못함

  ✅ 개선된 네이밍 권고안:

  1순위: @vapor-ui/css-generator
  - 기능 명확성: CSS 생성이 주 목적
  - 일관성: color-generator와 유사한 패턴
  - 직관성: 개발자가 즉시 기능 파악 가능

  2순위: @vapor-ui/theme-generator
  - 포괄적 기능 표현
  - 확장성 있음 (색상 외 다른 테마 요소 포함)

  3순위: @vapor-ui/theme-css
  - 간결함
  - 테마 관련 CSS 생성임을 명확히 표현

  CLI 패키지 네이밍

  권고안: @vapor-ui/theme-cli

  이유:
  1. 일관성: 기존 kebab-case 패턴 준수
  2. 명확성: 테마 관련 CLI 도구임을 명시
  3. 범위: 향후 다른 CLI 기능 추가 시 확장 가능

  bin 설정:
  {
    "name": "@vapor-ui/theme-cli",
    "bin": {
      "vapor-theme": "./bin/vapor-theme.js"
    }
  }

  최종 권고사항

  패키지 구조

  packages/
  ├── css-generator/              # theme-utils → css-generator로 변경
  │   ├── src/
  │   │   ├── generators/
  │   │   │   ├── color-css.ts   # color-generator 의존
  │   │   │   ├── scaling-css.ts
  │   │   │   └── radius-css.ts
  │   │   └── index.ts
  │   └── package.json
  │
  ├── theme-cli/                  # 새로 추가
  │   ├── bin/
  │   │   └── vapor-theme.js
  │   ├── src/
  │   │   ├── commands/
  │   │   └── index.ts
  │   └── package.json
  │
  └── color-generator/            # 기존 유지
      └── ...

  의존성 관계

  @vapor-ui/theme-cli → @vapor-ui/css-generator → @vapor-ui/color-generator
  @vapor-ui/core (독립적)

  CLI 사용법

  # 설치
  npm install -g @vapor-ui/theme-cli

  # 사용
  vapor-theme init
  vapor-theme generate --primary="#2A6FF3" --scaling=1.2 --radius=8

  패키지 크기 최적화

  CLI 패키지 특성상:
  - 선택적 설치 (devDependencies)
  - 런타임 번들에 포함되지 않음
  - 개발 도구로만 사용

  이 구조는 기존 패턴과 일관성을 유지하면서도 각 패키지의 역할을 명확히 구분하고, 확장성을 고려한
  최적의 설계입니다.