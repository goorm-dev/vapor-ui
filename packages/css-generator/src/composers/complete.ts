import { generateColorCSS } from '../generators/color';
import { generateRadiusCSS } from '../generators/radius';
import { generateScalingCSS } from '../generators/scaling';
import type { CSSGeneratorOptions, CompleteCSSConfig } from '../types';

interface CompleteCSSOptions extends CSSGeneratorOptions {
    includeColorComments?: boolean;
}

const DEFAULT_OPTIONS: Required<CompleteCSSOptions> = {
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
 * Radius: ${config.radius}
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

    if (typeof config.radius !== 'string') {
        throw new Error('Invalid radius configuration: must be a string');
    }

    // Generate individual CSS sections
    const colorCSS = generateColorCSS(config.colors, {
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
    const lightProperties = extractCSSProperties(lightThemeCSS);
    const scalingProperties = extractCSSProperties(scalingCSS);
    const radiusProperties = extractCSSProperties(radiusCSS);

    const allProperties = [...lightProperties, ...scalingProperties, ...radiusProperties];

    if (format === 'compact') {
        const props = allProperties.join(';');
        return `:root,[data-vapor-theme="light"]{${props}}`;
    }

    const indentedProperties = allProperties.map((prop) => `    ${prop};`).join('\n');
    return `:root, [data-vapor-theme="light"] {\n${indentedProperties}\n}`;
};

const extractCSSProperties = (css: string): string[] => {
    const startBrace = css.indexOf('{');
    const endBrace = css.lastIndexOf('}');

    if (startBrace === -1 || endBrace === -1 || startBrace >= endBrace) {
        return [];
    }

    const content = css.slice(startBrace + 1, endBrace);
    return content
        .split(';')
        .map((prop) => prop.trim())
        .filter((prop) => prop && prop.startsWith('--') && prop.includes(':'));
};

const extractThemeCSS = (fullCSS: string): { lightTheme: string; darkTheme?: string } => {
    const trimmedCSS = fullCSS.trim();

    let lightTheme = '';
    let darkTheme = '';

    const rootMatch = trimmedCSS.match(/:root,\s*\[data-vapor-theme="light"\]\s*\{[^}]*\}/);
    if (rootMatch) {
        lightTheme = rootMatch[0];
    }

    const darkThemeMatch = trimmedCSS.match(/\[data-vapor-theme="dark"\]\s*\{[^}]*\}/);
    if (darkThemeMatch) {
        darkTheme = darkThemeMatch[0];
    }

    return {
        lightTheme,
        darkTheme: darkTheme || undefined,
    };
};
