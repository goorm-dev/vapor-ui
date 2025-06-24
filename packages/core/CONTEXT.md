# Contexts

## Polymorphic (w. Box)

### 기존 결정사항

- As Prop, AsChild Prop을 모두 지원하는 Box 컴포넌트 생성
- Box 컴포넌트에서는 padding, margin, display 등의 유틸리티 CSS 속성을 지원

### 위 방법의 문제점

- As Prop은 컴포넌트의 타입이 개발 시점에 동적으로 결정되므로, 이에 따른 성능 문제가 동반됨 [관련 Radix UI Issue](https://github.com/radix-ui/design-system/issues/358#issuecomment-943398902)
- 컴포넌트 선언 시마다 `as` 키워드로 컴포넌트 타입을 단언해야 하므로 안정성이 떨어지고 반복적인 작업이 동반됨
- 컴포넌트 타입 단언을 하기 때문에, `ComponentProps<typeof ...>`와 같은 Props 추출 방식이 제한됨

### 해결 방법

- As Prop 지원 중단
- `Box` 컴포넌트가 아니라, 팩토리 함수(`vapor.div`)에서 CSS Utility를 포함시키는 방법
- `Box` 컴포넌트는 이제 팩토리 함수로 만든 `div` 박스를 서브하는 역할만 수행
