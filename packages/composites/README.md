<p>
  <a href="https://www.npmjs.com/package/@vapor-ui/composites">
    <img src="https://img.shields.io/npm/v/@vapor-ui/composites.svg" alt="npm version">
  </a>
</p>

# @vapor-ui/composites

`@vapor-ui/core` primitive를 조합해 만든 슬롯 기반 완성형 컴포넌트 패키지다. 디자인 결정을 내재화해, 별도의 조합 과정 없이 바로 사용할 수 있다.

## 설치

```sh
# pnpm
pnpm add @vapor-ui/core @vapor-ui/composites

# npm
npm install @vapor-ui/core @vapor-ui/composites

# yarn
yarn add @vapor-ui/core @vapor-ui/composites
```

`@vapor-ui/core`는 peer dependency로 지정한다. 두 패키지가 하나의 React Context(예: `ThemeProvider`)를 공유하도록 함께 설치한다.

## 스타일

CSS 엔트리에서 core 스타일과 함께 composites 스타일을 한 번 import한다. 번들러 플러그인은 필요 없다.

```css
@import '@vapor-ui/core/layers.css';
@import '@vapor-ui/core/styles.css';
@import '@vapor-ui/composites/styles.css';
```

composites 스타일은 `@layer vapor-utilities`에 들어가므로 core 컴포넌트 스타일(`vapor-components`)을 덮어쓰고, 레이어 밖의 일반 `className`에는 진다.

## 라이선스

MIT License © 2025 goorm, Inc
