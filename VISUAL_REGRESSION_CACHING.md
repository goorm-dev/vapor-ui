# Visual Regression 테스트 Turbo 캐싱 최적화 보고서

## 목차
1. [현재 캐싱이 안 되는 이유](#1-현재-캐싱이-안-되는-이유)
2. [컴포넌트 의존성 분석](#2-컴포넌트-의존성-분석)
3. [최적화 전략](#3-최적화-전략)
4. [구현 방안](#4-구현-방안)
5. [예상 성능 개선](#5-예상-성능-개선)
6. [트레이드오프 및 권장 사항](#6-트레이드오프-및-권장-사항)

---

## 1. 현재 캐싱이 안 되는 이유

### 1.1 turbo.json 설정 문제

현재 `test:regressions` 태스크 설정:
```json
"test:regressions": { "dependsOn": ["storybook#build:storybook"] }
```

| 문제 | 설명 |
|------|------|
| `outputs` 미정의 | Turbo는 outputs가 없으면 캐싱하지 않음 |
| `inputs` 미정의 | 어떤 파일 변경이 캐시 무효화를 일으키는지 불명확 |
| Remote Cache 미설정 | turbo.json에 remoteCache 설정 없음 |

### 1.2 GitHub Actions 환경변수 누락

| 워크플로우 | TURBO_TOKEN | TURBO_TEAM | Remote Cache |
|-----------|-------------|------------|--------------|
| quality.yml | O | O | 가능 |
| **test-regressions.yml** | X | X | **불가능** |
| release.yml | X | X | 불가능 |

### 1.3 파이프라인 구조 문제

현재 각 브라우저 job에서 Storybook을 **중복 빌드**:
```
test(firefox) → build:storybook → test
test(safari)  → build:storybook → test
test(chrome)  → build:storybook → test
test(edge)    → build:storybook → test
```

동일한 Storybook 빌드를 4번 반복 실행하는 비효율적 구조.

---

## 2. 컴포넌트 의존성 분석

### 2.1 컴포넌트 구조 (38개)

```
packages/core/src/components/
├── avatar, badge, box, breadcrumb, button, callout, card
├── checkbox, collapsible, dialog, field, flex, floating-bar
├── form, grid, h-stack, icon-button, input-group, menu
├── multi-select, navigation-menu, pagination, popover
├── radio, radio-card, radio-group, select, sheet, switch
├── table, tabs, text, text-input, textarea, toast, tooltip, v-stack
```

### 2.2 컴포넌트 간 의존성 그래프

#### 직접 의존성 (import)

```
Toast ─────────┬─→ Box
               ├─→ Button
               ├─→ HStack
               ├─→ VStack
               └─→ IconButton

IconButton ────→ Button

MultiSelect ───→ Badge

Grid ──────────→ Box
Flex ──────────→ Box

HStack ────────→ Flex
VStack ────────→ Flex

Sheet ─────────→ Dialog (스타일 참조)
```

#### Context 의존성

```
RadioGroup ────┬─→ Radio (Context Consumer)
               └─→ RadioCard (Context Consumer)

InputGroup ────┬─→ TextInput (Context Consumer)
               └─→ Textarea (Context Consumer)
```

### 2.3 공유 인프라 (변경 시 전체 테스트 필요)

```
styles/
├── themes.css.ts      ← 모든 컴포넌트가 vars 사용
├── sprinkles.css.ts   ← resolveStyles에서 사용
├── layers.css.ts
├── variables.css.ts
└── mixins/            ← typography, interactions 등

utils/
├── resolve-styles.ts  ← 거의 모든 컴포넌트에서 사용
├── create-split-props.ts
├── data-attributes.ts
└── merge-props.ts

libs/
└── create-context.ts  ← 16개 컴포넌트에서 사용
```

### 2.4 영향도 매트릭스

| 변경 영역 | 영향받는 컴포넌트 | 테스트 범위 |
|----------|-----------------|------------|
| `styles/themes.css.ts` | 전체 38개 | 전체 테스트 |
| `utils/resolve-styles.ts` | 전체 38개 | 전체 테스트 |
| `button/` | button, icon-button, toast | 3개 테스트 |
| `box/` | box, flex, grid, toast, sheet, collapsible | 6개 테스트 |
| `badge/` | badge, multi-select, floating-bar | 3개 테스트 |
| `dialog/` | dialog, sheet | 2개 테스트 |
| `radio-group/` | radio-group, radio, radio-card | 3개 테스트 |

---

## 3. 최적화 전략

### 3.1 캐싱 가능한 것 vs 불가능한 것

| 항목 | 캐싱 | 이유 |
|------|:----:|------|
| **Storybook 빌드** | O | 가장 큰 시간 절약 (2-3분) |
| **pnpm 의존성** | O | 이미 적용됨 (GitHub Actions cache) |
| **Playwright 브라우저** | O | 브라우저 다운로드 생략 가능 |
| **스냅샷 테스트 결과** | X | 환경에 민감, 부정확한 결과 위험 |

### 3.2 스냅샷 테스트를 캐싱하지 않는 이유

1. **환경 의존성**: OS, 브라우저 버전, 폰트 렌더링에 따라 미세한 차이 발생
2. **거짓 양성 위험**: 캐시된 "통과" 결과가 실제 UI 변경을 놓칠 수 있음
3. **더 나은 대안**: 선택적 테스트로 실행 시간 단축이 더 효과적

### 3.3 권장 파이프라인 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                    Visual Regression Pipeline                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [1] detect-changes (30초)                                      │
│       │                                                          │
│       ├─ git diff 분석                                          │
│       ├─ 영향받는 컴포넌트 목록 출력                             │
│       └─ 공유 파일 변경 시 "ALL" 반환                           │
│                    │                                             │
│                    ▼                                             │
│  [2] build-storybook (캐시 HIT: 10초, MISS: 2-3분)             │
│       │                                                          │
│       ├─ Turbo Remote Cache 활용                                │
│       └─ Artifact로 storybook-static 업로드                     │
│                    │                                             │
│       ┌────────────┼────────────┐                               │
│       ▼            ▼            ▼            ▼                   │
│  [3] test       test        test        test                    │
│    (firefox)  (safari)    (chrome)     (edge)                   │
│       │                                                          │
│       ├─ Artifact에서 storybook-static 다운로드                 │
│       └─ COMPONENT 환경변수로 선택적 테스트                     │
│                    │                                             │
│                    ▼                                             │
│  [4] merge-reports                                              │
│       └─ 결과 병합 및 S3 업로드                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. 구현 방안

### 4.1 turbo.json 수정

```json
{
    "tasks": {
        "build:storybook": {
            "dependsOn": ["@vapor-ui/core#build", "@vapor-ui/icons#build"],
            "inputs": [
                "packages/core/src/**/*.tsx",
                "packages/core/src/**/*.ts",
                "packages/core/src/**/*.css.ts",
                "apps/storybook/**/*.tsx",
                "apps/storybook/.storybook/**"
            ],
            "outputs": ["apps/storybook/storybook-static/**"]
        },
        "test:regressions": {
            "dependsOn": ["storybook#build:storybook"],
            "cache": false
        }
    }
}
```

### 4.2 test-regressions.yml 수정

#### 환경변수 추가
```yaml
env:
    BUCKET_NAME: ${{ secrets.BUCKET_NAME }}
    AWS_REGION: ${{ secrets.AWS_REGION }}
    # ... 기존 환경변수 ...

    # Turbo Remote Caching 추가
    TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
    TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

#### detect-changes job 추가
```yaml
detect-changes:
    runs-on: ubuntu-latest
    outputs:
        affected_components: ${{ steps.detect.outputs.components }}
        should_run_all: ${{ steps.detect.outputs.run_all }}
        skip_tests: ${{ steps.detect.outputs.skip }}
    steps:
        - uses: actions/checkout@v4
          with:
              fetch-depth: 0

        - name: Detect affected components
          id: detect
          run: |
              chmod +x ./scripts/detect-affected-components.sh
              RESULT=$(./scripts/detect-affected-components.sh)
              echo "components=$RESULT" >> $GITHUB_OUTPUT

              if echo "$RESULT" | grep -q "ALL"; then
                  echo "run_all=true" >> $GITHUB_OUTPUT
              else
                  echo "run_all=false" >> $GITHUB_OUTPUT
              fi

              if [ -z "$RESULT" ] || [ "$RESULT" = "NONE" ]; then
                  echo "skip=true" >> $GITHUB_OUTPUT
              else
                  echo "skip=false" >> $GITHUB_OUTPUT
              fi
```

#### build-storybook job 분리
```yaml
build-storybook:
    needs: detect-changes
    if: needs.detect-changes.outputs.skip_tests != 'true'
    runs-on: ubuntu-latest
    steps:
        - uses: actions/checkout@v4

        - name: Install Dependencies
          uses: ./.github/composite/install

        - name: Build Storybook (with Turbo cache)
          run: pnpm turbo build:storybook

        - name: Upload storybook-static
          uses: actions/upload-artifact@v4
          with:
              name: storybook-static
              path: apps/storybook/storybook-static
              retention-days: 1
```

#### test job 수정
```yaml
test:
    needs: [detect-changes, build-storybook]
    if: needs.detect-changes.outputs.skip_tests != 'true'
    runs-on: macos-latest
    strategy:
        fail-fast: false
        matrix:
            shard: [...]
    steps:
        - uses: actions/checkout@v4

        - name: Download storybook-static
          uses: actions/download-artifact@v4
          with:
              name: storybook-static
              path: apps/storybook/storybook-static

        - name: Run Playwright tests (selective)
          env:
              COMPONENT: ${{ needs.detect-changes.outputs.should_run_all == 'true' && '' || needs.detect-changes.outputs.affected_components }}
          run: |
              if [ -n "$COMPONENT" ]; then
                  echo "Running tests for: $COMPONENT"
              else
                  echo "Running all tests"
              fi
              pnpm test:regressions -- --project="${{ matrix.shard.name }}"
```

### 4.3 변경 감지 스크립트

**scripts/detect-affected-components.sh**
```bash
#!/bin/bash

BASE_BRANCH="${1:-origin/main}"
CHANGED_FILES=$(git diff --name-only "$BASE_BRANCH"...HEAD)

# 공유 파일 변경 확인 (모든 컴포넌트에 영향)
SHARED_PATTERNS=(
    "packages/core/src/styles/"
    "packages/core/src/utils/"
    "packages/core/src/libs/"
    "packages/core/src/index.ts"
    "packages/icons/"
    "packages/hooks/"
)

for pattern in "${SHARED_PATTERNS[@]}"; do
    if echo "$CHANGED_FILES" | grep -q "$pattern"; then
        echo "ALL"
        exit 0
    fi
done

# 컴포넌트별 변경 감지
# ... (의존성 그래프 기반 로직)

# 결과 출력: 콤마로 구분된 컴포넌트 이름
echo "$AFFECTED_COMPONENTS"
```

### 4.4 의존성 그래프 정의

**scripts/dependency-graph.json**
```json
{
    "sharedFiles": {
        "patterns": [
            "packages/core/src/styles/**",
            "packages/core/src/utils/**",
            "packages/core/src/libs/**",
            "packages/icons/**",
            "packages/hooks/**"
        ],
        "affectsAll": true
    },
    "components": {
        "box": {
            "dependents": ["flex", "grid", "toast", "sheet", "collapsible", "floating-bar"]
        },
        "flex": {
            "depends": ["box"],
            "dependents": ["h-stack", "v-stack"]
        },
        "button": {
            "dependents": ["icon-button", "toast"]
        },
        "icon-button": {
            "depends": ["button"],
            "dependents": ["toast", "collapsible"]
        },
        "badge": {
            "dependents": ["multi-select", "floating-bar"]
        },
        "dialog": {
            "dependents": ["sheet"]
        },
        "radio-group": {
            "dependents": ["radio", "radio-card"]
        },
        "input-group": {
            "dependents": ["text-input", "textarea"]
        }
    }
}
```

---

## 5. 예상 성능 개선

### 5.1 현재 상태 vs 최적화 후

| 시나리오 | 현재 | 최적화 후 | 개선율 |
|----------|------|-----------|--------|
| 단일 컴포넌트 변경 | ~10분 | ~3분 | **70%** |
| 공유 스타일 변경 | ~10분 | ~8분 | 20% |
| 변경 없음 (docs만) | ~10분 | ~1분 (skip) | **90%** |

### 5.2 단계별 시간 분석

#### 현재 (모든 테스트 실행)
| 단계 | 시간 |
|------|------|
| Checkout + Install | 1분 |
| Build Icons | 30초 |
| Build Storybook (x4) | 8-12분 |
| Playwright Install | 1분 |
| Test (38 컴포넌트 x 4 브라우저) | 5-10분 |
| **총 시간** | **~15-25분** |

#### 최적화 후 (단일 컴포넌트 변경)
| 단계 | 시간 |
|------|------|
| detect-changes | 30초 |
| build-storybook (캐시 HIT) | 10초 |
| Download artifact | 20초 |
| Playwright Install | 1분 |
| Test (1-3 컴포넌트 x 4 브라우저) | 1-2분 |
| **총 시간** | **~3-4분** |

---

## 6. 트레이드오프 및 권장 사항

### 6.1 정확성 vs 속도

| 접근 방식 | 장점 | 단점 |
|----------|------|------|
| **보수적** (의심되면 전체 테스트) | 누락 없음 | 시간 절약 적음 |
| **공격적** (정확히 영향받는 것만) | 시간 대폭 절약 | 의존성 누락 위험 |

**권장: 보수적 접근 + 점진적 개선**
- 공유 파일 변경 시 항상 전체 테스트
- 의존성 그래프는 실제 import 기반으로 정확히 관리
- 누락 발견 시 의존성 그래프 업데이트

### 6.2 캐시 무효화 전략

| 전략 | 설명 |
|------|------|
| 파일 해시 기반 | Turbo 기본 동작, 파일 내용 변경 시 무효화 |
| 수동 무효화 | workflow_dispatch로 강제 전체 실행 |

### 6.3 구현 단계 로드맵

| 단계 | 내용 | 우선순위 |
|------|------|---------|
| Phase 1 | Turbo 환경변수 추가, build-storybook job 분리 | 높음 |
| Phase 2 | 변경 감지 스크립트 작성, detect-changes job 추가 | 높음 |
| Phase 3 | 의존성 그래프 정의 및 영향 분석 로직 구현 | 중간 |
| Phase 4 | 모니터링 및 최적화 | 낮음 |

---

## 7. 수정 대상 파일 요약

| 파일 | 수정 내용 |
|------|-----------|
| `turbo.json` | build:storybook inputs/outputs 추가 |
| `.github/workflows/test-regressions.yml` | TURBO 환경변수, job 분리 |
| `scripts/detect-affected-components.sh` | 새로 작성 |
| `scripts/dependency-graph.json` | 새로 작성 |

---

## 8. 검증 방법

1. **Turbo 캐시 확인**
   ```bash
   pnpm turbo build:storybook --dry-run
   ```
   - GitHub Actions 로그에서 "FULL TURBO" 메시지 확인

2. **선택적 테스트 확인**
   - 단일 컴포넌트 변경 PR 생성
   - detect-changes job 출력에서 해당 컴포넌트만 나오는지 확인
   - test job에서 해당 컴포넌트만 테스트되는지 확인

3. **의존성 그래프 검증**
   - Button 변경 시 IconButton, Toast도 테스트되는지 확인
   - 공유 스타일 변경 시 전체 테스트되는지 확인
