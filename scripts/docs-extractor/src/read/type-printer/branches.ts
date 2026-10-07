/**
 * The checks behind each branch of the printer. None of them prints a nested type;
 * the printer does that, so recursion stays in one place.
 */
import { isObjectLike } from '#read/type-printer/definition';
import { type Type, ts } from 'ts-morph';

const PRESERVED_REACT_ALIASES = new Set([
    'ReactNode',
    'ReactElement',
    'ReactChild',
    'ReactFragment',
    'Ref',
]);

export function isPreservedReactAlias(type: Type): boolean {
    const aliasSymbol = type.getAliasSymbol();
    return Boolean(aliasSymbol && PRESERVED_REACT_ALIASES.has(aliasSymbol.getName()));
}

export function primitiveText(type: Type): string | null {
    if (type.isBooleanLiteral()) return type.getText();
    if (type.isLiteral()) {
        const value = type.getLiteralValue();
        return typeof value === 'string' ? `"${value}"` : String(value);
    }
    if (type.isUndefined()) return 'undefined';
    if (type.isNull()) return 'null';
    if (type.isBoolean()) return 'boolean';
    if (type.isString()) return 'string';
    if (type.isNumber()) return 'number';
    return null;
}

export function isReactElement(type: Type): boolean {
    const symbol = type.getSymbol() || type.getAliasSymbol();
    return symbol?.getName() === 'ReactElement';
}

/**
 * `ReactElement<Menu.Portal.Props, string | JSXElementConstructor<any>>` reads
 * `ReactElement<Menu.Portal.Props>`: only the props argument says anything, and
 * an `unknown` one is dropped too.
 */
export function reactElementProps(type: Type): Type | undefined {
    const [props] = type.getTypeArguments();
    return !props || props.isUnknown() || props.isAny() ? undefined : props;
}

/**
 * An object with no name, such as the `data` Base UI writes into `sideOffset`, is
 * printed property by property on one line, so named unions of values inside are
 * expanded as at the top level. TypeScript's own text would keep them by name.
 */
export function isAnonymousObject(type: Type): boolean {
    return (
        isObjectLike(type) &&
        !type.getAliasSymbol() &&
        type.getSymbol()?.getName() === ts.InternalSymbolName.Type
    );
}
