import type { PrintOptions } from '#read/type-printer/shared';
import { resolveTypeMembers } from '#read/type-printer/type-members';
import { joinTypeMembers } from '#type-text';
import type { Node, Type } from 'ts-morph';

function isObjectLike(type: Type): boolean {
    return (
        !type.isUnion() &&
        (type.isObject() || type.isIntersection()) &&
        type.getCallSignatures().length === 0
    );
}

function printObject(type: Type, location: Node, options: PrintOptions): string {
    const lines = type.getProperties().map((property) => {
        const declaration = property.getDeclarations()[0] ?? location;
        const optional = property.isOptional();
        const members = resolveTypeMembers(property.getTypeAtLocation(declaration), {
            ...options,
            contextNode: declaration,
        }).filter((member) => !optional || member.kind !== 'undefined');

        return `  ${property.getName()}${optional ? '?' : ''}: ${joinTypeMembers(members)};`;
    });

    return `{\n${lines.join('\n')}\n}`;
}

/**
 * The body behind a type name, as a reader would write it: an object type reads one
 * property per line, a union of objects (Base UI event details, one per `reason`) reads
 * as those objects joined by `|`, anything else reads as its members on one line.
 * Property types go through the prop type printer, so names inside stay names one
 * level down and named unions of values are spelled out as in `detailedType`.
 */
export function printTypeDefinition(type: Type, location: Node, options: PrintOptions): string {
    if (isObjectLike(type)) return printObject(type, location, options);

    const members = type.isUnion() ? type.getUnionTypes() : [];
    if (members.length > 0 && members.every(isObjectLike)) {
        return members.map((member) => printObject(member, location, options)).join(' | ');
    }

    return joinTypeMembers(resolveTypeMembers(type, options));
}
