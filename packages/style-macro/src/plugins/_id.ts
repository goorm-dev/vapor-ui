/** `a?b` → `['a', '?b']`. */
export function splitQuery(id: string): [string, string] {
    const i = id.indexOf('?');
    return i < 0 ? [id, ''] : [id.slice(0, i), id.slice(i)];
}

/** `a?b` → `a`. */
export function stripQuery(id: string): string {
    return splitQuery(id)[0];
}
