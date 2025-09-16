# Color Generator

접근성을 고려한 대비비 기반 색상 팔레트 생성 라이브러리

## 생성 기준

### 대비비 기반 생성
- Adobe Leonardo를 사용한 WCAG 접근성 기준 준수
- OKLCH 색공간에서 생성하여 일관된 지각적 밝기 제공
- 각 단계별로 설정된 대비비에 따라 자동 생성

### 색상 구성
**11가지 색상** (10개 색상 + Gray):
```
red, pink, grape, violet, blue, cyan, green, lime, yellow, orange, gray
```

**각 색상당 10단계**:
```
050, 100, 200, 300, 400, 500, 600, 700, 800, 900
```

**추가 색상**:
- `base`: `white`, `black` (고정값)
- `background.canvas`: 테마별 배경색

## 출력 구조

```typescript
{
    base: {
        white: { hex: '#ffffff', oklch: '...' },
        black: { hex: '#000000', oklch: '...' }
    },
    light: {
        background: { canvas: { hex, oklch } },
        red: { '050': { hex, oklch }, '100': { hex, oklch }, ... },
        // ... 11개 색상 (gray 포함)
    },
    dark: {
        background: { canvas: { hex, oklch } },
        // light와 동일한 구조, 다른 색상값
    }
}
```

## 커스터마이징

### 1. Primitive 색상 변경
```typescript
import { generateSystemColorPalette } from '@vapor-ui/color-generator';

const customPalette = generateSystemColorPalette({
    primitiveColors: {
        sky: '#87CEEB',      // cyan 대신 sky 색상
        purple: '#9966CC',   // violet 대신 purple 색상
        red: '#E53E3E',      // 기존 red 색상 변경
        // 기타 색조 커스터마이징
    }
});
```

### 2. 대비비 조정 (기본값)
```typescript
const customPalette = generateSystemColorPalette({
    contrastRatios: {
        '050': 1.15,  // 가장 연한 색상
        '100': 1.3,
        '200': 1.7,
        '300': 2.5,
        '400': 3.0,
        '500': 4.5,   // 중간 색상 (AA 기준)
        '600': 6.5,
        '700': 8.5,   // AAA 기준
        '800': 11.5,
        '900': 15.0,  // 가장 진한 색상
    }
});
```

### 3. 배경 밝기 설정 (기본값)
```typescript
const customPalette = generateSystemColorPalette({
    backgroundLightness: {
        light: 100,  // 밝은 테마: 완전한 흰색
        dark: 14,    // 어두운 테마: 매우 어두운 회색
    }
});
```

## 사용법

```typescript
import { defaultSystemColorPalette, generateSystemColorPalette } from '@vapor-ui/color-generator';

// 기본 팔레트 사용
console.log(defaultSystemColorPalette.light.blue['500'].hex);    // '#2a6ff3'
console.log(defaultSystemColorPalette.dark.blue['500'].hex);     // '#4985f7'
console.log(defaultSystemColorPalette.base.white.hex);           // '#ffffff'
console.log(defaultSystemColorPalette.light.background.canvas.hex); // '#ffffff'
console.log(defaultSystemColorPalette.dark.background.canvas.hex);  // '#232323'

// 커스텀 팔레트 생성
const myPalette = generateSystemColorPalette({
    primitiveColors: { primary: '#FF0000' }
});
```

## 주요 특징

- **Gray 색상 자동 포함**: 별도 설정 없이 무채색 팔레트 제공
- **테마별 최적화**: Light/Dark 테마에서 서로 다른 색상값으로 최적화
- **접근성 보장**: 모든 색상 단계가 WCAG 대비비 기준을 충족
- **OKLCH 지원**: Hex와 OKLCH 두 형식 모두 제공