# VRT 크로스 플랫폼 폰트 통일 설계

작성일: 2026-06-15
대상 워크플로: `.github/workflows/test-regressions.yml`, `.github/workflows/update-snapshots.yml`

## 배경

Vapor UI는 Playwright + Storybook 기반 시각적 회귀 테스트(VRT)를 운영한다. 개발자는 macOS에서 로컬 스냅샷을 갱신하고, GitHub Actions에서 CI VRT가 동작한다.

기본 Linux runner는 macOS와 폰트 렌더링 결과가 달라 동일 스냅샷이 매칭되지 않았다. 임시 대응으로 `runs-on: macos-latest`를 지정해 환경을 일치시켰으나 다음 비용을 떠안았다.

- macOS runner 분당 과금이 Linux 대비 10배
- 부팅/실행이 현저히 느림
- 컨테이너 기반 안정성 부족 (자잘한 비결정적 실패)

근본 원인은 `apps/storybook/.storybook/global.css`가 모든 요소에 `font-family: Arial`을 강제하는데, Linux에는 Arial이 설치되어 있지 않다는 점이다. fontconfig가 Liberation Sans / DejaVu Sans로 fallback하면서 macOS의 실제 Arial과 글리프 metric이 미세하게 어긋나 스크린샷 diff가 발생한다.

## 목표

- Linux runner 복귀로 CI 속도와 안정성 회복
- macOS 로컬과 Linux CI에서 픽셀 단위 동일한 VRT 스냅샷 생성
- FOUT/FOUC 없는 폰트 로딩 (현재 Arial 강제 적용의 원래 의도 보전)

## 비목표

- Vapor UI의 디자인 시스템 폰트 정책 변경 (제품 폰트는 별개)
- 일반 사용자 환경에서의 폰트 정책 변경 — 변경은 Storybook 테스트 베드에만 국한
- Playwright/Storybook 외 다른 테스트 인프라 손질

## 접근

핵심 원리: **테스트 환경에서 OS 시스템 폰트에 대한 의존을 제거한다.** 모든 환경이 동일한 self-host 웹폰트만 보도록 하면 OS 차이가 사라진다.

Arial 대체로 **Arimo**를 선택한다. Arimo는 Google이 제작한 Arial metric-compatible 오픈소스 폰트로, 글리프 폭과 높이가 Arial과 호환된다. 라이선스는 Apache 2.0으로 OSS 라이브러리 배포에 적합하다.

### 왜 self-host인가

- `@import` / 외부 CDN: 네트워크 fetch 발생, FOUT 위험, CI 실패 가능성, 결정성 약함
- self-host woff2: same-origin 정적 파일, localhost ms 단위 응답. 결정성 100%

### 왜 FOUT 걱정이 없는가

1. `@font-face`는 same-origin fetch이므로 외부 네트워크에 의존하지 않는다.
2. `font-display: block`으로 폰트 로드 전까지 텍스트를 invisible 상태로 두고 swap 단계를 생략한다 → 사용자에게 FOUT/FOUC가 노출되지 않는다.
3. `<link rel="preload">`로 HTML 파싱 단계에서 폰트 다운로드를 트리거해 invisible 구간을 최소화한다.
4. VRT 측면에서는 `regressions.test.ts:34`에 이미 `await page.waitForFunction(() => document.fonts.ready)`가 존재한다. 폰트 로드가 끝나기 전엔 스크린샷이 절대 찍히지 않으므로 VRT 결과에 FOUT 영향이 들어올 수 없다.

## 설계

### 1. 폰트 자산

- 파일: `Arimo-VariableFont_wght.woff2` (Google Fonts 배포본, Apache 2.0)
- 위치: `apps/storybook/.storybook/fonts/Arimo-VariableFont_wght.woff2`
- repo에 commit (의존성 매니저 경유하지 않음, 재현성 100%)

variable font 단일 파일로 충분하다 — weight 100..900 전 구간 보간 가능하며 정적 woff2 두 개보다 총 용량이 작다.

### 2. CSS

`apps/storybook/.storybook/global.css`:

```css
@font-face {
    font-family: 'Arimo';
    src: url('./fonts/Arimo-VariableFont_wght.woff2') format('woff2-variations');
    font-weight: 100 900;
    font-style: normal;
    font-display: block;
}

* {
    font-family: 'Arimo', sans-serif;
}
```

`font-display: block`은 폰트 로드 전까지 텍스트를 invisible로 두고, 로드 완료 후 fallback 없이 곧장 Arimo로 렌더한다. FOUT 자체가 사용자에게 보이지 않는다.

### 3. preload

`apps/storybook/.storybook/preview-head.html` (신규 파일):

```html
<link
    rel="preload"
    href="./fonts/Arimo-VariableFont_wght.woff2"
    as="font"
    type="font/woff2"
    crossorigin="anonymous"
/>
```

Storybook은 `.storybook/preview-head.html`을 iframe HTML `<head>`에 자동 주입한다.

빌드 산출물의 경로 매핑이 어긋날 가능성이 있다 — Vite는 `.storybook/` 내 import된 자산을 `assets/`로 hash 처리하지만 `preview-head.html`은 raw HTML이라 hash가 적용되지 않는다. 적용 시 build 후 경로를 확인하고, 안 되면 폰트를 `apps/storybook/public/fonts/`로 이동해 절대경로 `/fonts/Arimo-VariableFont_wght.woff2`로 통일한다.

### 4. snapshotPathTemplate

`packages/core/playwright.config.ts`:

```ts
snapshotPathTemplate: './__tests__/screenshots/{arg}-{projectName}{ext}',
```

