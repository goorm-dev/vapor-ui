# Vapor UI Theme Provider 개선안

## 현재 시스템의 문제점

### 아키텍처 복잡성
- **이중 설정 부담**: ThemeScript와 ThemeProvider 모두 설정 필요
- **빌드 환경 제약**: Vite 등 일부 환경에서 인라인 스크립트 제약
- **코드 중복**: theme-provider와 theme-injector에 동일한 색상 계산 로직 존재

### 기능적 한계
- **제한적 커스터마이제이션**: 단일 primaryColor만 지원, 세밀한 radius 조정 불가
- **런타임 오버헤드**: CSS 변수 실시간 계산 및 DOM 조작 비용

## 설계 철학

### 핵심 전략
**빌드 타임 CSS 생성** + **런타임 상태 관리 분리**를 통한 성능 최적화와 개발 경험 향상

### 설계 원칙
1. **단일 책임 원칙**: 테마 생성과 상태 관리의 명확한 분리
2. **성능 우선**: 런타임 계산을 빌드 타임으로 이동
3. **확장 가능성**: 향후 다중 색상, 타이포그래피 등 확장 고려
4. **개발자 경험**: 직관적이고 유연한 API 설계

## 새로운 아키텍처

### 패키지 구조 및 책임

```
@vapor-ui/color-generator      # 색상 팔레트 생성 (기존 유지)
├── 목적: 색상 계산 및 팔레트 생성
├── generators/
├── utils/color.ts
└── index.ts

@vapor-ui/css-generator        # CSS 생성 도구 (신규, theme-utils 개선명)
├── 목적: 테마 CSS 변수 생성
├── generators/
│   ├── color-css.ts          # color-generator 기반 색상 CSS
│   ├── scaling-css.ts        # 크기 스케일링 CSS
│   └── radius-css.ts         # 반지름 시스템 CSS
├── integrations/
│   └── complete-theme.ts     # 통합 테마 CSS 생성
└── index.ts

@vapor-ui/core                 # 런타임 테마 관리 (간소화)
├── 목적: appearance 상태 관리만
├── components/
│   ├── theme-provider/       # 다크/라이트 모드 토글
│   └── theme-config/         # 최소한의 설정 관리
└── styles/

@vapor-ui/theme-cli           # CLI 도구 (신규)
├── 목적: 개발자 워크플로우 지원
├── bin/vapor-theme.js
└── commands/
    ├── init.ts
    └── generate.ts
```

### 의존성 관계

```
@vapor-ui/theme-cli → @vapor-ui/css-generator → @vapor-ui/color-generator
@vapor-ui/core (독립적, 최소 의존성)
```

### 모노레포 워크스페이스 구조

#### 현재 구조 분석
```
vapor-ui/
├── apps/                    # 최종 사용자 대상 애플리케이션
│   ├── figma-plugin/       # Figma 플러그인 앱
│   └── website/            # 문서화 웹사이트
├── packages/               # 라이브러리 패키지 (npm 배포용)
│   ├── color-generator/    # 색상 생성 라이브러리
│   ├── core/              # 메인 컴포넌트 라이브러리
│   ├── eslint-config/     # ESLint 설정
│   ├── hooks/             # React 훅 라이브러리
│   ├── icons/             # 아이콘 컴포넌트
│   └── typescript-config/ # TypeScript 설정
└── tools/                  # 개발 도구 (현재 비어있음)
    └── cli/               # 빈 디렉토리
```

#### 신규 패키지 위치 결정

**모든 신규 패키지는 `packages/` 폴더에 위치** ✅

**선정 이유:**
1. **npm 배포 패키지**: 두 패키지 모두 외부 개발자가 설치하여 사용하는 라이브러리
2. **버전 관리 일관성**: 기존 패키지들과 동일한 릴리스 사이클 적용
3. **빌드 파이프라인**: 공통 tsup/vitest 설정 활용
4. **네이밍 일관성**: 기존 kebab-case 패턴 유지

