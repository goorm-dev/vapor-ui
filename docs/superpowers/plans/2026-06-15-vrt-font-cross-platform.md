# VRT Cross-Platform Font Unification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Linux CI runner와 macOS local 사이의 폰트 차이로 깨지는 Playwright VRT를 해소하기 위해, Storybook 테스트 베드에서 Arimo woff2를 self-host로 강제하고 GitHub Actions 워크플로를 Playwright 공식 Docker 이미지 기반 Ubuntu runner로 복귀시킨다.

**Architecture:** `apps/storybook/.storybook/global.css`에서 OS 시스템 폰트(`Arial`) 의존을 제거하고 `@font-face`로 Arimo variable woff2를 self-host한다. `<link rel="preload">`로 FOUT을 사용자 시각에서 차단하고, Playwright VRT는 기존 `document.fonts.ready` await로 폰트 로드 완료 후 캡처를 보장한다. Playwright 공식 이미지를 `container:`로 적용해 브라우저 버전과 OS 의존성을 고정한다. `snapshotPathTemplate`에서 `{platform}` 토큰을 제거해 단일 baseline을 두 환경에서 공유한다.

**Tech Stack:** Storybook 8 (Vite builder), Playwright 1.59.1, GitHub Actions, pnpm workspaces, Arimo (Apache 2.0 Google Fonts).

**Spec:** [docs/superpowers/specs/2026-06-15-vrt-font-cross-platform-design.md](../specs/2026-06-15-vrt-font-cross-platform-design.md)

---

## Reference: 변경 대상 파일

| 경로 | 동작 |
|---|---|
| `apps/storybook/.storybook/fonts/Arimo-VariableFont_wght.woff2` | 신규 (바이너리, repo commit) |
| `apps/storybook/.storybook/global.css` | 수정 (`@font-face` 추가, `font-family` 교체) |
| `apps/storybook/.storybook/preview-head.html` | 신규 (`<link rel="preload">`) |
| `packages/core/playwright.config.ts` | 수정 (`snapshotPathTemplate`에서 `{platform}` 제거) |
| `.github/workflows/test-regressions.yml` | 수정 (`ubuntu-latest` + `container:` + browser install step 제거) |
| `.github/workflows/update-snapshots.yml` | 수정 (위와 동일 패턴) |
| `packages/core/__tests__/screenshots/*.png` | 전체 삭제 (이후 update-snapshots 워크플로로 신규 baseline 생성) |

---

## Task 1: Arimo variable woff2 자산 추가

**Files:**
- Create: `apps/storybook/.storybook/fonts/Arimo-VariableFont_wght.woff2`

- [ ] **Step 1: 폰트 디렉토리 생성**

```bash
mkdir -p apps/storybook/.storybook/fonts
```

- [ ] **Step 2: JSDelivr CDN(fontsource 미러)에서 Arimo variable woff2 다운로드**

`@fontsource-variable/arimo` 패키지의 latin-wght-normal 빌드를 받는다. CDN URL은 fontsource 패키지 버전에 1:1로 매핑되어 결정적이다.

```bash
curl -L \
  -o apps/storybook/.storybook/fonts/Arimo-VariableFont_wght.woff2 \
  https://cdn.jsdelivr.net/npm/@fontsource-variable/arimo@5/files/arimo-latin-wght-normal.woff2
```

- [ ] **Step 3: 파일 유효성 검증**

woff2 매직 헤더(`wOF2`)가 첫 4바이트인지, 크기가 30–80KB 사이인지 확인한다.

```bash
ls -la apps/storybook/.storybook/fonts/Arimo-VariableFont_wght.woff2
xxd apps/storybook/.storybook/fonts/Arimo-VariableFont_wght.woff2 | head -1
```

Expected: 파일 크기 약 40–60KB. 첫 줄에 `wOF2`(ASCII) 또는 `77 4f 46 32` 헥스가 보여야 한다. 0KB이거나 HTML 응답이면 다운로드 실패.

- [ ] **Step 4: Commit**

```bash
git add apps/storybook/.storybook/fonts/Arimo-VariableFont_wght.woff2
git commit -m "chore(storybook): add Arimo variable woff2 for VRT cross-platform font unification"
```

---

## Task 2: global.css에 @font-face 추가 및 font-family 교체

**Files:**
- Modify: `apps/storybook/.storybook/global.css`

- [ ] **Step 1: 현재 global.css 내용 확인**

기존 파일은 다음과 같다:

```css
* {
    font-family: Arial;
}
```

- [ ] **Step 2: 파일 전체를 다음 내용으로 교체**

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

