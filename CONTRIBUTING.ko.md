# Vapor UI 기여하기

[English](CONTRIBUTING.md)

Vapor UI에 기여해주셔서 감사합니다! 여러분의 기여는 우리의 디자인 시스템을 더 좋게 만드는 데 도움이 됩니다.

## 행동 강령

우리는 [Contributor Covenant](https://www.contributor-covenant.org/)를 행동 강령으로 채택했습니다. 어떤 행동이 허용되고 허용되지 않는지 이해하기 위해 [전문](./CODE_OF_CONDUCT.md)을 읽어주세요.

## 설계 원칙

- **사용자 경험 우선**: 모든 컴포넌트는 최고의 사용자 경험을 우선시해야 합니다
- **접근성 준수**: 모든 컴포넌트는 누구나 쉽게 접근 가능해야 하며 WCAG 가이드라인을 따라야 합니다
- **조합 가능하고 유연함**: 컴포넌트는 쉽게 조합하고 커스터마이징할 수 있어야 합니다
- **일관된 API**: 예측 가능한 사용을 위해 모든 컴포넌트에서 유사한 패턴을 따라야 합니다

## 질문하기

Vapor UI에 대한 질문이 있으시면 [해당 문서](https://vapor-ui.goorm.io)를 확인해주세요. 또한 다음과 같은 방법도 이용할 수 있습니다:

## 기여하는 방법

Vapor UI에 기여하는 방법은 여러 가지가 있습니다:

- **버그 신고:** 문제를 발견하셨다면 [이슈](https://github.com/goorm-dev/vapor-ui/issues)를 통해 알려주세요.
- **기능 요청:** 새로운 아이디어가 있으시다면 [이슈](https://github.com/goorm-dev/vapor-ui/issues)를 통해 제안해주세요.
- **문서:** 오타 수정, 불명확한 부분 개선, 새로운 예시 추가 등 모든 기여를 환영합니다.
- **코드 기여:** 기존 컴포넌트의 버그 수정이나 테스트 코드 개선은 프로젝트의 핵심 기여입니다.

## Pull Request 준비하기

큰 변경 작업을 시작하기 전에 먼저 이슈를 열어 관리자들과 논의해주세요. 좋은 PR은 작고, 집중적이며, 해결하는 문제를 명확하게 설명합니다.

1. 저장소를 포크하고 클론하세요:

```bash
git clone https://github.com/<YOUR_USERNAME>/vapor-ui.git
cd vapor-ui
git remote add upstream https://github.com/goorm-dev/vapor-ui.git
```

2. Node 버전이 [.nvmrc](../.nvmrc)와 일치하는지 확인하세요:

```bash
node -v
```

3. 의존성을 설치하세요:

```bash
pnpm install
```

4. 개발 서버를 시작하세요:

```bash
pnpm storybook
```

이제 `http://localhost:9009`에서 컴포넌트를 확인할 수 있습니다.

### 개발환경 세팅

1. `main`에서 새 브랜치를 생성하세요:

```bash
git checkout main
git pull upstream main
git checkout -b fix/button-loading-state
```

2. Storybook에서 변경사항을 만들고 테스트하세요.

3. 변경사항에 대한 테스트를 작성하고 모든 테스트 케이스가 통과하는지 확인하세요:

```bash
pnpm test
```

4. UI가 변경되었다면 스냅샷을 업데이트 하세요:

```bash
pnpm test:regressions -- --update-snapshots
```

5. 변경사항이 사용자에게 영향을 미치는 경우 changeset을 추가하세요:

```bash
pnpm changeset
```

6. [Conventional Commits](https://www.conventionalcommits.org/)를 사용하여 변경사항을 커밋하세요:

```bash
git commit -m "fix(Button): correct loading state styling"
```

7. 변경사항을 푸시하고 Pull Request를 생성하세요

## 시각적 회귀 테스트 (VRT)

VRT는 공식 Playwright Docker 컨테이너 안에서 실행되어, 로컬과 CI 환경에서 스크린샷이 바이트 단위로 동일하게 유지됩니다. 로컬에서 스냅샷을 업데이트하려면:

```bash
# 모든 브라우저, 모든 스토리
pnpm core test:regressions:docker -- --update-snapshots

# 특정 브라우저 샤드
pnpm core test:regressions:docker -- --update-snapshots --project=chrome
```

또는 GitHub에서 `Update Visual Snapshots` 워크플로를 직접 실행할 수도 있습니다. 동일한 컨테이너를 사용합니다.

처음 로컬 실행 시에는 Linux 전용 캐시(호스트의 `node_modules`와는 별도)에 의존성을 설치하므로 시간이 더 걸립니다. 이후 실행부터는 캐시를 재사용합니다.

Apple Silicon 사용자: 이 래퍼는 CI 환경과 동일한 픽셀을 보장하기 위해 QEMU 에뮬레이션을 통해 `linux/amd64`를 강제합니다. 픽셀 동등성을 확인한 경우, `VRT_DOCKER_PLATFORM=linux/arm64`를 설정하면 네이티브 속도로 실행할 수 있습니다.
