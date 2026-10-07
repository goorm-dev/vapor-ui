/**
 * Prints prop types for the docs. One printer per component namespace; callers ask it
 * only two things: the members of a prop's type, and the body behind a type name.
 */
import type { ParsedTypeMember } from '#model';
import { baseUiName, findVaporName } from '#read/type-printer/base-ui-type';
import {
    isAnonymousObject,
    isPreservedReactAlias,
    isReactElement,
    primitiveText,
    reactElementProps,
} from '#read/type-printer/branches';
import { formatObject, formatObjectUnion, isObjectLike } from '#read/type-printer/definition';
import { formatFunction, parametersOf } from '#read/type-printer/function';
import {
    isLiteralUnion,
    kindOf,
    tidyMembers,
    writtenUnionMembers,
} from '#read/type-printer/members';
import { TYPE_FORMAT_FLAGS, type TypePrinterOptions } from '#read/type-printer/shared';
import { joinTypeMembers } from '#type-text';
import type { Node, Type } from 'ts-morph';

export interface TypePrinter {
    /**
     * Splits a prop type into the members TypeScript prints at the top level. Aliases
     * the docs keep (`ReactNode`, `Ref<T>`) are not opened. `location` is where the
     * type is read, usually the prop's declaration.
     */
    members(type: Type, location: Node): ParsedTypeMember[];
    /**
     * The body behind a type name, as a reader would write it: an object type reads one
     * property per line, a union of objects (Base UI event details, one per `reason`)
     * reads as `(…members) & { …shared }`, anything else reads as its members on one line.
     */
    definition(type: Type, location: Node): string;
}

export function createTypePrinter(options: TypePrinterOptions): TypePrinter {
    /**
     * One type as text. Order matters: the first branch that claims the type wins.
     * Narrow, cheap checks come before the ones that walk the type graph.
     */
    function print(type: Type, location: Node | undefined): string {
        const rawText = location ? type.getText(location, TYPE_FORMAT_FLAGS) : type.getText();

        // `ReactNode` prints by name; a generic alias keeps its arguments, e.g. `React.Ref<HTMLDivElement>`.
        if (isPreservedReactAlias(type)) {
            if (type.getAliasTypeArguments().length > 0) return rawText;
            return type.getAliasSymbol()?.getName() ?? rawText;
        }

        const primitive = primitiveText(type);
        if (primitive !== null) return primitive;

        if (isReactElement(type)) {
            const props = reactElementProps(type);
            return props ? `ReactElement<${print(props, location)}>` : 'ReactElement';
        }

        const [signature] = type.getCallSignatures();
        if (signature) {
            const params = parametersOf(signature).map(({ name, optional, type: paramType }) => {
                if (!paramType) return `${name}: unknown`;
                const paramMembers = members(paramType, location).filter(
                    (member) => !optional || member.kind !== 'undefined',
                );
                return `${name}${optional ? '?' : ''}: ${joinTypeMembers(paramMembers)}`;
            });
            return formatFunction(params, print(signature.getReturnType(), location));
        }

        const vaporName = baseUiName(type, options, rawText);
        if (vaporName) return vaporName;

        // Inside a parameter or a return type, a union splits as it does at the top level.
        // A named union of other types (`padding: Padding`) reads by its name.
        if (type.isUnion()) {
            if (type.getAliasSymbol() && !isLiteralUnion(type)) return rawText;
            return joinTypeMembers(members(type, location));
        }

        const objectLocation = location ?? type.getSymbol()?.getDeclarations()[0];
        if (objectLocation && isAnonymousObject(type)) {
            const lines = properties(type, objectLocation);
            return lines.length > 0 ? `{ ${lines.join(' ')} }` : '{}';
        }

        return rawText;
    }

    function members(type: Type, location: Node | undefined): ParsedTypeMember[] {
        const toMember = (member: Type): ParsedTypeMember => ({
            text: print(member, location),
            kind: kindOf(member),
        });

        // A union with a vapor-ui name (Base UI event details) reads by that name, unsplit.
        if (
            !type.isUnion() ||
            type.isBoolean() ||
            isPreservedReactAlias(type) ||
            findVaporName(type, options)
        ) {
            return [toMember(type)];
        }

        return tidyMembers(writtenUnionMembers(type).map(toMember));
    }

    /** `name?: T;` per property, each read at its own declaration. Optional properties leave out `| undefined`. */
    function properties(type: Type, location: Node): string[] {
        return type.getProperties().map((property) => {
            const declaration = property.getDeclarations()[0] ?? location;
            const optional = property.isOptional();
            const propertyType = property.getTypeAtLocation(declaration);
            const head = `${property.getName()}${optional ? '?' : ''}`;

            // A named union of other types (`padding: Padding`) reads by its name, as it does
            // inside a larger union; splitting it here would spell out what the name hides.
            if (
                propertyType.isUnion() &&
                propertyType.getAliasSymbol() &&
                !isLiteralUnion(propertyType)
            ) {
                return `${head}: ${propertyType.getText(declaration, TYPE_FORMAT_FLAGS)};`;
            }

            const propertyMembers = members(propertyType, declaration).filter(
                (member) => !optional || member.kind !== 'undefined',
            );
            return `${head}: ${joinTypeMembers(propertyMembers)};`;
        });
    }

    function definition(type: Type, location: Node): string {
        if (isObjectLike(type)) return formatObject(properties(type, location));

        const unionMembers = type.isUnion() ? type.getUnionTypes() : [];
        if (unionMembers.length > 0 && unionMembers.every(isObjectLike)) {
            return formatObjectUnion(unionMembers.map((member) => properties(member, location)));
        }

        // ponytail: read without a location, as before the printer existed; passing
        // `location` here would change how TypeScript abbreviates the remaining text.
        return joinTypeMembers(members(type, undefined));
    }

    return { members, definition };
}
