import { GROUP_HASH_LENGTH, VALUE_HASH_LENGTH } from '~/models/class-name';

const TAIL_LENGTH = GROUP_HASH_LENGTH + VALUE_HASH_LENGTH;
const TAIL_RE = new RegExp(`[A-Za-z0-9]{${TAIL_LENGTH}}$`);

/** `buildClassName` 산출물인지 — `_` 접두 + 고정 길이 영숫자 tail. */
function isVaporClass(cls: string): boolean {
    return cls.charCodeAt(0) === 95 && cls.length > TAIL_LENGTH && TAIL_RE.test(cls);
}

/**
 * className 조각들을 CSS 선언 슬롯(group) 단위로 last-wins 머지.
 * Compiled `ax()` 이식 — vapor class 는 tail 의 group 부분이 키, 그 외 class 는
 * 이름 전체가 키라 그대로 통과·중복 제거만 된다. 첫 등장 위치는 유지되고 값만
 * 뒤 인자로 덮인다.
 */
export function _ax(parts: ReadonlyArray<string | false | null | undefined>): string {
    const map = new Map<string, string>();
    for (const part of parts) {
        if (!part) continue;
        for (const cls of part.split(/\s+/)) {
            if (!cls) continue;
            const key = isVaporClass(cls) ? cls.slice(-TAIL_LENGTH, -VALUE_HASH_LENGTH) : cls;
            map.set(key, cls);
        }
    }
    return Array.from(map.values()).join(' ');
}