#### 최종 모노레포 구조
```
packages/
├── color-generator/         # 기존 유지
├── css-generator/          # 신규 (theme-utils 개선명)
│   ├── generators/
│   │   ├── color-css.ts
│   │   ├── scaling-css.ts
│   │   └── radius-css.ts
│   ├── integrations/
│   │   └── complete-theme.ts
│   └── package.json
├── theme-cli/              # 신규
│   ├── bin/
│   │   └── vapor-theme.js
│   ├── src/
│   │   ├── commands/
│   │   │   ├── init.ts
│   │   │   └── generate.ts
│   │   └── index.ts
│   └── package.json
└── core/                   # 기존, 대폭 간소화
    ├── components/
    │   ├── theme-provider/ # appearance 상태 관리만
    │   └── theme-config/   # 최소한의 설정 관리
    └── styles/
```

## API 설계

### @vapor-ui/css-generator

```typescript
// 색상 테마 설정
interface ColorThemeConfig {
    primary: { name: string; hex: string };
    background: { 
        name: string; 
        hex: string; 
        lightness: { light: number; dark: number } 
    };
}

// 색상 CSS 변수 생성
export function generateColorCSS(config: ColorThemeConfig): {
    lightTheme: string;
    darkTheme: string;
};

// 크기 스케일링 CSS 변수 생성
export function generateScalingCSS(scaling: number): string;

// 반지름 CSS 변수 생성 (px 단위 직접 지원)
export function generateRadiusCSS(radius: number): string;

// 통합 테마 CSS 생성
interface CompleteThemeConfig {
    colors: ColorThemeConfig;
    scaling: number;
    radius: number;
}

export function generateCompleteTheme(config: CompleteThemeConfig): string;
```

### @vapor-ui/core (최소화된 런타임)

```typescript
// 런타임 테마 설정 (appearance만 관리)
interface ThemeConfig {
    appearance?: 'light' | 'dark' | 'system';
    storageKey?: string;
    enableSystemTheme?: boolean;
    nonce?: string;
}

// 상태 관리 전용 ThemeProvider
export function ThemeProvider({ config, children }: {
    config?: ThemeConfig;
    children: ReactNode;
});

// FOUC 방지 스크립트 (appearance 클래스 토글만)
export function ThemeScript({ config }: {
    config?: ThemeConfig;
});

// 테마 상태 접근 훅
export function useTheme(): {
    appearance: 'light' | 'dark';
    setAppearance: (appearance: 'light' | 'dark') => void;
    toggleAppearance: () => void;
};
```

### @vapor-ui/theme-cli (신규)

```bash
# CLI 명령어
npx @vapor-ui/theme-cli init
npx @vapor-ui/theme-cli generate --primary="#2A6FF3" --radius=8 --scaling=1.2

# 또는 글로벌 설치 후
npm install -g @vapor-ui/theme-cli
vapor-theme init
vapor-theme generate --config=theme.config.js
```

## 개발자 워크플로우

### 방법 1: CLI 도구 활용 (권장)

```bash
# 프로젝트 초기화
npx @vapor-ui/theme-cli init

# 테마 CSS 생성
npx @vapor-ui/theme-cli generate \
  --primary="#2A6FF3" \
  --background="#F8FAFC" \
  --radius=8 \
  --scaling=1.15 \
  --output="./src/styles/theme.css"
```

### 방법 2: 웹 도구 활용

```typescript
// Documentation 사이트의 테마 생성기 사용
// 1. 시각적 인터페이스로 색상/크기 조정
// 2. 생성된 CSS 코드 복사
// 3. global.css에 붙여넣기
```

### 방법 3: 프로그래밍 방식

```typescript
// build script 또는 config 파일에서
import { generateCompleteTheme } from '@vapor-ui/css-generator';

const themeCSS = generateCompleteTheme({
    colors: {
        primary: { name: 'brand', hex: '#2A6FF3' },
        background: { 
            name: 'neutral', 
            hex: '#F8FAFC', 
            lightness: { light: 98, dark: 8 } 
        }
    },
    scaling: 1.15,
    radius: 8
});

// 생성된 CSS를 파일로 저장하거나 번들에 포함
```

