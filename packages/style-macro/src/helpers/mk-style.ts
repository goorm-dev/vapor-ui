/**
 * `css()` 매크로가 compile 시 치환해 호출하는 runtime helper 3종.
 *
 * - `_mkStyle(map)` : property-key → atomic className map 을 받아 `toString`
 *   이 심어진 branded object 를 반환. React 가 `className={x}` 자리에서
 *   `String(x)` 를 호출하면 그 toString 이 "cls1 cls2 ..." 문자열을 돌려줘
 *   DOM 에 그대로 반영된다. 사용자 입장에서는 string 과 똑같이 쓸 수 있고,
 *   `_mergeStyles` 입장에서는 object 라 property-key 로 last-wins 가능.
 *
 * - `_mergeStyles(...parts)` : 이미 compile 된 결과물들을 왼쪽 → 오른쪽으로
 *   property 단위 last-wins 로 머지. 뒤 argument 가 이김 (StyleX 관례).
 *   Symbol tag 없는 인자는 조용히 무시 — 사용자가 template literal 로 만든
 *   plain string 을 실수로 넘겼을 때 의도치 않은 동작을 하지 않도록.
 *
 * - `_toClass(x)` : 단일 참조를 string 으로 강제. jsx-inject 가 쓰지 않는
 *   fallback 이지만 사용자 코드에서 수동 unwrap 이 필요할 때를 위해 노출.
 */

/**
 * Symbol tag — `_mkStyle` 이 생성한 object 만 가진 비 enumerable marker.
 * `_mergeStyles` 는 이 tag 로 vapor 결과물인지 식별, 아닌 인자는 무시한다.
 */
const VAPOR_CLASS_TAG: unique symbol = Symbol.for('@vapor-ui/style-macro/class');

/** 런타임 실체 타입. 외부에는 VaporClass(branded string) 로만 노출한다. */
interface VaporClassObject {
    readonly [VAPOR_CLASS_TAG]: true;
    toString(): string;
    [property: string]: string | true | ((this: VaporClassObject) => string);
}

/**
 * property-key → atomic className map 을 받아 toString 이 심어진 branded
 * object 로 포장.
 *
 * `className` 자리에 그대로 넘기면 React 가 String(x) → x.toString() 호출.
 * `_mergeStyles` 는 Symbol tag 로 이 object 를 식별한 뒤 for-in 으로
 * property-key 를 돌며 머지한다. tag 와 toString 은 비 enumerable 이라
 * for-in 루프에 참여하지 않는다.
 */
export function _mkStyle(map: Record<string, string>): string {
    const obj = Object.assign(Object.create(null) as object, map) as VaporClassObject;
    Object.defineProperty(obj, VAPOR_CLASS_TAG, {
        value: true,
        enumerable: false,
        configurable: false,
        writable: false,
    });
    Object.defineProperty(obj, 'toString', {
        value: function toString(this: VaporClassObject): string {
            let out = '';
            for (const key in this) {
                const v = this[key];
                if (typeof v === 'string' && v.length > 0) out += (out ? ' ' : '') + v;
            }
            return out;
        },
        enumerable: false,
        configurable: false,
        writable: false,
    });
    return obj as unknown as string;
}

/**
 * compile 된 `VaporClass` 들을 property 단위로 last-wins 머지. 뒤 argument
 * 가 이긴다. 결과도 `_mkStyle` 로 포장해 재머지가 가능하다.
 *
 * 인자가 Symbol tag 를 가진 object 가 아니면 무시한다 — plain string
 * (template literal 로 만든 결과) 을 넘겨도 조용히 깨지지 않도록.
 */
export function _mergeStyles(...parts: unknown[]): string {
    const merged: Record<string, string> = {};
    for (const part of parts) {
        if (!isVaporClass(part)) continue;
        for (const key in part) {
            const v = part[key];
            if (typeof v === 'string') merged[key] = v;
        }
    }
    return _mkStyle(merged);
}

/**
 * 단일 참조를 className string 으로 강제. undefined/null 은 빈 문자열.
 * jsx-inject 는 React 의 자동 String() 호출에 맡기므로 이 helper 를 거의
 * 쓰지 않는다 — 사용자 코드에서 수동 unwrap 이 필요할 때를 위한 노출.
 */
export function _toClass(x: unknown): string {
    if (x == null) return '';
    if (isVaporClass(x)) return x.toString();
    return String(x);
}

function isVaporClass(x: unknown): x is VaporClassObject {
    return typeof x === 'object' && x !== null && (x as VaporClassObject)[VAPOR_CLASS_TAG] === true;
}
