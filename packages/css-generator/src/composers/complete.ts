import { generateColorCSS } from '../generators/color';
import { generateRadiusCSS } from '../generators/radius';
import { generateScalingCSS } from '../generators/scaling';
import type { CSSGeneratorOptions, CompleteCSSConfig } from '../types';

interface CompleteCSSOptions extends CSSGeneratorOptions {
    includeColorComments?: boolean;
}

const DEFAULT_OPTIONS: Required<CompleteCSSOptions> = {
    classNames: {
        light: 'vapor-light-theme',
        dark: 'vapor-dark-theme',
    },
    prefix: 'vapor',
    format: 'readable',
    includeColorComments: false,
};

const generateThemeComment = (config: CompleteCSSConfig): string => {
    return `/*
 * Vapor UI Theme
 * Generated with @vapor-ui/css-generator
 * 
 * Colors: ${config.colors.primary.name} (#${config.colors.primary.color.replace('#', '')})
 * Scaling: ${config.scaling}
 * Radius: ${config.radius}px
 */

`;
};

export const generateCompleteCSS = (
    config: CompleteCSSConfig,
    options: CompleteCSSOptions = {},
): string => {
    const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };

    // Validate configuration
    if (!config.colors?.primary?.color || !config.colors?.background?.color) {
        throw new Error('Invalid color configuration: primary and background colors are required');
    }

    if (typeof config.scaling !== 'number' || config.scaling <= 0) {
        throw new Error('Invalid scaling configuration: must be a positive number');
    }

    if (typeof config.radius !== 'number' || config.radius < 0) {
        throw new Error('Invalid radius configuration: must be a non-negative number');
    }

    // Generate individual CSS sections
    const colorCSS = generateColorCSS(config.colors, {
        classNames: resolvedOptions.classNames,
        prefix: resolvedOptions.prefix,
        format: resolvedOptions.format,
    });

    const scalingCSS = generateScalingCSS(config.scaling, {
        prefix: resolvedOptions.prefix,
        format: resolvedOptions.format,
    });

    const radiusCSS = generateRadiusCSS(config.radius, {
        prefix: resolvedOptions.prefix,
        format: resolvedOptions.format,
    });

    // Combine CSS sections
    const cssBlocks: string[] = [];

    if (resolvedOptions.includeColorComments) {
        cssBlocks.push(generateThemeComment(config));
    }

    // Since generateColorCSS now returns a single string containing both themes,
    // we need to extract the :root and dark theme parts separately
    const colorCSSParts = extractThemeCSS(colorCSS);

    // Merge root variables (light theme, scaling, and radius)
    const lightThemeWithSystemVars = mergeRootVariables(
        colorCSSParts.lightTheme,
        scalingCSS,
        radiusCSS,
        resolvedOptions.format,
    );

    cssBlocks.push(lightThemeWithSystemVars);
    if (colorCSSParts.darkTheme) {
        cssBlocks.push(colorCSSParts.darkTheme);
    }

    return cssBlocks.join('\n\n');
};

const mergeRootVariables = (
    lightThemeCSS: string,
    scalingCSS: string,
    radiusCSS: string,
    format: 'compact' | 'readable',
): string => {
    // Extract properties from each CSS block
    const lightProperties = extractCSSProperties(lightThemeCSS);
    const scalingProperties = extractCSSProperties(scalingCSS);
    const radiusProperties = extractCSSProperties(radiusCSS);

    // Combine all properties
    const allProperties = [...lightProperties, ...scalingProperties, ...radiusProperties];

    if (format === 'compact') {
        const props = allProperties.join(';');
        return `:root{${props}}`;
    }

    const indentedProperties = allProperties.map((prop) => `    ${prop};`).join('\n');
    return `:root {\n${indentedProperties}\n}`;
};

const extractCSSProperties = (css: string): string[] => {
    // Simple regex to extract CSS custom properties
    const matches = css.match(/--[^:]+:[^;]+/g);
    return matches || [];
};

const extractThemeCSS = (fullCSS: string): { lightTheme: string; darkTheme?: string } => {
    // Split CSS into individual rules
    const rules = fullCSS.split(/\}/).filter((rule) => rule.trim());

    let lightTheme = '';
    let darkTheme = '';

    for (const rule of rules) {
        const trimmedRule = rule.trim() + '}';

        if (trimmedRule.includes(':root') && !trimmedRule.includes('.vapor-dark-theme')) {
            // This is the light theme root rule
            lightTheme = trimmedRule;
        } else if (
            trimmedRule.includes('.vapor-dark-theme') ||
            trimmedRule.includes(':root.vapor-dark-theme')
        ) {
            // This is the dark theme rule
            darkTheme = trimmedRule;
        }
    }

    return {
        lightTheme,
        darkTheme: darkTheme || undefined,
    };
};