### CSS 적용 및 React 통합

```css
/* 생성된 테마 CSS 예시 */
:root {
    /* 색상 팔레트 */
    --vapor-color-brand-050: #eff6ff;
    --vapor-color-brand-500: #2a6ff3;
    --vapor-color-brand-900: #1e3a8a;
    
    /* 시멘틱 토큰 */
    --vapor-color-background-primary: var(--vapor-color-brand-50);
    --vapor-color-foreground-primary: var(--vapor-color-brand-500);
    
    /* 크기 시스템 */
    --vapor-scale-factor: 1.15;
    --vapor-radius-base: 8px;
}

.vapor-dark-theme {
    --vapor-color-background-primary: var(--vapor-color-brand-900);
    --vapor-color-foreground-primary: var(--vapor-color-brand-400);
}
```

```typescript
// React 앱에서 테마 상태 관리만
import { ThemeProvider, ThemeScript } from '@vapor-ui/core';

function App() {
    return (
        <>
            <head>
                <ThemeScript config={{ appearance: 'system' }} />
            </head>
            
            <ThemeProvider config={{ 
                appearance: 'system',
                storageKey: 'my-app-theme' 
            }}>
                <MainApp />
            </ThemeProvider>
        </>
    );
}
```

## 리팩터링 계획

### @vapor-ui/core 모듈 변경사항

#### 1. theme-config 모듈 (간소화)

```typescript
// 런타임 전용 설정 관리
interface ThemeConfig {
    appearance?: 'light' | 'dark' | 'system';
    storageKey?: string;
    enableSystemTheme?: boolean;
    nonce?: string;
}

const DEFAULT_CONFIG = {
    appearance: 'system',
    storageKey: 'vapor-ui-theme',
    enableSystemTheme: true,
} as const;

export const createThemeConfig = (userConfig?: ThemeConfig) => ({
    ...DEFAULT_CONFIG,
    ...userConfig,
});
```

#### 2. theme-injector → theme-script (역할 축소)

**Before**: 복잡한 색상 계산 + CSS 변수 주입 + FOUC 방지  
**After**: appearance 클래스 토글만

```typescript
// 경량화된 FOUC 방지 스크립트
export const generateThemeScript = (config: ThemeConfig) => `
(function() {
    const THEME_CLASSES = {
        light: 'vapor-light-theme',
        dark: 'vapor-dark-theme'
    };
    
    let appearance = '${config.appearance}';
    
    // system 테마 감지
    if (appearance === 'system') {
        appearance = window.matchMedia('(prefers-color-scheme: dark)').matches 
            ? 'dark' : 'light';
    }
    
    // localStorage에서 사용자 설정 로드
    try {
        const stored = localStorage.getItem('${config.storageKey}');
        if (stored) {
            const parsed = JSON.parse(stored);
            appearance = parsed.appearance || appearance;
        }
    } catch (e) {}
    
    // 클래스 적용
    document.documentElement.classList.add(THEME_CLASSES[appearance]);
})();
`;
```

#### 3. ThemeProvider (핵심 기능만 유지)

**제거**: primaryColor, radius, scaling 관련 모든 로직  
**유지**: appearance 상태 관리, localStorage 동기화, 시스템 테마 감지

```typescript
interface ThemeContextValue {
    appearance: 'light' | 'dark';
    setAppearance: (appearance: 'light' | 'dark' | 'system') => void;
    toggleAppearance: () => void;
}

export const ThemeProvider = ({ config, children }: ThemeProviderProps) => {
    const resolvedConfig = createThemeConfig(config);
    const [appearance, setAppearance] = useState<'light' | 'dark'>('light');

    // 시스템 테마 변경 감지
    useEffect(() => {
        if (!resolvedConfig.enableSystemTheme) return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (/* 현재 시스템 모드인 경우 */) {
                setAppearance(e.matches ? 'dark' : 'light');
            }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [resolvedConfig.enableSystemTheme]);

    // CSS 클래스 토글만 담당
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('vapor-dark-theme', appearance === 'dark');
        root.classList.toggle('vapor-light-theme', appearance === 'light');
    }, [appearance]);

    // localStorage 동기화 등 기타 로직 유지...
};
```

