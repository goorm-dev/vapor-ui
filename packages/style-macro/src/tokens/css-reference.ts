/**
 * CSS property 메타 — 외부 레퍼런스 포팅.
 *
 * - `UNITLESS_PROPERTIES` : React `CSSProperty.js` 의 unitless 리스트 + vendor
 *   prefix 자동 확장. 숫자 값에 `px` 를 붙여서는 안 되는 property 집합.
 *   compile 타임(`models/value.ts`) 과 runtime(`runtime.ts`) 양쪽에서 조회.
 *
 * - `hyphenate(name)` : React `hyphenateStyleName.js` 알고리즘. camelCase → kebab,
 *   `WebkitLineClamp` → `-webkit-line-clamp`, `msGridRow` → `-ms-grid-row` 처럼
 *   vendor prefix 를 보존한다. CSS custom property(`--foo`) 는 그대로 통과.
 *
 * - `isUnitless(property)` : camelCase/kebab 어느 쪽이 들어와도 같은 결과를
 *   반환하는 lookup helper.
 *
 * 이 파일의 세 export 는 서로 독립적이지 않다: vendor prefix 변형을
 * 한 곳에서 생성해 unitless 와 hyphenate 가 같은 규약을 공유한다.
 */

/**
 * React `CSSProperty.js` 의 unitless 리스트 (camelCase canonical form).
 * 추가 항목: `aspectRatio`, `scale`, `gridColumn*`, `gridRow*` 계열 —
 * 리뷰 #5b 에서 보고된 property 들이다.
 */
const UNITLESS_CAMEL_CORE: readonly string[] = [
    'animationIterationCount',
    'aspectRatio',
    'borderImageOutset',
    'borderImageSlice',
    'borderImageWidth',
    'boxFlex',
    'boxFlexGroup',
    'boxOrdinalGroup',
    'columnCount',
    'columns',
    'flex',
    'flexGrow',
    'flexPositive',
    'flexShrink',
    'flexNegative',
    'flexOrder',
    'gridArea',
    'gridRow',
    'gridRowEnd',
    'gridRowSpan',
    'gridRowStart',
    'gridColumn',
    'gridColumnEnd',
    'gridColumnSpan',
    'gridColumnStart',
    'fontWeight',
    'lineClamp',
    'lineHeight',
    'opacity',
    'order',
    'orphans',
    'scale',
    'tabSize',
    'widows',
    'zIndex',
    'zoom',
    'fillOpacity',
    'floodOpacity',
    'stopOpacity',
    'strokeDasharray',
    'strokeDashoffset',
    'strokeMiterlimit',
    'strokeOpacity',
    'strokeWidth',
];

/** Vendor prefix. `ms` 만 소문자 시작. */
const VENDOR_PREFIXES: readonly string[] = ['Webkit', 'Moz', 'O', 'ms'];

const prefixCamel = (prefix: string, key: string): string =>
    prefix + key.charAt(0).toUpperCase() + key.slice(1);

/**
 * camelCase 기준 unitless property 집합. compile 타임 전용 — property 를
 * camelCase 로 정규화한 뒤 조회해야 한다.
 */
export const UNITLESS_PROPERTIES: ReadonlySet<string> = (() => {
    const set = new Set<string>(UNITLESS_CAMEL_CORE);
    for (const key of UNITLESS_CAMEL_CORE) {
        for (const prefix of VENDOR_PREFIXES) set.add(prefixCamel(prefix, key));
    }
    return set;
})();

/** kebab → camelCase 변환 (property 이름 전용 — leading `-` 는 유지). */
const kebabToCamelProperty = (name: string): string => {
    if (name.startsWith('--')) return name;
    // leading vendor prefix(`-webkit-` 등)는 다음 단어 첫 글자만 대문자로.
    const normalized = name.replace(/^-(ms|moz|webkit|o)-/, (_, p: string) =>
        p === 'ms' ? 'ms' : p.charAt(0).toUpperCase() + p.slice(1),
    );
    return normalized.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
};

/**
 * property 이름이 unitless 인지 판별. camelCase / kebab 입력 모두 지원.
 */
export function isUnitless(property: string): boolean {
    if (property.startsWith('--')) return true; // CSS custom property.
    const camel = property.includes('-') ? kebabToCamelProperty(property) : property;
    return UNITLESS_PROPERTIES.has(camel);
}

/**
 * React `hyphenateStyleName.js` 포팅. camelCase CSS property → kebab-case.
 *
 * - `color` → `color`
 * - `backgroundColor` → `background-color`
 * - `WebkitLineClamp` → `-webkit-line-clamp`
 * - `MozFlex` → `-moz-flex`
 * - `OTransition` → `-o-transition`
 * - `msGridRow` → `-ms-grid-row` (ms 만 소문자 시작이므로 특수 처리)
 * - `--foo-bar` → `--foo-bar` (custom property 는 그대로)
 */
export function hyphenate(property: string): string {
    if (property.startsWith('--')) return property;
    return property
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^ms-/, '-ms-');
}
