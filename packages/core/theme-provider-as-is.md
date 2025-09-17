# Vapor UI Theme Provider 시스템 분석

## 개요

Vapor UI의 Theme Provider는 React 애플리케이션에서 동적 테마 시스템을 제공하는 핵심 컴포넌트입니다. 라이트/다크 모드, 커스텀 컬러, 반경값, 스케일링 등을 실시간으로 변경할 수 있으며, localStorage를 통한 지속성과 FOUC(Flash of Unstyled Content) 방지 기능을 제공합니다.

## 핵심 구성 요소

### 1. ThemeProvider (`theme-provider.tsx`)

메인 테마 프로바이더 컴포넌트로, React Context를 통해 테마 상태를 관리합니다.

#### 주요 기능

- **테마 상태 관리**: appearance, radius, scaling, primaryColor
- **localStorage 지속성**: 브라우저 재시작 후에도 테마 설정 유지
- **크로스 탭 동기화**: 여러 탭 간 테마 설정 실시간 동기화
- **DOM 직접 조작**: CSS 변수와 클래스를 통한 스타일 적용

#### 의존성 관계

- `createThemeConfig`: 사용자 설정을 기본값과 병합하여 완전한 테마 설정 객체 생성
- `THEME_CONFIG & themeInjectScript`: theme-injector에서 제공하는 설정 상수와 FOUC 방지 스크립트

#### 사용법

```tsx
import { ThemeProvider } from '@vapor-ui/core';

<ThemeProvider
    config={{
        appearance: 'dark',
        storageKey: 'my-app-theme',
        primaryColor: '#2A6FF3',
    }}
>
    <App />
</ThemeProvider>;
```

### 2. ThemeScript (`theme-provider.tsx`)

FOUC 방지를 위한 인라인 스크립트 컴포넌트입니다.

#### 특징

- **SSR/SSG 호환**: 서버 사이드 렌더링 환경에서 hydration 불일치 방지
- **즉시 실행**: HTML 파싱과 동시에 테마 적용
- **외부 의존성 없음**: 완전히 자체 포함된 스크립트
- **동일한 로직 공유**: ThemeProvider와 동일한 색상 계산 및 DOM 조작 로직 사용

#### 핵심 동작 방식

ThemeScript는 `themeInjectScript` 함수를 문자열로 변환하여 인라인 스크립트로 삽입합니다:

```tsx
const scriptContent = `(${themeInjectScript.toString()})(
  ${JSON.stringify(defaultTheme)},
  '${storageKey}',
  ${JSON.stringify(THEME_CONFIG)},
  ${JSON.stringify(cssVarNames)}
)`;
```

#### 사용법

```tsx
import { ThemeScript } from '@vapor-ui/core';

// HTML head에 배치
<head>
    <ThemeScript config={{ appearance: 'dark' }} />
</head>;
```

### 3. createThemeConfig (`create-theme-config.ts`)

사용자가 제공한 부분 설정을 기본값과 병합하여 완전한 테마 설정 객체를 생성하는 유틸리티입니다.

#### 핵심 기능

- **기본값 제공**: 모든 테마 속성에 대한 기본값 설정
- **설정 병합**: 사용자 설정과 기본값을 안전하게 병합
- **타입 안전성**: 완전한 TypeScript 타입 지원

#### 기본 설정값

```typescript
const DEFAULT_THEME: ThemeState = {
    appearance: 'light',
    radius: 'md',
    scaling: 1,
};
```

#### 설정 변환 과정

```typescript
const createThemeConfig = (userConfig?: VaporThemeConfig): ResolvedThemeConfig => {
    const {
        storageKey = THEME_CONFIG.STORAGE_KEY, // 'vapor-ui-theme'
        nonce,
        enableSystemTheme = false,
        ...themeProps
    } = userConfig ?? {};

    return {
        ...DEFAULT_THEME, // 기본값
        ...themeProps, // 사용자 설정으로 덮어쓰기
        storageKey,
        nonce,
        enableSystemTheme,
    };
};
```

### 4. theme-injector (`theme-injector.ts`)

