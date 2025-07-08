# Vapor UI에 기여해 주셔서 감사합니다!

안녕하세요! 저희 Vapor UI 디자인 시스템 오픈소스 프로젝트에 관심을 가져주셔서 감사합니다. 여러분의 기여는 저희 프로젝트를 더욱 풍부하고 견고하게 만드는 데 큰 힘이 됩니다.

이 문서는 프로젝트에 기여하는 데 필요한 개발 환경 설정, 브랜치 전략, 코딩 스타일, Pull Request 프로세스 등을 안내합니다. 기여를 시작하기 전, 이 문서를 주의 깊게 읽어주세요.

## 무엇을 기여할 수 있나요?

다양한 방법으로 Vapor UI에 기여할 수 있습니다.

- **버그 리포트:** 잘못된 부분을 발견했다면 주저하지 말고 [Issue](https://github.com/goorm-dev/vapor-ui/issues)를 등록해주세요.
- **기능 제안:** 새로운 아이디어가 있다면 [Issue](https://github.com/goorm-dev/vapor-ui/issues)를 통해 제안해주세요.
- **문서 개선:** 문서의 오타를 수정하거나, 이해하기 어려운 부분을 개선하고, 새로운 예제를 추가하는 등의 모든 기여를 환영합니다.
- **코드 기여:** 기존 컴포넌트의 버그를 수정하고, 테스트 코드를 개선하는 등의 코드 기여는 프로젝트의 핵심입니다.

## 시작하기

### 1. 개발 환경

저희 프로젝트는 다음의 개발 환경을 사용합니다:

- **Package Manager**: `pnpm` v10+
- **Node.js**: v20+
- **Linting & Formatting**: ESLint, Prettier

먼저 프로젝트를 Fork 및 Clone 한 후, 아래 명령어로 의존성을 설치하고 개발 서버를 실행하세요.

```bash
# 프로젝트 클론
git clone [https://github.com/](https://github.com/)<YOUR_USERNAME>/vapor-ui.git
cd vapor-ui

# PNPM으로 의존성 설치
pnpm install

# Storybook 개발 서버 실행
pnpm storybook
```

이제 `http://localhost:9009`에서 실행 중인 Storybook을 통해 컴포넌트 개발을 시작할 수 있습니다.

## Git & 버전 관리

프로젝트의 커밋 히스토리를 깔끔하게 유지하고 버전 관리를 자동화하기 위해 명확한 규칙을 따르고 있습니다.

### 1. 브랜치 전략 (GitHub Flow)

저희는 **GitHub Flow** 전략을 따릅니다. `main` 브랜치가 항상 배포 가능한 상태를 유지하는 것을 목표로 합니다.

- **`main` 브랜치:** 프로젝트의 핵심 브랜치입니다. 모든 변경 사항은 최종적으로 `main` 브랜치에 병합됩니다.
- **작업 흐름:**
    1.  새로운 기능 개발이나 버그 수정을 위해 `main` 브랜치에서 새로운 브랜치를 생성합니다. 브랜치 이름은 작업 내용을 명확하게 설명해야 합니다.
    2.  새로운 브랜치에서 작업을 완료하고 커밋합니다.
    3.  작업이 완료되면 `main` 브랜치로 향하는 Pull Request(PR)를 생성합니다.
    4.  코드 리뷰와 CI 테스트를 통과하면 PR을 `main` 브랜치에 병합합니다.
    5.  병합 후에는 작업했던 브랜치를 삭제합니다.

```bash
# main 브랜치를 최신 상태로 업데이트
git checkout main
git pull upstream main

# 새 기능 브랜치 생성
git checkout -b create-button-loading-state
```

### 2. 커밋 메시지 (Conventional Commits)

모든 커밋은 **Conventional Commits 명세**를 따라야 합니다. 이는 SemVer 기반 버전 관리 및 변경사항 추적을 자동화하는 데 필수적입니다.

**커밋 형식:**
`<type>(<scope>): <subject>`

- **주요 Type과 버전 영향**:
    - `feat`: 새로운 기능 추가 시 사용합니다. **(MINOR 버전 상승)**
        - `feat(Avatar): add new Avatar component`
    - `fix`: 버그 수정 시 사용합니다. **(PATCH 버전 상승)**
        - `fix(Input): correct placeholder color in disabled state`
    - `feat!`, `fix!`, 또는 푸터에 `BREAKING CHANGE:` 추가: 기존 API와 호환되지 않는 큰 변경이 있을 때 사용합니다. **(MAJOR 버전 상승)**
        - `feat(Button)!: change 'kind' prop to 'variant' for clarity`

- **기타 Type**:
    - `docs`, `style`, `refactor`, `test`, `perf`, `chore` 등이 있습니다. 이 타입들은 일반적으로 버전 상승에 영향을 주지 않습니다.

- **Scope**: 변경된 컴포넌트나 패키지명을 소문자로 작성합니다. (예: `modal`, `hooks`)
- **Subject**: 현재 시제의 명령문으로, 50자 이내로 간결하게 작성합니다. (예: `add support for dark mode`)

## 변경사항 관리 (Changesets)

사용자에게 영향을 주는 변경사항(기능 추가, 버그 수정 등)이 있다면, **반드시 changeset을 추가해야 합니다.** 커밋 메시지와 함께, changeset은 버전 관리와 릴리즈 노트 생성에 사용됩니다.

```bash
pnpm changeset
```

위 명령어를 실행하고, 안내에 따라 변경된 패키지, 버전 레벨(Major, Minor, Patch), 그리고 상세한 변경 내용을 마크다운 형식으로 작성해주세요.

## 코딩 스타일 및 컨벤션

저희는 `.gemini/styleguide.md`에 정의된 스타일 가이드를 따릅니다. Pull Request 생성 시 **Gemini Code Assist**가 이 스타일 가이드를 기반으로 자동으로 코드 리뷰를 진행하므로, 기여하기 전에 반드시 숙지해주시기 바랍니다.

주요 컨벤션은 다음과 같습니다.

### 1. 파일 및 폴더 구조

- **네이밍**: 모든 파일과 디렉터리는 `kebab-case`를 사용합니다. (예: `text-input.tsx`)
- **컴포넌트 구조 (Colocation)**: 컴포넌트 구현(`*.tsx`), 스타일(`*.css.ts`), 스토리(`*.stories.tsx`), 테스트(`*.test.tsx`) 파일은 모두 같은 컴포넌트 폴더 내에 위치시킵니다.
    ```bash
    src/components/text-input/
    ├── index.ts
    ├── text-input.tsx
    ├── text-input.css.ts
    ├── text-input.stories.tsx
    └── text-input.test.tsx
    ```
- **엔트리포인트 (`index.ts`)**: 컴포넌트의 공개 API(컴포넌트, 타입 등)를 명확히 정의하고 내보냅니다. 네임스페이스와 타입을 구분하여 export하는 전략을 따릅니다.

### 2. TypeScript & React

- **`React.FC` 지양**: 화살표 함수와 명시적인 Props 타입으로 컴포넌트를 정의합니다.
- **Type vs Interface**: 컴포넌트 Props와 같이 확장 가능한 객체 구조에는 `interface`를, Union/Intersection 등 복합 타입에는 `type`을 사용합니다.
- **`as const` 활용**: Enum 대신 `as const`를 사용하여 Tree-shaking에 유리하고 타입 추론이 명확한 상수를 정의하는 것을 권장합니다.
- **Props 타입**: `React.ComponentPropsWithoutRef`를 활용하여 HTML 표준 속성을 상속받고, 컴포넌트 고유의 Props만 직접 정의하여 중복을 최소화합니다.
- **컴파운드 컴포넌트**: `Object.assign`을 사용하여 `Dialog.Trigger`와 같이 직관적으로 사용할 수 있도록 하위 컴포넌트를 주 컴포넌트에 할당하여 export 합니다.

### 3. 스타일링 (Vanilla Extract)

- **`recipe` 함수**: 컴포넌트의 `variant`나 `size`와 같이 여러 상태에 따른 스타일을 정의할 때 사용합니다.
- **CSS 변수**: 모든 색상, 간격, 폰트 사이즈 등 디자인 토큰은 사전에 정의된 CSS 변수(`vars`)를 통해 사용해야 합니다. 하드코딩을 지양합니다.
- **`classnames`**: 조건부 스타일링 등 동적으로 클래스명을 조합할 때는 `classnames` 라이브러리를 사용합니다.

## 테스트 및 문서화

- **테스트**: 모든 기능 추가 및 수정에는 반드시 테스트 코드가 동반되어야 합니다. 테스트 코드는 해당 컴포넌트 폴더 내에 위치합니다.
- **문서화 (Storybook)**: 컴포넌트의 시각적 테스트 및 사용법 문서는 Storybook을 통해 관리됩니다.
    - 새로운 컴포넌트나 기능 추가 시, 다양한 `variant`와 `use case`를 보여줄 수 있는 스토리를 작성해야 합니다.

## Pull Request (PR) 프로세스

1.  모든 작업을 `feature` 브랜치에서 완료한 후, `main` 브랜치를 대상으로 PR을 생성합니다.
2.  PR 템플릿의 모든 항목(변경 사항, 테스트 내용, 관련 이슈 등)을 충실하게 작성합니다.
3.  PR을 생성하면 [Gemini Code Assist](https://github.com/apps/gemini-code-assist)가 코드 스타일 가이드 준수 여부를 자동으로 리뷰합니다. 수정 요청 사항을 반드시 반영해주세요.
4.  최소 2명 이상의 코드 리뷰어로부터 **`approve`** 를 받아야 합니다.
5.  모든 조건이 충족되면 **Squash and merge** 방식으로 `main` 브랜치에 병합됩니다.

## 릴리즈 프로세스

Vapor UI는 `changesets`와 **GitHub Actions**를 사용하여 릴리즈 과정을 자동화합니다.

1.  기능 브랜치에 changeset 파일이 포함된 채로 `main` 브랜치에 PR이 병합됩니다.
2.  `main` 브랜치에 푸시가 발생하면, `.github/workflows/release.yml` 워크플로우가 트리거됩니다.
3.  `changesets/action`이 이를 감지하여 관련된 패키지들의 버전을 올리고 `CHANGELOG.md`를 업데이트하는 내용의 **Release Pull Request**를 자동으로 생성합니다.
4.  이 **Release Pull Request**가 `main` 브랜치에 병합되면, 워크플로우는 `pnpm run release` 스크립트를 실행하여 변경된 패키지를 빌드하고 NPM에 새로운 버전을 배포하며, GitHub Release를 생성합니다.

## 커뮤니티 (Community)

궁금한 점이 있거나 다른 기여자들과 소통하고 싶다면 저희 Discord 채널에 참여해주세요!

- **[Vapor UI Discord 채널 참여하기](https://discord.gg/PMqxs3xaHC)**

---

Vapor UI에 기여해주셔서 다시 한번 감사드립니다. 여러분의 참여가 저희 커뮤니티를 더욱 건강하고 활기차게 만듭니다. 궁금한 점이 있다면 언제든지 Issue를 통해 질문해주세요!
