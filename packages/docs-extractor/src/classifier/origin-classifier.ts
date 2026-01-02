/**
 * Origin Classifier - main classifier for prop origins
 *
 * Responsible for tracing properties back to their declaration files
 * and classifying them based on their origin.
 */
import type { PropertySignature, Symbol as TsSymbol, Type } from 'ts-morph';

import type { PropSource, PropertyDoc } from '../types';
import type { Logger } from '../utils/logger';
import { SourceDetector } from './source-detector';
import type { ClassificationOptions, ClassificationResult } from './types';

/**
 * Origin Classifier class
 */
export class OriginClassifier {
    private sourceDetector: SourceDetector;

    constructor(
        private logger: Logger,
        options?: ClassificationOptions,
    ) {
        this.sourceDetector = new SourceDetector(options?.customPatterns);
    }

    /**
     * Classify a property based on its type symbol
     */
    classifyProperty(property: PropertySignature): ClassificationResult {
        const symbol = property.getSymbol();

        if (!symbol) {
            return {
                source: 'local',
                originFile: property.getSourceFile().getFilePath(),
            };
        }

        return this.classifySymbol(symbol);
    }

    /**
     * Classify a symbol based on its declaration location
     */
    classifySymbol(symbol: TsSymbol): ClassificationResult {
        const declarations = symbol.getDeclarations();

        if (declarations.length === 0) {
            return {
                source: 'local',
                originFile: 'unknown',
            };
        }

        // Use the first declaration's file path
        const declaration = declarations[0];
        const filePath = declaration.getSourceFile().getFilePath();
        const source = this.sourceDetector.classifyByPath(filePath);

        this.logger.debug(
            `Classified symbol "${symbol.getName()}" as "${source}" from "${filePath}"`,
        );

        return {
            source,
            originFile: filePath,
        };
    }

    /**
     * Classify a type and its properties
     */
    classifyType(type: Type): Map<string, ClassificationResult> {
        const results = new Map<string, ClassificationResult>();
        const properties = type.getProperties();

        for (const property of properties) {
            const name = property.getName();
            const result = this.classifySymbol(property);
            results.set(name, result);
        }

        return results;
    }

    /**
     * Enhance a PropertyDoc with classification information
     */
    enhancePropertyDoc(doc: PropertyDoc, classification: ClassificationResult): PropertyDoc {
        return {
            ...doc,
            sourceFile: classification.originFile,
            isExternal: classification.source !== 'local',
            isHTMLIntrinsic: classification.source === 'native',
            isSprinklesProp: classification.source === 'sprinkles',
        };
    }

    /**
     * Get the source detector for direct path classification
     */
    getSourceDetector(): SourceDetector {
        return this.sourceDetector;
    }

    /**
     * Check if a source should be filtered out (e.g., native HTML props)
     */
    shouldFilter(source: PropSource, options?: { includeNative?: boolean }): boolean {
        if (source === 'native' && !options?.includeNative) {
            return true;
        }
        return false;
    }

    /**
     * Group properties by their source classification
     */
    groupBySource(
        properties: Array<{ name: string; classification: ClassificationResult }>,
    ): Map<PropSource, string[]> {
        const groups = new Map<PropSource, string[]>();

        for (const { name, classification } of properties) {
            const source = classification.source;
            const existing = groups.get(source) || [];
            existing.push(name);
            groups.set(source, existing);
        }

        return groups;
    }
}