FOUC 방지를 위한 핵심 로직과 테마 설정 상수를 제공합니다.

#### 제공하는 구성 요소

##### THEME_CONFIG 상수

```typescript
const THEME_CONFIG = {
    STORAGE_KEY: 'vapor-ui-theme',
    CLASS_NAMES: {
        dark: 'vapor-dark-theme',
        light: 'vapor-light-theme',
    },
    RADIUS_FACTOR_MAP: {
        none: 0,
        sm: 0.5,
        md: 1,
        lg: 1.5,
        xl: 2,
        full: 3,
    },
} as const;
```

##### themeInjectScript 함수

- **자체 완결성**: 외부 의존성 없이 실행 가능한 순수 함수
- **ES5 호환**: 트랜스파일러 없이 브라우저에서 직접 실행
- **안전한 문법**: Object.assign 사용으로 helper 함수 의존성 제거
- **동일 로직**: ThemeProvider의 DOM 조작 로직과 완전히 동일

##### 중복 코드 최소화 전략

ThemeProvider와 themeInjectScript는 동일한 색상 계산 로직을 가지고 있지만, 이는 의도적인 설계입니다:

- **SSR 호환성**: 스크립트는 완전히 자체 완결적이어야 함
- **번들 크기**: 스크립트 내부 함수는 압축되어 HTML에 인라인으로 삽입
- **신뢰성**: 외부 의존성이 없어 실행 실패 위험이 없음

### 5. useTheme Hook

테마 상태 접근 및 업데이트를 위한 훅입니다.

#### 제공 기능

- 현재 테마 상태 조회
- 테마 설정 업데이트
- TypeScript 타입 안전성
- Context 에러 처리

#### 사용법

```tsx
import { useTheme } from '@vapor-ui/core';

function ThemeToggle() {
    const { appearance, setTheme } = useTheme();

    return (
        <button
            onClick={() =>
                setTheme({
                    appearance: appearance === 'light' ? 'dark' : 'light',
                })
            }
        >
            {appearance} 모드
        </button>
    );
}
```

## 테마 시스템 동작 원리

### 1. 초기화 과정

#### 전체 흐름도

```
HTML 로딩 → ThemeScript 실행 → createThemeConfig 처리 → DOM 적용
     ↓
React 앱 시작 → ThemeProvider 마운트 → 상태 동기화 → Context 제공
```

#### 단계별 상세 과정

1. **설정 생성 (createThemeConfig)**

    ```typescript
    // 사용자 설정과 기본값 병합
    const resolvedConfig = createThemeConfig(userConfig);
    // 결과: { appearance: 'light', radius: 'md', scaling: 1, storageKey: 'vapor-ui-theme', ... }
    ```

2. **ThemeScript 실행 (themeInjectScript)**
    - HTML 파싱 단계에서 즉시 실행
    - localStorage에서 저장된 테마 설정 로드
    - THEME_CONFIG 상수를 사용하여 DOM에 클래스와 CSS 변수 적용
    - React 하이드레이션 전에 완료되어 FOUC 방지

3. **ThemeProvider 마운트**
    - React 컴포넌트 초기화
    - localStorage 상태와 내부 상태 동기화
    - useEffect로 DOM 조작 시작

4. **Context 제공**
    - 하위 컴포넌트들에게 테마 상태 및 setTheme 함수 제공
    - useTheme 훅을 통한 안전한 접근

### 2. 테마 적용 메커니즘

#### CSS 변수 기반 시스템

```css
:root {
    --vapor-scale-factor: 1;
    --vapor-radius-factor: 1;
    --vapor-color-background-primary: #ffffff;
    --vapor-color-foreground-primary: #000000;
}
```

#### 클래스 기반 테마 전환

```css
.vapor-light-theme {
    /* 라이트 테마 스타일 */
}
.vapor-dark-theme {
    /* 다크 테마 스타일 */
}
```

### 3. 상태 관리 흐름

```
사용자 입력 → setTheme() → 상태 업데이트 → DOM 적용 → localStorage 저장
                     ↓
            다른 탭 감지 ← storage 이벤트 ← localStorage 변경
```

## 테마 커스터마이제이션 지원

