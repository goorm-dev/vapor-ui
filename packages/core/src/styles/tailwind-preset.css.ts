import { createGlobalTheme, createGlobalThemeContract } from '@vanilla-extract/css';

import { vars } from './vars.css';

const { background, foreground, border, logo, ...basicVars } = vars.color;
export function generateThemeMapping(tokens: TokenMapping): Record<string, string> {
    const mapping: Record<string, string> = {};

    Object.entries(tokens.colors).forEach(([colorName, shades]) => {
        if (typeof shades === 'object') {
            Object.entries(shades).forEach(([shade, _]) => {
                const cleanShade = shade.replace(/^_/, '');
                mapping[`--color-v-${colorName}-${cleanShade}`] =
                    `var(--vapor-color-${colorName}-${shade})`;
            });
        } else {
            mapping[`--color-v-${colorName}`] = `var(--vapor-color-${colorName})`;
        }
    });

    Object.entries(tokens.spacing).forEach(([scale, _]) => {
        const cleanScale = scale.replace(/^_/, '');
        mapping[`--spacing-v-${cleanScale}`] = `var(--vapor-size-space-${scale})`;
    });

    // Border Radius 매핑
    Object.entries(tokens.radius).forEach(([scale, _]) => {
        const cleanScale = scale.replace(/^_/, '');
        mapping[`--radius-v-${cleanScale}`] = `var(--vapor-size-borderRadius-${scale})`;
    });

    // Typography 매핑
    Object.entries(tokens.fontSize).forEach(([scale, _]) => {
        const cleanScale = scale.replace(/^_/, '');
        mapping[`--text-v-${cleanScale}`] = `var(--vapor-typography-fontSize-${scale})`;
    });

    Object.entries(tokens.fontWeight).forEach(([weight, _]) => {
        const cleanWeight = weight.replace(/^_/, '');
        mapping[`--font-weight-v-${cleanWeight}`] = `var(--vapor-typography-fontWeight-${weight})`;
    });

    Object.entries(tokens.lineHeight).forEach(([scale, _]) => {
        const cleanScale = scale.replace(/^_/, '');
        mapping[`--leading-v-${cleanScale}`] = `var(--vapor-typography-lineHeight-${scale})`;
    });

    Object.entries(tokens.letterSpacing).forEach(([scale, _]) => {
        const cleanScale = scale.replace(/^_/, '');
        mapping[`--tracking-v-${cleanScale}`] = `var(--vapor-typography-letterSpacing-${scale})`;
    });

    Object.entries(tokens.fontFamily).forEach(([name, _]) => {
        mapping[`--font-v-${name}`] = `var(--vapor-typography-fontFamily-${name})`;
    });

    return mapping;
}

/**
 * tailwind namespace에 맞게 토큰 구조 생성
 * @link https://tailwindcss.com/docs/theme#theme-variable-namespaces
 */
const tailwindContract = createGlobalThemeContract(
    {
        color: {
            v: {
                ...basicVars,
            },
        },
        spacing: {
            v: {},
        },
    },
    (value, path) => {
        return `${path.join('-')}`;
    },
);

createGlobalTheme('@theme', tailwindContract, {
    color: {
        v: {
            ...basicVars,
        },
    },
});
