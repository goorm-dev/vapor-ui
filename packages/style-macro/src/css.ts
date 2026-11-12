import type { StyleObject, VaporClass } from '~/types';

let warned = false;

/**
 * 스타일 선언을 atomic className 문자열로 compile.
 *
 * 세 가지 호출 형태를 모두 받는다 — 전부 bundler plugin 이 빌드 타임에 치환
 * 하므로, 런타임에 이 placeholder 가 실제로 호출되면 plugin 미등록 상태다.
 *
 * - `css(style)` : 선언을 atomic class 로 분해해 공백 구분 className 을 반환한다.
 * - `css(a, b, ...)` : 이미 compile 된 결과물들을 CSS 선언 슬롯(selector+property)
 *   단위로 last-wins 머지한다 (뒤 argument 가 이김).
 * - `css(style, a, b, ...)` : 먼저 선언을 분해한 뒤 나머지 결과물들과 머지한다.
 *
 * 반환값은 순수 string 이다. Server Component 에서 만들어 Client Component 로
 * 넘겨도 직렬화 경계를 그대로 통과한다. 인자가 전부 정적이면 머지까지 compile
 * 시점에 끝나 런타임 코드가 전혀 남지 않는다.
 */
export function css(style: StyleObject): VaporClass;
export function css(...parts: Array<VaporClass | string | false | null | undefined>): VaporClass;
export function css(
    first: StyleObject,
    ...rest: Array<VaporClass | string | false | null | undefined>
): VaporClass;
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
