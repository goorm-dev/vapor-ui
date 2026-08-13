# Node 24 런타임 전환 설계

레포 개발 환경과 CI를 Node.js 24 LTS로 통일한다. 현재 CI에서 검증된 `24.18.0`을 정확한 실행 버전으로 사용하고, Node 25 이상이 자동 선택되지 않도록 허용 범위를 제한한다.

## 배경

Node.js 20은 2026년 4월 30일 지원이 끝났다. 레포의 `.nvmrc`는 여전히 `20.20.2`를 가리키지만, 최근 `quality.yml`의 모든 잡은 `24.18.0`에서 통과했다. 로컬 기준과 실제 검증 환경이 다르고, 현재 `>=20.20.2` 범위는 향후 Node 25나 26도 허용한다.

`packages/codemod`도 이번 전환 대상에 포함한다. 현재 선언한 `>=14.21.3`은 `globby@15`와 `meow@14`의 Node 20 이상 요구사항과도 맞지 않는다. 이번 변경 후 codemod 소비자는 Node.js 24.18.0 이상 25 미만을 사용해야 한다.

## 목표

- 로컬 개발과 프로젝트 CI에서 Node.js `24.18.0`을 사용한다.
- 레포와 전환 대상 패키지는 `>=24.18.0 <25`만 허용한다.
- CI가 `package.json`의 범위를 임의 해석하지 않고 `.nvmrc`의 정확한 버전을 사용하게 한다.
- Node.js 24 전용으로 실행하는 도구의 빌드 타깃과 타입 정의를 맞춘다.
- 기존 품질 검사와 패키지별 검사를 모두 통과한다.

## 제외 범위

- codemod 외 배포 패키지의 Node.js 소비자 계약은 바꾸지 않는다.
- Node.js 20이나 22 호환성 CI 매트릭스를 추가하지 않는다.
- GitHub Action 자체의 Node.js 런타임 메이저 업그레이드는 별도 변경으로 처리한다.
- 새 버전 관리 도구나 자동 업데이트 설정을 추가하지 않는다.

## 버전 정책

| 대상 | 값 | 역할 |
| --- | --- | --- |
| `.nvmrc` | `24.18.0` | 로컬과 프로젝트 CI의 정확한 실행 버전 |
| 루트 `engines.node` | `>=24.18.0 <25` | 지원하지 않는 개발 런타임 차단 |
| `ts-api-extractor` `engines.node` | `>=24.18.0 <25` | 내부 CLI 런타임 계약 |
| `codemod` `engines.node` | `>=24.18.0 <25` | 배포 CLI 소비자 런타임 계약 |
| Node.js 빌드 타깃 | `node24` | Node.js 24 문법과 API를 기준으로 출력 생성 |

정확한 실행 버전과 허용 범위를 분리한다. `.nvmrc`를 갱신하면 개발자와 CI가 같은 패치 버전을 사용한다. `engines.node`는 같은 메이저의 이후 보안 패치 버전을 허용하지만 Node.js 25 이상은 거부한다.

## 변경 설계

### 런타임 선언

`.nvmrc`, 루트 `package.json`, `scripts/ts-api-extractor/package.json`, `packages/codemod/package.json`을 버전 정책에 맞춘다. `CONTRIBUTING.md`와 `CONTRIBUTING.ko.md`는 이미 `.nvmrc`를 참조하므로 수정하지 않는다.

`.github/composite/install/action.yml`의 `node-version-file`을 `package.json`에서 `.nvmrc`로 바꾼다. 이 변경으로 모든 workspace 설치 잡은 범위 내 임의 버전이 아닌 `24.18.0`을 사용한다.

`release.yml`의 `promote-docs` 잡은 workspace를 설치하지 않아 공통 install 액션을 사용하지 않는다. Vercel CLI를 설치하기 전에 Node.js 24를 직접 설정해 runner 기본 버전에 의존하지 않게 한다.

### 빌드와 타입 기준

`scripts/ts-api-extractor/tsup.config.ts`의 `node20` 타깃을 `node24`로 바꾼다. `packages/codemod/tsup.config.ts`에도 `node24` 타깃을 명시한다.

Node.js 24 런타임을 직접 사용하는 다음 개발 의존성만 `@types/node@^24.13.3`으로 갱신한다.

- 루트 도구
- `apps/website`
- `scripts/ts-api-extractor`
- `packages/codemod`

다른 배포 패키지의 `@types/node`는 소비자 호환성 범위를 넓히지 않도록 유지한다. 의존성 변경 후 `pnpm-lock.yaml`을 다시 생성한다.

### 문서

`.gemini/styleguide.md`의 Node.js 기준을 `>=24.18.0 <25`로 고친다. `ts-api-extractor`의 오래된 `>=20.19` 주석은 값 중복을 피하기 위해 제거한다.

### GitHub Action 런타임

프로젝트 Node.js 전환과 GitHub Action 실행 런타임은 서로 다른 계층이다. `actions/checkout`, `actions/setup-node`, `pnpm/action-setup` 등의 메이저 업그레이드는 별도 변경으로 수행한다. Node.js 24 전환 PR에서는 프로젝트 명령의 런타임만 고정해 검증 범위를 작게 유지한다.

## 검증 방법

Node.js `24.18.0`에서 다음 명령을 순서대로 실행한다.

```bash
nvm use
node --version
pnpm install --frozen-lockfile
pnpm build
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test
pnpm --filter @vapor-ui/codemod test
pnpm --filter @vapor-ui/ts-api-extractor test:run
```

`node --version`은 `v24.18.0`을 출력해야 한다. PR의 `quality.yml` 5개 잡도 같은 버전을 사용해야 한다. Node.js 엔진 오류, 타입 오류, 테스트 실패가 없으면 전환을 완료한다.

## 완료 조건

- 로컬과 모든 workspace CI 잡이 Node.js `24.18.0`을 사용한다.
- 루트, ts-api-extractor, codemod가 `>=24.18.0 <25`를 선언한다.
- ts-api-extractor와 codemod가 `node24`를 빌드 타깃으로 사용한다.
- codemod를 제외한 배포 패키지의 소비자 계약은 바뀌지 않는다.
- 전체 빌드, 린트, 타입 검사, 포맷 검사, 테스트가 통과한다.