### 1. 지원되는 테마 속성

#### Appearance (외관)

- `'light'`: 라이트 모드
- `'dark'`: 다크 모드

#### Radius (반경)

- `'none'`: 0 (각진 모서리)
- `'sm'`: 0.5 (작은 반경)
- `'md'`: 1.0 (기본 반경)
- `'lg'`: 1.5 (큰 반경)
- `'xl'`: 2.0 (매우 큰 반경)
- `'full'`: 3.0 (완전한 원형)

#### Scaling (스케일링)

- `number`: 1.0이 기본값, 0.8~1.2 권장

#### Primary Color (주요 색상)

- `string`: Hex 형식 색상 코드 (예: `#2A6FF3`)

### 2. 동적 색상 계산 시스템

#### HSL 기반 색상 변환

ThemeProvider는 사용자가 제공한 기본 색상을 HSL 색공간으로 변환하여 다양한 색상 변형을 자동 생성합니다:

```typescript
// 라이트 모드: 명도를 낮춰서 텍스트 색상 생성
const foregroundHsl = { ...baseHsl, l: Math.max(0, baseHsl.l - 0.08) };

// 다크 모드: 명도를 높여서 텍스트 색상 생성
const foregroundDarkerHsl = { ...baseHsl, l: Math.min(1, baseHsl.l + 0.08) };
```

#### 자동 생성되는 색상 변형

- `background-primary`: 배경색
- `border-primary`: 테두리색
- `foreground-primary`: 기본 텍스트색
- `foreground-primary-darker`: 진한 텍스트색
- `foreground-accent`: 대비색 (검정/흰색)
- `background-rgb-primary`: RGB 형식 배경색

### 3. 설정 검증 시스템

입력된 테마 설정의 유효성을 자동으로 검증합니다:

```typescript
// 색상 유효성 검사 (Hex 형식)
if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(primaryColor)) {
    console.warn('유효하지 않은 색상 형식입니다.');
}

// 반경 값 검사
if (!Object.keys(RADIUS_FACTOR_MAP).includes(radius)) {
    console.warn('유효하지 않은 반경 값입니다.');
}
```

## 고급 기능

### 1. FOUC 방지 시스템

#### 문제점

- React 하이드레이션 전까지 기본 테마가 적용되어 깜빡임 발생
- 사용자가 설정한 다크 모드가 라이트 모드로 잠깐 표시됨

#### 해결 방법

- **ThemeScript**: HTML 파싱과 동시에 실행되는 동기 스크립트
- **외부 의존성 제거**: 모든 필요한 함수를 스크립트 내부에 포함
- **안전한 문법 사용**: 트랜스파일 없이 실행 가능한 ES5 호환 코드

### 2. 크로스 탭 동기화

#### Storage 이벤트 활용

```typescript
useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === storageKey && event.newValue) {
            internalSetThemeState(JSON.parse(event.newValue));
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
}, [storageKey]);
```

### 3. CSP (Content Security Policy) 지원

#### Nonce 속성 지원

```tsx
<ThemeScript config={{ nonce: 'random-nonce-value' }} />
```

보안 정책이 엄격한 환경에서도 인라인 스크립트 실행이 가능합니다.

## 시스템 아키텍처 및 의존성

### 파일 구조

```
packages/core/src/
├── components/
│   ├── theme-provider/
│   │   ├── index.ts                    # 외부 API 내보내기
│   │   └── theme-provider.tsx          # 메인 구현체 (ThemeProvider, ThemeScript, useTheme)
│   ├── theme-inject/
│   │   └── theme-injector.ts           # FOUC 방지 스크립트 및 상수
│   └── create-theme-config/
│       ├── index.ts                    # 내보내기
│       └── create-theme-config.ts      # 설정 생성 유틸리티
└── styles/
    ├── global-var.css.ts               # CSS 변수 정의 (scale-factor, radius-factor)
    ├── theme.css.ts                    # Vanilla Extract 테마 토큰
    └── vars.css.ts                     # 테마 계약 정의
```

### 의존성 관계도