`font-display: block`은 폰트 로드 전까지 텍스트를 invisible 상태로 두고 swap 단계를 생략한다. 사용자에게 FOUT/FOUC가 노출되지 않으며 Playwright의 `document.fonts.ready` await도 정상 작동한다.

- [ ] **Step 3: Commit**

```bash
git add apps/storybook/.storybook/global.css
git commit -m "feat(storybook): replace Arial with self-hosted Arimo for VRT determinism"
```

---

## Task 3: preview-head.html에 preload 태그 추가

**Files:**
- Create: `apps/storybook/.storybook/preview-head.html`

- [ ] **Step 1: 파일 생성**

`apps/storybook/.storybook/preview-head.html`:

```html
<link
    rel="preload"
    href="./fonts/Arimo-VariableFont_wght.woff2"
    as="font"
    type="font/woff2"
    crossorigin="anonymous"
/>
```

Storybook은 `.storybook/preview-head.html`을 iframe `<head>`에 자동 주입한다. preload 덕분에 HTML 파싱 단계에서 폰트 다운로드가 시작되어 invisible 구간이 1프레임 수준으로 줄어든다.

- [ ] **Step 2: Commit**

```bash
git add apps/storybook/.storybook/preview-head.html
git commit -m "feat(storybook): preload Arimo woff2 in iframe head"
```

---

## Task 4: Local에서 Storybook 폰트 로딩 시각 검증

이 태스크는 코드 변경 없이 폰트 로딩이 의도대로 동작하는지 확인한다. CI에서 자동 검증되지 않는 항목(FOUT 시각 확인, 폰트 경로 매핑 성공 여부)을 사람이 한 번 본다.

- [ ] **Step 1: Storybook dev 서버 기동**

```bash
pnpm -F @vapor-ui/storybook dev
```

Expected: `http://localhost:6006` 부근에서 Storybook이 뜬다.

- [ ] **Step 2: 임의 컴포넌트 스토리 열고 DevTools Network에서 woff2 확인**

브라우저로 컴포넌트 하나 열고 DevTools → Network → "Font" 필터.

Expected:
- `Arimo-VariableFont_wght.woff2` 요청이 200 OK로 1회 fetch
- `Initiator`가 preload여야 함 (`@font-face`로 표시되면 preload가 경로 매핑 실패 — 경로 보정 필요)

- [ ] **Step 3: Computed font-family 확인**

DevTools → Elements → 본문 텍스트 노드 → Computed → "Rendered Fonts" 섹션.

Expected: `Arimo`가 100% 사용 중. `Arial`이나 시스템 fallback이 보이면 글로벌 CSS 적용 실패.

- [ ] **Step 4: 새로고침으로 FOUT 미발생 시각 확인**

`Cmd+Shift+R`로 하드 리로드. 텍스트가 fallback 폰트로 잠깐 뜨다 Arimo로 바뀌지 않아야 한다.

Expected: 매우 짧게 invisible → 곧장 Arimo. FOUT 없음.

- [ ] **Step 5: 경로 매핑 실패 시 대응 (조건부)**

Step 2에서 woff2가 404이거나 preload Initiator가 잘못 잡히면 폰트를 `apps/storybook/public/fonts/`로 이동하고 절대 경로로 전환한다.

```bash
mkdir -p apps/storybook/public/fonts
git mv apps/storybook/.storybook/fonts/Arimo-VariableFont_wght.woff2 \
       apps/storybook/public/fonts/Arimo-VariableFont_wght.woff2
```

그리고 `global.css`와 `preview-head.html`의 `./fonts/...`를 `/fonts/...`로 일괄 변경 후 Step 1부터 재실행.

상대 경로(`./fonts/...`)가 정상이면 이 Step은 스킵한다.

- [ ] **Step 6: 검증 결과를 commit message에 남기지 않고 다음 태스크로 진행**

이 태스크는 검증 전용이라 commit 없음. Step 5가 발동했을 때만 별도 commit:

```bash
git add apps/storybook/.storybook/global.css apps/storybook/.storybook/preview-head.html apps/storybook/public/fonts/
git commit -m "fix(storybook): move Arimo woff2 to public/ for absolute path resolution"
```

---

## Task 5: playwright.config.ts에서 `{platform}` 토큰 제거

**Files:**
- Modify: `packages/core/playwright.config.ts:5`

- [ ] **Step 1: 현재 라인 확인**

`packages/core/playwright.config.ts:5`:

```ts
snapshotPathTemplate: './__tests__/screenshots/{arg}-{projectName}-{platform}-{ext}',
```

- [ ] **Step 2: `{platform}-` 토큰을 제거하도록 수정**

