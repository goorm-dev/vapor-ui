/**
 * 여러 요소의 aria-label을 객체 형태로 받기 위한 유틸리티 타입.
 * 유니온으로 넘긴 키들을 각각 필수 string 프로퍼티로 노출한다.
 *
 * @example
 * type DialogAriaLabels = AriaLabelProps<'close' | 'title'>;
 * // { close: string; title: string }
 *
 * @example
 * type SingleLabel = AriaLabelProps<'close'>;
 * // { close: string }
 */
export type AriaLabelProps<Keys extends string> = Record<Keys, string>;
