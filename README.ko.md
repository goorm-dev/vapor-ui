[![Vapor UI Logo](vapor-ui.png)](https://vapor-ui.goorm.io)

# Goorm Design System: Vapor UI

[English](README.md)

[![Status: WIP](https://img.shields.io/badge/status-WIP-orange.svg)](https://github.com/goorm-dev/vapor-ui) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 🚧 **현재 이 프로젝트는 정식 출시 전(Pre-release) 상태입니다.** 🚧
> [!WARNING]
> 아직 개발이 활발하게 진행 중이며, 언제든지 Breaking Changes가 발생할 수 있습니다.
> 프로덕션 환경에서의 사용은 권장하지 않으며, 정식 릴리즈는 `v0.2.0`으로 시작될 예정입니다.

<br/>

**고품질의 접근성 높은 웹 앱과 디자인 시스템을 구축하기 위한 오픈소스 UI 컴포넌트 라이브러리입니다.**

Vapor는 React 기반의 UI 라이브러리로, 접근성, 커스터마이징, 그리고 개발자 경험에 중점을 두고 설계되었습니다. 여러분의 디자인 시스템을 위한 기반 레이어로 사용하거나 기존 프로젝트에 점진적으로 도입할 수 있습니다.

---

## 문서

- **[사용법](https://vapor-ui.goorm.io/docs/overview/installation)**: 라이브러리 설치 및 설정 방법을 안내합니다.
- **[기여하기](https://github.com/goorm-dev/vapor-ui/blob/main/CONTRIBUTING.md)**: 프로젝트 기여 가이드라인과 로컬 설정 방법을 안내합니다.
- **[릴리즈](https://github.com/goorm-dev/vapor-ui/releases)**: 각 버전의 변경 사항을 확인할 수 있습니다.

## 시작하기

프로젝트에 Vapor UI를 설치하려면 다음 명령어를 사용하세요:

```bash
npm i @vapor-ui/core @vapor-ui/icons @vapor-ui/hooks
```

자세한 사용법은 [공식 문서](https://vapor-ui.goorm.io/docs/overview/installation)를 참고하세요.

## 핵심 원칙

- **일관성**: 모든 애플리케이션에서 통일된 사용자 경험을 제공합니다.
- **재사용성**: 잘 정의된 컴포넌트와 로직으로 반복 작업을 줄이고 생산성을 높입니다.
- **유연성**: 테마 시스템을 통해 손쉬운 커스터마이징을 지원합니다.
- **신뢰성**: 모든 코드가 TypeScript로 작성되어 예측 가능하고 안정적인 개발을 지원합니다.

## 패키지 구조

Vapor는 pnpm Workspace와 Turborepo를 사용하여 여러 패키지를 효율적으로 관리하는 모노레포입니다.

| 패키지                  | 설명                                                               | NPM                                                                                                       |
| ----------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| @vapor-ui/core          | 핵심 UI 컴포넌트 라이브러리                                        | [![npm](https://img.shields.io/npm/v/@vapor-ui/core.svg)](https://www.npmjs.com/package/@vapor-ui/core)   |
| @vapor-ui/icons         | Vapor UI 디자인 시스템에서 사용하는 SVG 아이콘 React 컴포넌트 세트 | [![npm](https://img.shields.io/npm/v/@vapor-ui/icons.svg)](https://www.npmjs.com/package/@vapor-ui/icons) |
| @vapor-ui/hooks         | Vapor UI 디자인 시스템을 위한 재사용 가능한 React 훅 모음          | [![npm](https://img.shields.io/npm/v/@vapor-ui/hooks.svg)](https://www.npmjs.com/package/@vapor-ui/hooks) |
| apps/website            | 공식 문서 웹사이트                                                 | -                                                                                                         |
| @repo/eslint-config     | 공유 ESLint 설정                                                   | -                                                                                                         |
| @repo/typescript-config | 공유 TypeScript tsconfig 설정                                      | -                                                                                                         |
