export interface CSSProperty {
    property: string;
    value: string;
}

export interface CSSRule {
    selector: string;
    properties: CSSProperty[];
}

export const formatCSS = (rules: CSSRule[], format: 'compact' | 'readable' = 'readable'): string => {
    if (format === 'compact') {
        return rules
            .map(rule => {
                const props = rule.properties
                    .map(prop => `${prop.property}:${prop.value}`)
                    .join(';');
                return `${rule.selector}{${props}}`;
            })
            .join('');
    }

    return rules
        .map(rule => {
            const properties = rule.properties
                .map(prop => `    ${prop.property}: ${prop.value};`)
                .join('\n');
            return `${rule.selector} {\n${properties}\n}`;
        })
        .join('\n\n');
};

export const createCSSVariable = (name: string, value: string): CSSProperty => ({
    property: `--${name}`,
    value,
});

export const createCSSVariableReference = (name: string): string => `var(--${name})`;