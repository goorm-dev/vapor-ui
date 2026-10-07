import type { ParsedTypeMember } from '#model';
import type { Type, ts } from 'ts-morph';

/**
 * The union as it was written, e.g. `ReactNode | Ref<T> | undefined`.
 *
 * `getUnionTypes()` returns the flattened union, which expands `ReactNode` and
 * `Ref<T>` into their members. TypeScript keeps the written members on the
 * union's `origin`, which is what `type.getText()` prints from. A member that is
 * itself a union is opened again when it has no name, such as `(A | B) & (A | B)`,
 * or when it only lists values, such as `type Side = 'top' | 'bottom'`. A named
 * union of other types (`type Padding = number | {…}`) reads better by its name.
 *
 * ponytail: `origin` and ts-morph's `compilerFactory` are both internal. If either
 * moves in an upgrade, this falls back to the flattened union and aliases expand
 * again; the extract tests for ReactNode and Ref catch that.
 */
export function writtenUnionMembers(type: Type): Type[] {
    const origin = (type.compilerType as { origin?: ts.Type }).origin;
    const factory = (
        type as unknown as { _context?: { compilerFactory?: { getType(t: ts.Type): Type } } }
    )._context?.compilerFactory;

    const members =
        origin?.isUnion() && factory
            ? origin.types.map((member) => factory.getType(member))
            : type.getUnionTypes();

    return members.flatMap((member) =>
        member.isUnion() &&
        !member.isBoolean() &&
        (!member.getAliasSymbol() || isLiteralUnion(member))
            ? writtenUnionMembers(member)
            : [member],
    );
}

/** Every value is spelled out: `"sm" | "md"`, `1 | 2`, `boolean | "auto"`, `"on" | undefined`. */
export function isLiteralUnion(type: Type): boolean {
    return type
        .getUnionTypes()
        .every(
            (member) =>
                member.isLiteral() ||
                member.isBooleanLiteral() ||
                member.isUndefined() ||
                member.isNull(),
        );
}

export function kindOf(type: Type): ParsedTypeMember['kind'] {
    if (type.isUndefined()) return 'undefined';
    if (type.isStringLiteral()) return 'string-literal';
    if (type.getCallSignatures().length > 0) return 'function';
    return 'other';
}

/** TypeScript prints `null` and then `undefined` after every other member. */
function nullishRank(member: ParsedTypeMember): number {
    if (member.kind === 'undefined') return 2;
    return member.text === 'null' ? 1 : 0;
}

/**
 * Printed members as TypeScript lists them at the top level: `true | false` reads as
 * one `boolean`, members that print the same are listed once, `null | undefined` last.
 */
export function tidyMembers(members: ParsedTypeMember[]): ParsedTypeMember[] {
    const texts = new Set(members.map((member) => member.text));
    if (texts.has('true') && texts.has('false')) {
        members = members
            .filter((member) => member.text !== 'true')
            .map((member) => (member.text === 'false' ? { ...member, text: 'boolean' } : member));
    }

    const unique = [...new Map(members.map((member) => [member.text, member])).values()];

    return unique.sort((a, b) => nullishRank(a) - nullishRank(b));
}
