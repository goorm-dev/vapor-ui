import { type PrintOptions, TYPE_FORMAT_FLAGS } from '#read/type-printer/shared';
import { isLiteralUnion, resolveTypeMembers } from '#read/type-printer/type-members';
import { joinTypeMembers } from '#type-text';
import type { Node, Type } from 'ts-morph';

export function isObjectLike(type: Type): boolean {
    return (
        !type.isUnion() &&
        (type.isObject() || type.isIntersection()) &&
        type.getCallSignatures().length === 0
    );
}

/** `name?: T;` per property. Optional properties leave out `| undefined`. */
export function printProperties(type: Type, location: Node, options: PrintOptions): string[] {
    return type.getProperties().map((property) => {
        const declaration = property.getDeclarations()[0] ?? location;
        const optional = property.isOptional();
        const type = property.getTypeAtLocation(declaration);

        // A named union of other types (`padding: Padding`) reads by its name, as it does
        // inside a larger union; splitting it here would spell out what the name hides.
        if (type.isUnion() && type.getAliasSymbol() && !isLiteralUnion(type)) {
            return `${property.getName()}${optional ? '?' : ''}: ${type.getText(declaration, TYPE_FORMAT_FLAGS)};`;
        }

        const members = resolveTypeMembers(type, {
            ...options,
            contextNode: declaration,
        }).filter((member) => !optional || member.kind !== 'undefined');

        return `${property.getName()}${optional ? '?' : ''}: ${joinTypeMembers(members)};`;
    });
}

function formatObject(lines: string[]): string {
    return `{\n${lines.map((line) => `  ${line}`).join('\n')}\n}`;
}

function printObject(type: Type, location: Node, options: PrintOptions): string {
    return formatObject(printProperties(type, location, options));
}

/**
 * The checker hands `(A | B) & Common` back distributed, so every member repeats the
 * shared properties. Lines every member prints the same go back into one `& { … }`;
 * the rest stay on each member's line. With nothing shared, each member reads in full.
 */
function printObjectUnion(members: Type[], location: Node, options: PrintOptions): string {
    const memberLines = members.map((member) => printProperties(member, location, options));
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

/**
 * The body behind a type name, as a reader would write it: an object type reads one
 * property per line, a union of objects (Base UI event details, one per `reason`) reads
 * as `(…members) & { …shared }`, anything else reads as its members on one line.
 * Property types go through the prop type printer, so names inside stay names one
 * level down and named unions of values are spelled out as in `detailedType`.
 */
export function printTypeDefinition(type: Type, location: Node, options: PrintOptions): string {
    if (isObjectLike(type)) return printObject(type, location, options);

    const members = type.isUnion() ? type.getUnionTypes() : [];
    if (members.length > 0 && members.every(isObjectLike)) {
        return printObjectUnion(members, location, options);
    }

    return joinTypeMembers(resolveTypeMembers(type, options));
}