```ts
snapshotPathTemplate: './__tests__/screenshots/{arg}-{projectName}{ext}',
```

`{ext}`는 `.png`로 확장되므로 직전에 `-`를 두지 않아도 자연스럽다.

- [ ] **Step 3: Commit**

```bash
git add packages/core/playwright.config.ts
git commit -m "test(vrt): drop {platform} from snapshotPathTemplate"
```

---

## Task 6: 기존 스냅샷 156장 삭제

**Files:**
- Delete: `packages/core/__tests__/screenshots/*.png`

Arimo로 폰트가 바뀌면서 글리프 픽셀이 달라진다. rename으로는 비교가 통과하지 않으므로 전부 삭제하고 Task 8에서 신규 baseline을 생성한다.

- [ ] **Step 1: 현재 파일 개수 확인**

```bash
ls packages/core/__tests__/screenshots/ | wc -l
```

Expected: 156

- [ ] **Step 2: 전체 삭제**

```bash
rm packages/core/__tests__/screenshots/*.png
```

- [ ] **Step 3: 디렉토리 비었는지 확인**

```bash
ls packages/core/__tests__/screenshots/
```

Expected: 출력 없음 (빈 디렉토리)

- [ ] **Step 4: Commit**

```bash
git add packages/core/__tests__/screenshots/
git commit -m "test(vrt): drop all darwin-suffixed snapshots before Arimo baseline regen"
```

---

## Task 7: test-regressions.yml을 Ubuntu + Playwright container로 변경

**Files:**
- Modify: `.github/workflows/test-regressions.yml`

- [ ] **Step 1: `build-storybook` job의 runner 변경**

`.github/workflows/test-regressions.yml`의 해당 job:

```yaml
jobs:
    build-storybook:
        runs-on: ubuntu-latest    # was: macos-latest
        steps:
            ...
```

- [ ] **Step 2: `test` job의 runner + container 적용 + browser install step 제거**

`test` job 전체를 다음으로 교체. matrix와 기존 step은 유지하되 `runs-on`, `container`를 갱신하고 `Install Playwright Browsers` step만 제거한다.

```yaml
    test:
        runs-on: ubuntu-latest
        container:
            image: mcr.microsoft.com/playwright:v1.59.1-noble
            options: --user 1001
        needs: [build-storybook]
        strategy:
            fail-fast: false
            matrix:
                shard:
                    [
                        { name: firefox, project: firefox },
                        { name: safari, project: webkit },
                        { name: chrome, project: chromium },
                        { name: edge, project: chromium },
                    ]

        steps:
            - name: Git clone the repository
              uses: actions/checkout@v4
              with:
                  fetch-depth: 0

            - name: Install Dependencies
              uses: ./.github/composite/install

            - name: Run Playwright tests
              run: pnpm test:regressions -- --project="${{ matrix.shard.name }}"

            - name: Upload blob report to GitHub Actions Artifacts
              if: ${{ !cancelled() }}
              uses: actions/upload-artifact@v4
              with:
                  name: blob-report-${{ matrix.shard.name }}
                  path: packages/core/blob-report
                  retention-days: 1
```

핵심 변경:
- `runs-on: macos-latest` → `runs-on: ubuntu-latest`
- `container:` 블록 추가 (Playwright 1.59.1 + Noble Ubuntu 24.04 base)
- `Install Playwright Browsers` step 삭제 (이미지에 사전 설치되어 있음)

- [ ] **Step 3: `merge-reports` job 확인 (변경 없음)**

`merge-reports` job은 기존대로 `ubuntu-latest`에서 동작한다. container 미사용. 변경 없음.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/test-regressions.yml
git commit -m "ci(vrt): run tests on Playwright official container, drop macos-latest"
```

---

## Task 8: update-snapshots.yml에 동일 패턴 적용

**Files:**
- Modify: `.github/workflows/update-snapshots.yml`

이 워크플로는 baseline 스냅샷을 갱신하고 PR 브랜치에 commit하는 역할이다. 동일하게 ubuntu + container로 변경한다.

- [ ] **Step 1: runner 변경**

`runs-on: macos-latest` → `runs-on: ubuntu-latest`

- [ ] **Step 2: snapshot 갱신 job에 `container:` 블록 추가**

해당 job에 다음 블록을 추가한다 (`runs-on` 바로 아래):

```yaml
        container:
            image: mcr.microsoft.com/playwright:v1.59.1-noble
            options: --user 1001
```

- [ ] **Step 3: 기존 `Install Playwright Browsers` step 제거**

해당 step 라인을 삭제한다.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/update-snapshots.yml
git commit -m "ci(vrt): mirror container/runner changes for update-snapshots workflow"
```

---

