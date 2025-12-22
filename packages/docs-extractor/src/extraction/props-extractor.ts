import type { InterfaceDeclaration, SourceFile } from 'ts-morph';

import type { DocExtractor } from '../core/doc-extractor.js';
import type { MergeEngine } from '../core/merge-engine.js';
import type { ProjectAnalyzer } from '../core/project-analyzer.js';
import type { RecipeDefaultsExtractor } from '../core/recipe-defaults-extractor.js';
import type { TypeResolver } from '../type-resolution/index.js';
import type { MergedPropertyDoc, PropertyDoc } from '../types/index.js';
import type { Logger } from '../utils/logger.js';

/**
 * Options for props extraction
 */
export interface PropsExtractionOptions {
    includeHtmlProps: boolean;
    includeReactProps: boolean;
    styleProps?: string;
}

/**
 * Dependencies for PropsExtractor
 */
export interface PropsExtractorDependencies {
    docExtractor: DocExtractor;
    mergeEngine: MergeEngine;
    typeResolver: TypeResolver;
    recipeDefaultsExtractor: RecipeDefaultsExtractor;
    projectAnalyzer: ProjectAnalyzer;
    logger: Logger;
    corePackagePath: string;
}

/**
 * Handles props extraction from TypeScript interfaces
 */
export class PropsExtractor {
    constructor(
        private deps: PropsExtractorDependencies,
        private options: PropsExtractionOptions,
    ) {}

    /**
     * Find the Props interface for a component
     */
    findPropsInterface(
        sourceFile: SourceFile,
        componentName: string,
    ): InterfaceDeclaration | null {
        const { logger } = this.deps;

        // Look for namespace with component name
        const namespace = sourceFile.getModule(componentName);

        if (namespace) {
            logger.debug(`Found namespace: ${componentName}`);
            const propsInterface = namespace.getInterface('Props');
            if (propsInterface) {
                return propsInterface;
            }
        }

        return null;
    }

    /**
     * Extract props from an interface, including inherited props
     * @param propsInterface - The Props interface declaration to extract from
     * @param componentDisplayName - The component's display name for type formatting (e.g., "Menu.Popup")
     */
    async extractPropsFromInterface(
        propsInterface: InterfaceDeclaration,
        componentDisplayName?: string,
    ): Promise<MergedPropertyDoc[]> {
        const {
            docExtractor,
            mergeEngine,
            typeResolver,
            recipeDefaultsExtractor,
            projectAnalyzer,
            logger,
            corePackagePath,
        } = this.deps;

        const allProps: PropertyDoc[] = [];

        // Get the type of the interface
        const type = propsInterface.getType();
        const properties = typeResolver.getAllProperties(type);

        logger.debug(`Found ${properties.length} properties (including inherited)`);

        // Context for type formatting (State → ComponentName.State 변환에 사용)
        const formatterContext = componentDisplayName ? { componentDisplayName } : undefined;

        // Extract docs for each property (async due to TypeFormatter)
        for (const prop of properties) {
            const propDoc = await docExtractor.extractPropertyDoc(prop, formatterContext);
            allProps.push(propDoc);
        }

        // Separate local and external props
        const localProps = allProps.filter((p) => !p.isExternal);
        const externalProps = allProps.filter((p) => p.isExternal);

        logger.debug(`Local props: ${localProps.length}, External props: ${externalProps.length}`);

        // Merge docs
        let mergedProps = mergeEngine.mergeDocs(
            localProps,
            externalProps,
            this.options.includeHtmlProps,
        );

        // Inject synthetic sprinkles props if the interface extends VComponentProps
        // This is done after merging to avoid interference with the merge process
        if (typeResolver.extendsVComponentProps(propsInterface)) {
            logger.debug('Interface extends VComponentProps, injecting sprinkles props');
            const syntheticSprinklesProps = typeResolver.createSyntheticSprinklesProps(corePackagePath);
            mergedProps.push(...syntheticSprinklesProps);
            logger.debug(`Injected ${syntheticSprinklesProps.length} synthetic sprinkles props`);
        }

        // Filter React special props (ref, key) unless --include-react-props is specified
        mergedProps = typeResolver.filterReactSpecialProps(
            mergedProps,
            this.options.includeReactProps,
        );

        // Filter sprinkles props based on --style-props option
        mergedProps = typeResolver.filterSprinklesProps(
            mergedProps,
            this.options.styleProps,
            corePackagePath,
        );

        // Extract recipe defaults and enrich props
        logger.debug('Extracting recipe defaults for props');
        const recipeDefaults = recipeDefaultsExtractor.extractDefaultsForProps(
            propsInterface,
            projectAnalyzer,
        );

        // Enrich props with recipe defaults (only if prop doesn't already have a defaultValue)
        mergedProps.forEach((prop) => {
            if (!prop.defaultValue && recipeDefaults.has(prop.name)) {
                prop.defaultValue = recipeDefaults.get(prop.name);
                logger.debug(`Set default value for ${prop.name}: ${prop.defaultValue}`);
            }
        });

        return mergedProps;
    }
}
