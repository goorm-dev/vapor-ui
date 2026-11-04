import type { StyleObject, VaporClass } from '~/types';

let warned = false;

/**
 * 스타일 선언을 atomic className 집합으로 compile.
 *
 * 세 가지 호출 형태를 모두 받는다 — 전부 bundler plugin 이 빌드 타임에 치환
 * 하므로, 런타임에 이 placeholder 가 실제로 호출되면 plugin 미등록 상태다.
 *
 * - `css(style)` : 선언을 atomic class 로 분해해 property-key → className
 *   map 을 반환한다.
 * - `css(a, b, ...)` : 이미 compile 된 결과물들을 property 단위로 last-wins
 *   머지한다 (뒤 argument 가 이김).
 * - `css(style, a, b, ...)` : 먼저 선언을 atomic class 로 분해한 뒤 나머지
 *   결과물들과 머지한다.
 *
 * 반환값의 타입은 string-호환 branded value 이지만, 런타임 실체는 toString 이
 * 심어진 object 다. `className={value}` 로 바로 넘겨도 React 가 `String(value)`
 * 를 호출해 toString() 을 트리거하므로 사용자 코드 상 변환은 필요 없다.
 * 반면 template literal(`${a} ${b}`) 로 섞으면 brand 가 소실되어 plugin 이
 * compile 에러로 잡는다 — 그 조합은 property-aware 머지를 건너뛰기 때문에
 * 리뷰 #1(파일 간 cascade fragility)이 재발하기 쉽다.
 */
export function css(style: StyleObject): VaporClass;
export function css(...parts: VaporClass[]): VaporClass;
export function css(first: StyleObject, ...rest: VaporClass[]): VaporClass;
export function css(..._args: unknown[]): VaporClass {
    if (!warned) {
        console.warn(
            '[@vapor-ui/style-macro] css() was called but the plugin is not active. ' +
                'Register the appropriate bundler entry (@vapor-ui/style-macro/vite, /webpack, /next, ...) in your build config.',
        );
        warned = true;
    }
    return '' as VaporClass;
}
