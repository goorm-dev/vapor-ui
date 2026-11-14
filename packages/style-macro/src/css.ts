import type { StyleObject, VaporClass } from '~/types';

let warned = false;

type CssPart = StyleObject | VaporClass | string | false | null | undefined;

/**
 * 스타일 선언을 class 문자열로 compile. bundler plugin 이 빌드 타임에 치환하므로,
 * 런타임에 이 placeholder 가 실제로 호출되면 plugin 미등록 상태다.
 *
 * - `css(style)` : 호출 1개 = class 1개 + CSS 블록 1개.
 * - `css(a, b, ...)` : 인자를 합친다. 같은 파일에서 정적으로 풀리는 인자(object 리터럴,
 *   모듈 최상위 `css()` 상수, 그 사이의 `&&` / `?:`)는 위치와 무관하게 한 블록으로 병합되고
 *   뒤 인자가 이긴다. 그 밖의 인자(import, props)는 이어붙이며 승패는 CSS 로드 순서를 따른다.
 *
 * 반환값은 순수 string 이다. Server Component 에서 만들어 Client Component 로
 * 넘겨도 직렬화 경계를 그대로 통과한다.
 */
export function css(...parts: CssPart[]): VaporClass;
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