## 성능 및 개발 경험 개선

### 런타임 성능 향상

#### Before (현재)
- 색상 계산 로직이 런타임에 실행
- CSS 변수 동적 주입으로 인한 DOM 조작 오버헤드
- 복잡한 색상 변환 알고리즘이 메인 번들에 포함

#### After (개선안)
- **제로 런타임 비용**: 모든 색상 값이 정적 CSS로 사전 생성
- **최소 DOM 조작**: appearance 클래스 토글만 (1-2개 클래스)
- **번들 사이즈 50% 감소**: @vapor-ui/core에서 색상 생성 로직 완전 제거

### 개발 경험 개선

#### 유연성 증대
- **픽셀 단위 반지름**: 기존 preset 방식에서 자유로운 px 값 지원
- **다중 색상 지원**: primary 외 secondary, accent 색상 확장 가능
- **시각적 피드백**: CLI 및 웹 도구로 실시간 테마 미리보기

#### 디버깅 용이성
- **정적 CSS**: 개발자 도구에서 CSS 변수 값 직접 확인 가능
- **명확한 의존성**: 빌드 타임 vs 런타임 책임 분리

### 확장성 고려사항

#### 미래 기능 확장

```typescript
// 타이포그래피 시스템 확장
interface TypographyConfig {
    fontFamily: { sans: string; mono: string };
    fontWeight: { normal: number; bold: number };
    lineHeight: { tight: number; normal: number; relaxed: number };
}

// 애니메이션 시스템 확장  
interface MotionConfig {
    duration: { fast: string; normal: string; slow: string };
    easing: { ease: string; bounce: string };
}

// 통합 테마 시스템
interface FutureThemeConfig {
    colors: MultiColorConfig;
    typography: TypographyConfig;
    motion: MotionConfig;
    spacing: SpacingConfig;
    radius: RadiusConfig;
}
```

## 마이그레이션 가이드

### v1.x → v2.x 전환

#### Step 1: 기존 설정 분석
```typescript
// Before (v1.x)
<ThemeProvider config={{
    primaryColor: '#2A6FF3',
    radius: 'lg',  // preset 방식
    scaling: 1.2,
    appearance: 'dark'
}} />
```

#### Step 2: CSS 생성 도구로 변환
```bash
# CLI를 통한 자동 변환
npx @vapor-ui/theme-cli migrate \
  --from="v1-config.json" \
  --output="./src/theme.css"
```

#### Step 3: 새로운 구조 적용
```typescript
// After (v2.x)
// 1. 생성된 CSS 파일 import
import './theme.css';

// 2. 간소화된 Provider 사용
<ThemeProvider config={{ 
    appearance: 'dark',
    enableSystemTheme: true 
}} />
```

### 점진적 마이그레이션 전략

1. **Phase 1**: 기존 v1.x와 v2.x 병행 지원 (3개월)
2. **Phase 2**: v1.x deprecated 경고 추가 (3개월)
3. **Phase 3**: v1.x 완전 제거 (major version bump)

## 결론

본 개선안은 다음과 같은 핵심 가치를 제공합니다:

### 🚀 성능 최적화
- 빌드 타임 CSS 생성으로 런타임 제로 비용 달성
- 번들 크기 대폭 감소 및 로딩 성능 향상

### 🛠 개발자 경험
- CLI 도구와 웹 인터페이스를 통한 직관적인 테마 생성
- 명확한 관심사 분리로 코드 이해도 및 유지보수성 향상

### 🔧 확장성
- 모듈형 아키텍처로 미래 기능 확장 용이
- 타입 안전성 보장 및 API 일관성 유지

이러한 설계를 통해 Vapor UI는 더욱 성능이 뛰어나고 사용하기 쉬운 디자인 시스템으로 발전할 수 있습니다.