## Task 9: PR 푸시 + update-snapshots 워크플로 수동 트리거로 baseline 생성

이 태스크는 코드 변경 없이 GitHub Actions UI에서 실행한다.

- [ ] **Step 1: 현재 브랜치를 origin에 푸시**

```bash
git push -u origin <current-branch>
```

- [ ] **Step 2: PR 생성 (아직 안 만들었다면)**

```bash
gh pr create --title "ci(vrt): unify cross-platform fonts with self-hosted Arimo" \
             --body "Spec: docs/superpowers/specs/2026-06-15-vrt-font-cross-platform-design.md"
```

- [ ] **Step 3: update-snapshots 워크플로 수동 트리거**

GitHub Actions UI에서 `Update Visual Snapshots` 워크플로를 선택하고 현재 PR 브랜치를 대상으로 "Run workflow" 클릭. CLI로도 가능:

```bash
gh workflow run update-snapshots.yml --ref <current-branch>
```

- [ ] **Step 4: 워크플로 실행 완료 대기 및 결과 확인**

```bash
gh run watch
```

Expected: 워크플로가 성공으로 끝나고, `packages/core/__tests__/screenshots/`에 156장의 신규 baseline이 자동 commit되어 PR 브랜치에 push된다.

- [ ] **Step 5: 신규 baseline 파일명 확인**

PR 브랜치를 로컬에 pull한 뒤:

```bash
git pull
ls packages/core/__tests__/screenshots/ | head -10
ls packages/core/__tests__/screenshots/ | wc -l
```

Expected:
- 파일명에 `-darwin-` / `-linux-` suffix가 **없다** (`button--test-bed-1-chrome.png` 형태)
- 파일 개수 156

---

## Task 10: PR에서 test-regressions 워크플로 통과 확인

- [ ] **Step 1: PR 푸시 후 자동 트리거되는 test-regressions 워크플로 상태 확인**

```bash
gh pr checks
```

Expected: `Visual Regression` 워크플로의 모든 matrix shard(firefox/safari/chrome/edge)가 success.

- [ ] **Step 2: 실패 시 진단**

- diff가 발생한 경우: Playwright HTML 리포트(워크플로의 `html-report--attempt-*` 아티팩트 또는 S3 URL)에서 expected vs actual 비교. 폰트 외 원인(레이아웃, 색상)이면 별도 이슈로 분리하여 처리한다.
- 워크플로 자체가 실패한 경우: container 옵션, composite install action 호환성, pnpm cache 경로 등을 점검한다.

---

## Task 11: 로컬 macOS에서 새 baseline으로 통과하는지 검증

이 태스크는 두 환경 픽셀 동일성을 입증한다. **이 검증이 통과해야 본 설계가 성립한다.**

- [ ] **Step 1: Task 9 이후 갱신된 PR 브랜치를 로컬에 pull**

```bash
git pull
```

- [ ] **Step 2: 의존성 설치 + Storybook 빌드**

```bash
pnpm install
pnpm build:storybook
```

- [ ] **Step 3: 로컬에서 VRT 실행**

```bash
pnpm test:regressions
```

Expected: 156 tests 전부 pass. 1장이라도 실패하면 macOS와 Linux 사이에 여전히 폰트 외의 차이가 남아 있다는 뜻이므로 진단 필요.

- [ ] **Step 4: 통과 결과 PR에 코멘트로 기록**

```bash
gh pr comment --body "Local macOS VRT pass against Linux-generated baseline. Cross-platform parity confirmed."
```

---

## Task 12: 머지

모든 검증 통과 후 PR을 머지한다. 머지 전 마지막 점검:

- [ ] **Step 1: PR 상태 최종 확인**

```bash
gh pr view --json mergeable,statusCheckRollup
```

Expected: `mergeable: MERGEABLE`, 모든 status check success.

- [ ] **Step 2: Merge**

리뷰어 승인이 모인 뒤 squash 또는 일반 머지로 진행. 본 저장소의 머지 정책을 따른다.

```bash
gh pr merge --squash
```

---

## Rollback Plan

머지 후 문제가 발견되면:

1. `git revert <merge-commit>`으로 모든 변경을 한 번에 되돌린다.
2. 자동으로 `runs-on: macos-latest`와 기존 156장 darwin-suffix baseline이 복구된다.
3. revert가 Storybook 폰트 파일 삭제와 베이스라인 복구를 모두 포함하므로 추가 정리는 없다.

부분 롤백(예: Arimo는 유지하되 container만 제거)이 필요하면 워크플로 파일만 따로 revert한다. 단 이 경우 Linux runner는 그대로라 폰트 일관성은 유지된다.
