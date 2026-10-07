import { isDeclaredInBaseUi, resolveBaseUiType } from '#read/type-printer/base-ui-mapper';
import type { BaseUiTypeMap, TypePrinterOptions } from '#read/type-printer/shared';
import { Node, type Type } from 'ts-morph';

function resolveMappedBaseUiType(type: Type, baseUiMap: BaseUiTypeMap): string | null {
    const directPath = resolveBaseUiType(type, baseUiMap);
    if (directPath) return directPath;

    for (const symbol of [type.getSymbol(), type.getAliasSymbol()]) {
        if (!symbol) continue;

        const symbolName = symbol.getName();
        if (baseUiMap[symbolName]) {
            return baseUiMap[symbolName].vaporPath;
        }
    }

    return null;
}

/**
 * Several vapor-ui namespaces can alias one Base UI type (e.g. Collapsible Root and
 * Trigger sharing a State), and a name-keyed map keeps only one of them. Matching the
 * type object itself lets the prop's own namespace win. It also covers Base UI event
 * details, which TypeScript evaluates into anonymous objects with no name to look up.
 */
function resolveByIdentity(
    type: Type,
    { baseUiMap, namespace }: TypePrinterOptions,
): string | null {
    const matches = Object.values(baseUiMap).filter(
        (entry) => entry.type.compilerType === type.compilerType,
    );
    if (matches.length === 0) return null;

    return (matches.find((entry) => entry.namespace === namespace) ?? matches[0]).vaporPath;
}

/**
 * Only types a component documents by name are worth a warning: Base UI's anonymous
 * event details and per-part `State`s. Shared helpers like `BaseUIEvent` or `HTMLProps`
 * have no vapor-ui alias by design and print under their own name. An object Base UI
 * writes straight into a parameter or a property (`(data: { anchor: { width } }) => …`)
 * has no name in Base UI either, so there is nothing to re-export.
 */
function shouldHaveVaporName(type: Type): boolean {
    const symbol = type.getAliasSymbol() ?? type.getSymbol();
    const name = symbol?.getName();
    if (name === '__type') {
        return !symbol!.getDeclarations().every((decl) => {
            const parent = decl.getParent();
            return Node.isParameterDeclaration(parent) || Node.isPropertySignature(parent);
        });
    }
    return !!name?.endsWith('State');
}

/** The public vapor-ui name of a Base UI type, or null. */
export function findVaporName(type: Type, options: TypePrinterOptions): string | null {
    return resolveByIdentity(type, options) ?? resolveMappedBaseUiType(type, options.baseUiMap);
}

/** `findVaporName`, warning when a type the docs name has none. `rawText` is what prints instead. */
export function baseUiName(
    type: Type,
    options: TypePrinterOptions,
    rawText: string,
): string | null {
    const resolved = findVaporName(type, options);
    if (!resolved && isDeclaredInBaseUi(type) && shouldHaveVaporName(type)) {
        options.reporter.warn(
            `No public vapor-ui name for a Base UI type in ${options.namespace}; printing ${rawText}. Re-export it from the component namespace to print it by name.`,
        );
    }

    return resolved;
}
