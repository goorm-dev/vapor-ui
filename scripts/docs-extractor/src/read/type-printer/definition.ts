import type { Type } from 'ts-morph';

export function isObjectLike(type: Type): boolean {
    return (
        !type.isUnion() &&
        (type.isObject() || type.isIntersection()) &&
        type.getCallSignatures().length === 0
    );
}

/** One property per line. */
export function formatObject(lines: string[]): string {
    return `{\n${lines.map((line) => `  ${line}`).join('\n')}\n}`;
}

/**
 * The checker hands `(A | B) & Common` back distributed, so every member repeats the
 * shared properties. Lines every member prints the same go back into one `& { … }`;
 * the rest stay on each member's line. With nothing shared, each member reads in full.
 */
export function formatObjectUnion(memberLines: string[][]): string {
    const common = memberLines[0].filter((line) =>
        memberLines.every((ownLines) => ownLines.includes(line)),
    );

    if (common.length === 0) return memberLines.map(formatObject).join(' | ');

    const variants = memberLines.map((ownLines) => {
        const rest = ownLines.filter((line) => !common.includes(line));
        return `  | ${rest.length > 0 ? `{ ${rest.join(' ')} }` : '{}'}`;
    });
    const shared = common.map((line) => `  ${line}`);
    return `(\n${variants.join('\n')}\n) & {\n${shared.join('\n')}\n}`;
}