`-{platform}` 토큰을 제거한다. Arimo 통일로 OS별 픽셀 차이가 사라지므로 platform 디스크립터가 무의미하며, 유지할 경우 macOS local 스냅샷(`-darwin-`)이 Linux CI에서 미발견 처리된다.

### 5. CI runner + Playwright 공식 Docker 이미지

#### 5.1 runner OS

`build-storybook` job은 브라우저가 필요 없으므로 일반 `ubuntu-latest`로 둔다.

```yaml
build-storybook:
    runs-on: ubuntu-latest    # was: macos-latest
```

#### 5.2 test job — Playwright 공식 이미지를 container로 사용

`test` job은 GitHub Actions의 `container:` 디렉티브로 Playwright 공식 이미지를 사용한다. 이미지는 packages/core의 `@playwright/test` 버전과 동일한 태그를 고정한다.

```yaml
test:
    runs-on: ubuntu-latest
    container:
        image: mcr.microsoft.com/playwright:v1.59.1-noble
        options: --user 1001
```

이미지가 제공하는 것:

- 모든 브라우저 바이너리 (chromium, firefox, webkit) 사전 설치
- 브라우저별 OS dependency (libnss, libwoff, gstreamer 등) 사전 설치
- Playwright 버전과 1:1 매핑된 브라우저 빌드 → 버전 mismatch 불가능

워크플로에서 제거되는 step:

```yaml
# 삭제
- name: Install Playwright Browsers
  run: pnpm core exec playwright install ${{ matrix.shard.project }}
```

#### 5.3 update-snapshots.yml

동일하게 `build-storybook`은 `ubuntu-latest`로, snapshot 갱신 job은 Playwright 공식 이미지를 container로 사용한다.

#### 5.4 이미지 태그 유지보수

`@playwright/test` 의존성 버전이 바뀌면 워크플로의 이미지 태그도 같은 버전으로 맞춰야 한다 (예: `v1.59.1-noble`). Renovate 등 자동화 업데이트 시 함께 bump되도록 `mcr.microsoft.com/playwright` 이미지 태그를 추적 대상에 추가한다.

#### 5.5 폰트와 무관성

Playwright 공식 이미지는 Ubuntu 24.04 (Noble) 기반이며 Arial은 여전히 설치되어 있지 않다. 그러나 본 설계는 §1–3에서 Arimo를 self-host로 강제하므로 컨테이너 내 시스템 폰트와 무관하게 동일 픽셀이 보장된다.

### 6. 기존 스냅샷 정리

`packages/core/__tests__/screenshots/`의 156장(`.png`)을 전부 삭제한다. 폰트가 바뀌면서 글리프 자체가 달라지므로 rename으로는 비교가 통과하지 않는다.

## 검증 절차

1. PR 브랜치에서 §1–5 변경을 commit.
2. 기존 스냅샷 156장 삭제 commit.
3. PR push.
4. `update-snapshots.yml` 수동 트리거 (workflow_dispatch). ubuntu-latest에서 Arimo 적용된 Storybook 빌드 후 baseline 156장 신규 생성, PR 브랜치에 자동 commit.
5. `test-regressions.yml` 자동 실행 → 4번에서 생성한 baseline과 비교 → 전체 pass 확인.
6. 로컬(macOS) 검증: 동일 PR 브랜치 체크아웃 → `pnpm test:regressions` 실행 → 전체 pass 확인. 이 단계가 두 환경 픽셀 동일성을 입증한다.
7. Storybook 수동 확인: dev 서버 띄워 Arimo 글리프 정상 표시 및 FOUT 미발생 확인.

모든 단계 통과 시 머지.

## 롤백

§1–6 변경을 reverting한다. baseline 156장은 새로 생성된 Arimo 기준이므로 함께 revert해야 macOS local에서 다시 매칭된다. CI runner는 macos-latest 상태로 돌아가며 기존 운영 그대로 유지된다.

## 영향 범위

- 변경 파일: 워크플로 2개(runner OS 변경 + container 적용 + Install Playwright Browsers step 제거), Storybook 설정 2개(global.css, preview-head.html 신규), 폰트 자산 1개, playwright config 1개, 스냅샷 156장 전체 교체
- 영향받지 않음: 패키지 소스 코드(`packages/core/src/**`), 디자인 시스템 토큰, 사용자 facing 폰트 정책

## 리스크 및 완화

| 리스크 | 완화 |
|---|---|
| `preview-head.html`에서 폰트 경로 매핑 실패 | `apps/storybook/public/fonts/`로 이동, 절대경로 `/fonts/...` 사용 |
| Arimo가 Arial 대비 시각적으로 어색하게 보임 | metric-compatible이라 폭/높이는 일치. 글리프 디테일 차이는 VRT 자체에는 무관 (둘 다 동일 폰트로 비교) |
| Linux WebKit이 macOS Safari와 다름 | VRT는 동일 환경 내 비교만 하므로 무관. 영향 없음 |
| Arimo woff2 다운로드 실패 시 fallback `sans-serif`로 렌더 → 픽셀 차이 | `font-display: block`이 폰트 로드 완료까지 텍스트 invisible로 막음. self-host라 다운로드 실패 자체가 거의 없음 |
| Playwright 버전과 Docker 이미지 태그 mismatch | 이미지 태그를 코드의 `@playwright/test` 버전과 동기화하여 명시. Renovate 추적 대상에 이미지 추가 |
| container 모드에서 `actions/checkout` 및 composite install action 동작 호환성 | Playwright 공식 이미지는 git, node, 표준 유닉스 도구가 모두 사전 설치되어 있어 GitHub Actions 표준 액션이 정상 동작. 사전 검증을 1차 PR에서 수행 |
