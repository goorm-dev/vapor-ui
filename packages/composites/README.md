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

각 컴포넌트가 자기 CSS 파일을 import하므로 composites 스타일을 따로 import하지 않는다. 사용한 컴포넌트의 CSS만 번들에 들어간다. 번들러 플러그인은 필요 없다. CSS 엔트리에는 core 스타일만 둔다.

```css
@import '@vapor-ui/core/layers.css';
@import '@vapor-ui/core/styles.css';
```

CJS(`require`)로 쓸 때는 루트(`@vapor-ui/composites`) 대신 서브패스(`@vapor-ui/composites/alert-dialog`)로 가져온다. CJS 루트 진입점은 모든 컴포넌트를 `require`하므로 쓰지 않은 컴포넌트의 CSS까지 번들에 들어간다.

composites 스타일은 `@layer vapor-composites`에 들어간다. `@vapor-ui/core/layers.css`가 이 레이어를 `vapor-components`와 `vapor-utilities` 사이에 선언하므로, composites 스타일은 core 컴포넌트 스타일을 덮어쓰고 앱의 `css()` 스타일(`vapor-utilities`)과 레이어 밖 일반 `className`에는 진다. CSS 로드 순서와 무관하다.

이 CSS 엔트리는 앱 진입 파일에서 `@vapor-ui/core`, `@vapor-ui/composites` import보다 먼저 import한다. 브라우저는 레이어를 처음 등장한 순서로 등록하므로, 컴포넌트 CSS가 먼저 로드되면 `vapor-composites`가 `vapor-utilities` 뒤에 등록되어 앱 스타일을 이긴다.

`layers.css`를 생략하고 레이어 순서를 직접 선언한다면 `vapor-composites`를 `vapor-components`와 `vapor-utilities` 사이에 넣는다. 빠지면 브라우저가 `vapor-composites`를 맨 뒤 레이어로 취급해 앱 스타일까지 이긴다.

```css
@layer vapor-theme, vapor-reset, vapor-components, vapor-composites, vapor-utilities;
```

## 라이선스

MIT License © 2025 goorm, Inc
