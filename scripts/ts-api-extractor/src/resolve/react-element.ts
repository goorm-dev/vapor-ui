import type { Type } from 'ts-morph';

import { extractPropsName } from '~/resolve/shared';

export function isReactElement(type: Type): boolean {
    const symbol = type.getSymbol() || type.getAliasSymbol();
    return symbol?.getName() === 'ReactElement';
}

export function resolveReactElement(type: Type): string {
    const typeArgs = type.getTypeArguments();
    if (typeArgs.length === 0) return 'ReactElement';

    const innerType = typeArgs[0];
    const innerText = innerType.getText();

    if (innerText.includes('ForwardRefExoticComponent')) {
        const propsName = extractPropsName(innerText);
        if (propsName) {
            return `ReactElement<${propsName}>`;
        }
    }

    return 'ReactElement';
}