```
┌─────────────────────┐
│    ThemeProvider    │
│  (theme-provider)   │
└─────────┬───────────┘
          │
          ├── createThemeConfig ←─┐
          │   (설정 병합)          │
          │                      │
          └── theme-injector ←────┘
              (THEME_CONFIG,      │
               themeInjectScript) │
                                  │
┌─────────────────────┐          │
│    ThemeScript      │          │
│  (theme-provider)   │ ─────────┘
└─────────────────────┘

┌─────────────────────┐
│      useTheme       │
│  (theme-provider)   │
└─────────────────────┘
```

### 컴포넌트 간 데이터 흐름

#### 1. 설정 데이터 흐름

```typescript
사용자 설정 (VaporThemeConfig)
    ↓
createThemeConfig()
    ↓
완전한 설정 (ResolvedThemeConfig)
    ↓
ThemeProvider & ThemeScript
```

#### 2. 런타임 상태 흐름

```typescript
localStorage 저장소
    ↓
ThemeScript (초기 DOM 적용)
    ↓
ThemeProvider (React 상태 동기화)
    ↓
useTheme (상태 접근 & 업데이트)
    ↓
DOM 변경 & localStorage 저장
```

#### 3. 상수 및 설정 공유

- `THEME_CONFIG`: 모든 컴포넌트가 공통으로 사용하는 테마 설정 상수
- `RADIUS_FACTOR_MAP`: 반경 값 매핑 테이블
- `CLASS_NAMES`: CSS 클래스명 정의
- `STORAGE_KEY`: localStorage 기본 키 값

## 실제 사용 예시

### 기본 설정

```tsx
import { ThemeProvider, ThemeScript } from '@vapor-ui/core';

function App() {
    return (
        <>
            <head>
                <ThemeScript />
            </head>
            <ThemeProvider>
                <MyComponents />
            </ThemeProvider>
        </>
    );
}
```

### 커스텀 설정

```tsx
const themeConfig = {
    appearance: 'dark' as const,
    radius: 'lg' as const,
    scaling: 1.1,
    primaryColor: '#2A6FF3',
    storageKey: 'my-app-theme',
};

<ThemeProvider config={themeConfig}>
    <App />
</ThemeProvider>;
```

### 테마 토글 컴포넌트

```tsx
function ThemeControls() {
    const { appearance, radius, scaling, primaryColor, setTheme } = useTheme();

    return (
        <div>
            <button
                onClick={() =>
                    setTheme({
                        appearance: appearance === 'light' ? 'dark' : 'light',
                    })
                }
            >
                모드 전환
            </button>

            <input
                type="color"
                value={primaryColor || '#2A6FF3'}
                onChange={(e) => setTheme({ primaryColor: e.target.value })}
            />

            <select value={radius} onChange={(e) => setTheme({ radius: e.target.value as Radius })}>
                <option value="none">각진</option>
                <option value="sm">작음</option>
                <option value="md">보통</option>
                <option value="lg">큼</option>
                <option value="xl">매우 큼</option>
                <option value="full">완전한 원</option>
            </select>
        </div>
    );
}
```

## 주요 특징 요약

### ✅ 장점

1. **완전한 TypeScript 지원**: 모든 설정과 상태에 대한 타입 안전성
2. **FOUC 완전 방지**: SSR/SSG 환경에서도 테마 깜빡임 없음
3. **실시간 동기화**: 여러 브라우저 탭 간 테마 설정 동기화
4. **자동 색상 생성**: 하나의 색상으로부터 전체 색상 팔레트 자동 생성
5. **고성능**: 불필요한 리렌더링 최소화
6. **확장 가능**: 새로운 테마 속성 쉽게 추가 가능

### 🎯 사용 사례

- 사용자 맞춤형 테마가 필요한 애플리케이션
- 다크 모드 지원이 필수인 현대적 웹 서비스
- 브랜드 컬러 커스터마이제이션이 필요한 화이트라벨 솔루션
- 접근성을 고려한 UI 스케일링이 필요한 서비스

이 시스템은 현대적인 웹 애플리케이션에서 요구되는 테마 관련 모든 요구사항을 충족하는 강력하고 유연한 솔루션입니다.