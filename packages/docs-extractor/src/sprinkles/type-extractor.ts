import type { Project } from 'ts-morph';

import type { Logger } from '../utils/logger';
import { SprinklesConfigParser } from './config-parser';
import { SprinklesTypeIntrospector } from './type-introspector';

/**
 * Extracts accurate type information for sprinkles props
 */
export class SprinklesTypeExtractor {
    private configParser: SprinklesConfigParser;
    private introspector: SprinklesTypeIntrospector;

    // CSS values for free-form properties (fallback when type extraction fails)
    private readonly CSS_VALUES: Record<string, string[]> = {
        position: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
        display: [
            'none',
            'block',
            'inline',
            'inline-block',
            'flex',
            'inline-flex',
            'grid',
            'inline-grid',
            'contents',
        ],
        alignItems: [
            'normal',
            'stretch',
            'center',
            'start',
            'end',
            'flex-start',
            'flex-end',
            'baseline',
        ],
        justifyContent: [
            'normal',
            'flex-start',
            'flex-end',
            'center',
            'space-between',
            'space-around',
            'space-evenly',
            'start',
            'end',
        ],
        flexDirection: ['row', 'row-reverse', 'column', 'column-reverse'],
        alignContent: [
            'normal',
            'flex-start',
            'flex-end',
            'center',
            'space-between',
            'space-around',
            'space-evenly',
            'stretch',
            'baseline',
        ],
        border: ['none', '0'],
        opacity: ['0', '0.25', '0.5', '0.75', '1'],
        pointerEvents: ['auto', 'none', 'all'],
        overflow: ['visible', 'hidden', 'scroll', 'auto'],
        textAlign: ['left', 'center', 'right', 'justify', 'start', 'end'],
    };

    constructor(
        private logger: Logger,
        private project: Project,
        private projectRoot: string,
    ) {
        this.configParser = new SprinklesConfigParser(logger, project, projectRoot);
        this.introspector = new SprinklesTypeIntrospector(logger, project, projectRoot);
    }

    /**
     * Get the type string for a specific property
     */
    getPropertyType(propName: string): string {
        const config = this.configParser.getPropertyConfig(propName);

        switch (config) {
            case 'freeform':
                return this.generateFreeformType(propName);
            case 'token':
                return this.generateTokenType(propName);
            case 'shorthand':
                // Shorthands use the same token type as their base properties
                return this.generateShorthandType(propName);
            default:
                // Fallback to generic type
                return 'string | number | (string & {}) | (number & {}) | undefined';
        }
    }

    /**
     * Wrap a base type with responsive breakpoints
     */
    getResponsiveType(baseType: string): string {
        // Remove undefined from base type for responsive object
        const baseTypeWithoutUndefined = baseType.replace(' | undefined', '');

        return `${baseType} | { mobile?: ${baseTypeWithoutUndefined}; tablet?: ${baseTypeWithoutUndefined}; desktop?: ${baseTypeWithoutUndefined} }`;
    }

    /**
     * Generate type for free-form CSS properties
     */
    private generateFreeformType(propName: string): string {
        // 1순위: Sprinkles 타입에서 추출
        const extractedValues = this.introspector.getCssValuesForProperty(propName);
        if (extractedValues && extractedValues.length > 0) {
            this.logger.debug(
                `Using ${extractedValues.length} extracted CSS values for ${propName}`,
            );
            const unionType = extractedValues.map((v) => `"${v}"`).join(' | ');
            return `${unionType} | (string & {}) | undefined`;
        }

        // 2순위: Hardcoded 값 (fallback)
        const cssValues = this.CSS_VALUES[propName];
        if (cssValues && cssValues.length > 0) {
            this.logger.debug(`Using ${cssValues.length} hardcoded CSS values for ${propName}`);
            const unionType = cssValues.map((v) => `"${v}"`).join(' | ');
            return `${unionType} | (string & {}) | undefined`;
        }

        // 3순위: Generic fallback
        this.logger.debug(`Using generic string type for ${propName}`);
        return 'string | (string & {}) | undefined';
    }

    /**
     * Generate type for token-based properties
     */
    private generateTokenType(propName: string): string {
        const tokenType = this.configParser.getTokenType(propName);

        if (!tokenType) {
            return 'string | number | (string & {}) | (number & {}) | undefined';
        }

        // Extract token values
        let tokenValues: string[] = [];

        if (tokenType === 'spaceTokens') {
            tokenValues = this.configParser.extractTokenKeys('tokens/size/space.ts', 'SPACE');
        } else if (tokenType === 'marginTokens') {
            // Margin tokens include both positive and negative values
            const spaceTokens = this.configParser.extractTokenKeys('tokens/size/space.ts', 'SPACE');
            tokenValues = [...spaceTokens, ...spaceTokens.map((t) => `-${t}`)];
        } else if (tokenType === 'dimensionTokens') {
            tokenValues = this.configParser.extractTokenKeys(
                'tokens/size/dimension.ts',
                'DIMENSION',
            );
        } else if (tokenType === 'radiusTokens') {
            tokenValues = this.configParser.extractTokenKeys(
                'tokens/size/border-radius.ts',
                'BORDER_RADIUS',
            );
        } else if (
            tokenType === 'bgColorTokens' ||
            tokenType === 'colorTokens' ||
            tokenType === 'borderColorTokens'
        ) {
            tokenValues = this.configParser.extractColorTokenKeys(tokenType);
        }

        if (tokenValues.length === 0) {
            return 'string | number | (string & {}) | (number & {}) | undefined';
        }

        const unionType = tokenValues.map((v) => `"${v}"`).join(' | ');
        return `${unionType} | (string & {}) | (number & {}) | undefined`;
    }

    /**
     * Generate type for shorthand properties (paddingX, marginY, etc.)
     */
    private generateShorthandType(propName: string): string {
        // Shorthands typically map to token-based properties
        // paddingX -> padding (spaceTokens)
        // marginX -> margin (marginTokens)

        if (propName.startsWith('padding')) {
            const spaceTokens = this.configParser.extractTokenKeys('tokens/size/space.ts', 'SPACE');
            const unionType = spaceTokens.map((v) => `"${v}"`).join(' | ');
            return `${unionType} | (string & {}) | (number & {}) | undefined`;
        } else if (propName.startsWith('margin')) {
            const spaceTokens = this.configParser.extractTokenKeys('tokens/size/space.ts', 'SPACE');
            const tokenValues = [...spaceTokens, ...spaceTokens.map((t) => `-${t}`)];
            const unionType = tokenValues.map((v) => `"${v}"`).join(' | ');
            return `${unionType} | (string & {}) | (number & {}) | undefined`;
        }

        return 'string | number | (string & {}) | (number & {}) | undefined';
    }
}
