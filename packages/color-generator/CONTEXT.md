# Vapor Design System Color Context

## Color Philosophy & Principles

### 1. Perceptual Uniformity Foundation
Vapor 디자인시스템은 **OKLCH 색공간**을 기반으로 한 지각적 균일성을 핵심 원칙으로 합니다.
- 기존 HSL/RGB의 지각적 불균일성 문제 해결
- 색상 간 밝기 차이가 시각적으로 일관되게 인지되도록 보장
- 모든 색상 연산이 OKLCH 공간에서 수행됨

### 2. Accessibility-First Approach
**WCAG 대비비 기준**을 핵심으로 하는 접근성 우선 설계:
- Adobe Leonardo 라이브러리를 활용한 과학적 대비비 계산
- 각 색상 단계별로 미리 정의된 대비비 충족
- AA/AAA 기준을 자동으로 만족하는 색상 조합 보장

### 3. Adaptive Color Intelligence
수동 색상 선택 대신 **지능형 적응 알고리즘** 기반 자동 생성:
- 입력 색상의 명도를 분석하여 최적의 색상 쌍 생성
- 밝은/어두운 입력에 관계없이 일관된 색상 정체성 유지
- 브랜드 색상 변경 시 전체 시스템 자동 업데이트

## Configuration-Driven Architecture

### Core Configuration Constants
```typescript
// 기본 색상 팔레트 (10개 색조)
DEFAULT_PRIMITIVE_COLORS = {
    red: '#DF3337', pink: '#DA2F74', grape: '#BE2CE2',
    violet: '#8754F9', blue: '#2A6FF3', cyan: '#0E81A0',
    green: '#0A8672', lime: '#8FD327', yellow: '#FABB00',
    orange: '#D14905'
}

// 접근성 기반 대비비 매트릭스
DEFAULT_CONTRAST_RATIOS = {
    '050': 1.15,  // 거의 배경색과 유사
    '500': 4.5,   // AA 기준 (일반 텍스트)
    '700': 8.5,   // AAA 기준 (높은 대비)
    '900': 15.0   // 최대 대비
}

// 적응형 색상 생성 파라미터
ADAPTIVE_COLOR_GENERATION = {
    LIGHTNESS_THRESHOLD: 0.5,      // 밝은/어두운 색상 판별 기준
    DARK_LIGHTNESS_FACTOR: 0.35,   // 어두운 Key 생성 시 명도 감소율
    LIGHT_LIGHTNESS_FACTOR: 0.85,  // 밝은 Key 생성 시 명도 상한
    CHROMA_REDUCTION_FACTOR: 0.85   // 채도 감소율 (색상 안정성)
}
```

## Adaptive Color Generation Algorithm

### Phase 1: 지능형 Key 분석 및 생성

#### 1.1 입력 색상 분석
```typescript
const brandColorOklch = oklch(colorHex); // HEX → OKLCH 변환
const isLightColor = brandColorOklch.l > 0.5; // 명도 기준 분류
```

#### 1.2 적응형 Dual Key 시스템

**밝은 색상 입력 시 (#87CEEB, L=80%):**
```typescript
lightKey: '#87CEEB'  // 원본 유지 (밝은 끝)
darkKey:  '#1a4d66'  // 적응적 어두운 버전 (L=28%)
```

**어두운 색상 입력 시 (#1a4d66, L=28%):**
```typescript
lightKey: '#87CEEB'  // 적응적 밝은 버전 (L=80%)
darkKey:  '#1a4d66'  // 원본 유지 (어두운 끝)
```

#### 1.3 수학적 안전장치
- **명도 역변환**: `l / DARK_LIGHTNESS_FACTOR`로 원래 명도 복원
- **상한선 보호**: `Math.min()`으로 과도한 밝기 방지
- **채도 일관성**: 모든 경우에 동일한 채도 감소율 적용

### Phase 2: Leonardo 기반 색상 보간

#### 2.1 과학적 대비비 계산
Adobe Leonardo가 두 Key 색상 사이에서 **WCAG 대비비에 정확히 매칭**되는 색상을 계산:

```typescript
new Color({
    colorKeys: [lightKey, darkKey],  // 적응형 듀얼 키
    colorspace: 'OKLCH',             // 지각적 균일성 보장
    ratios: contrastRatios           // 접근성 기준 대비비
});
```

#### 2.2 테마별 자동 최적화
```typescript
// Light Theme (배경 L=100)
const lightness = 100;
// 대비비에 따라 점진적으로 어두워짐
// 높은 번호(900)일수록 더 어두운 색상

// Dark Theme (배경 L=14) 
const lightness = 14;
// 대비비에 따라 점진적으로 밝아짐
// 높은 번호(900)일수록 더 밝은 색상 (역전 구조)
```

### Phase 3: 무채색 시스템

#### 3.1 Gray Scale 생성
```typescript
const background = new BackgroundColor({
    name: 'gray',
    colorKeys: [themeType === 'light' ? '#FFFFFF' : '#000000'],
    ratios: contrastRatios,
});
```
- 완전한 무채색(채도 0) 기준
- 동일한 대비비 매트릭스 적용
- 다른 색상들과 일관된 명도 단계 보장

## Color Space Optimization
```typescript
const formatOklchForWeb = (oklchString: string): string => {
    // 웹 호환성을 위한 OKLCH 정밀도 최적화
    // L, C: 소수점 3자리, H: 소수점 1자리로 반올림
    return `oklch(${roundedL} ${roundedC} ${roundedH})`;
};
```

## Algorithmic Advantages

### 1. **색상 정체성 보존**
- 기존: 단일 Key → 극단에서 색조 상실
- Vapor: 적응형 듀얼 Key → 전 스펙트럼에서 색조 유지

### 2. **입력 독립성**
- 밝은/어두운 색상 입력과 무관하게 일관된 결과
- 디자이너의 직관적 색상 선택 지원

### 3. **과학적 정확성**
- OKLCH 색공간에서의 모든 연산
- WCAG 대비비 자동 충족
- 지각적 균일성 보장

### 4. **시스템 확장성**
- Configuration 기반 파라미터 조정
- 새로운 색상 추가 시 자동 전체 팔레트 생성
- 알고리즘 개선 시 하위 호환성 유지

이러한 체계적 접근을 통해 Vapor는 **과학적 근거**, **사용자 편의성**, **접근성 기준**을 모두 충족하는 차세대 적응형 색상 시스템을 구축했습니다.