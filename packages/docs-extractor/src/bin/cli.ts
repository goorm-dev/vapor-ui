#!/usr/bin/env node
import { input, select } from '@inquirer/prompts';
import meow from 'meow';
import path from 'path';
import type { InterfaceDeclaration, SourceFile } from 'ts-morph';

import { ComponentScanner } from '../core/component-scanner.js';
import { DocExtractor } from '../core/doc-extractor.js';
import { MergeEngine } from '../core/merge-engine.js';
import { ProjectAnalyzer } from '../core/project-analyzer.js';
import { RecipeDefaultsExtractor } from '../core/recipe-defaults-extractor.js';
import { TypeResolver } from '../core/type-resolver.js';
import { VariantsExtractor } from '../core/variants-extractor.js';
import { JsonRenderer } from '../renderer/json-renderer.js';
import type {
    ComponentDocumentation,
    ComponentExport,
    ExtractorOutput,
    MergedPropertyDoc,
    PropertyDoc,
} from '../types/index.js';
import { Logger } from '../utils/logger.js';

const cli = meow(
    `Usage
    $ npx @vapor-ui/docs-extractor [options]

  Options
    --output, -o <path>         Output directory path (default: ./references)
    --component, -c <name>      Extract specific component (default: all)
    --verbose, -v               Verbose logging
    --cwd <path>                Working directory (default: process.cwd())
    --include-html-props        Include HTML intrinsic props (default: false)
    --include-react-props       Include React special props like ref and key (default: false)
    --style-props <value>       Control sprinkles style props:
                                  - omit flag: hide all (default)
                                  - 'all': show all style props
                                  - 'prop1,prop2,...': show specific props
    --help, -h                  Show help
    --version                   Show version

  Examples
    $ npx @vapor-ui/docs-extractor --output ./api-docs
    $ npx @vapor-ui/docs-extractor --component Button --verbose
    $ npx @vapor-ui/docs-extractor --include-react-props
    $ npx @vapor-ui/docs-extractor --style-props=all
    $ npx @vapor-ui/docs-extractor --style-props=padding,margin,width
`,
    {
        importMeta: import.meta,
        flags: {
            output: {
                type: 'string',
                shortFlag: 'o',
                default: './references',
            },
            component: {
                type: 'string',
                shortFlag: 'c',
            },
            verbose: {
                type: 'boolean',
                shortFlag: 'v',
                default: false,
            },
            cwd: {
                type: 'string',
                default: process.cwd(),
            },
            includeHtmlProps: {
                type: 'boolean',
                default: false,
            },
            includeReactProps: {
                type: 'boolean',
                default: false,
            },
            styleProps: {
                type: 'string',
            },
        },
    },
);

const run = async () => {
    const logger = new Logger(cli.flags.verbose);

    try {
        logger.info('Starting documentation extraction...');

        // Interactive prompts if no flags
        let componentName = cli.flags.component;

        if (!componentName && process.stdin.isTTY) {
            const operation = await select({
                message: 'What would you like to extract?',
                choices: [
                    { name: 'All components', value: 'all' },
                    { name: 'Specific component', value: 'single' },
                ],
            });

            if (operation === 'single') {
                componentName = await input({
                    message: 'Enter component name:',
                    validate: (value) => value.length > 0 || 'Component name required',
                });
            }
        }

        // Initialize core modules
        const corePackagePath = path.join(cli.flags.cwd, 'packages/core');
        const projectAnalyzer = new ProjectAnalyzer(cli.flags.cwd, logger);
        const componentScanner = new ComponentScanner(logger);
        const typeResolver = new TypeResolver(logger, projectAnalyzer.getProject());
        const docExtractor = new DocExtractor(typeResolver, logger);
        const mergeEngine = new MergeEngine(logger);
        const variantsExtractor = new VariantsExtractor(logger);
        const recipeDefaultsExtractor = new RecipeDefaultsExtractor(logger);
        const jsonRenderer = new JsonRenderer(logger);

        // Scan for components
        logger.info('Scanning for components...');
        const components = await componentScanner.scanComponents(corePackagePath, componentName);
        logger.info(`Found ${components.length} components`);

        if (components.length === 0) {
            logger.warn('No components found');
            process.exit(0);
        }

        // Load component files
        const filePaths = components.map((c) => c.filePath);
        projectAnalyzer.loadFiles(filePaths);

        // Extract documentation for each component
        const componentDocs: ComponentDocumentation[] = [];

        for (const component of components) {
            logger.info(`Extracting docs for ${component.name}...`);

            const sourceFile = projectAnalyzer.getSourceFile(component.filePath);
            if (!sourceFile) {
                logger.warn(`Could not load source file for ${component.name}`);
                continue;
            }

            const exports: ComponentExport[] = [];

            // Find all exported variables (component declarations)
            const exportedVars = sourceFile.getVariableDeclarations().filter((decl) => {
                const varStatement = decl.getVariableStatement();
                return varStatement?.isExported();
            });

            // Find all exported namespaces
            const _exportedNamespaces = sourceFile.getModules().filter((mod) => mod.isExported());

            // Extract props from exported variables (components)
            for (const varDecl of exportedVars) {
                const componentName = varDecl.getName();
                logger.debug(`Processing component: ${componentName}`);

                // Find the Props interface in the namespace
                const propsInterface = findPropsInterface(sourceFile, componentName, logger);

                if (propsInterface) {
                    const props = await extractPropsFromInterface(
                        propsInterface,
                        docExtractor,
                        mergeEngine,
                        typeResolver,
                        recipeDefaultsExtractor,
                        projectAnalyzer,
                        logger,
                        corePackagePath,
                    );

                    // Extract variants from .css.ts file if it exists
                    const cssFile = await variantsExtractor.findStyleFile(component.filePath);
                    let variants = null;

                    if (cssFile) {
                        try {
                            const cssSourceFile = projectAnalyzer
                                .getProject()
                                .addSourceFileAtPath(cssFile);
                            variants = variantsExtractor.extractVariants(cssSourceFile);
                        } catch (error) {
                            logger.warn(`Failed to extract variants from ${cssFile}: ${error}`);
                        }
                    }

                    exports.push({
                        type: 'component',
                        name: componentName,
                        displayName: componentName,
                        props,
                        ...(variants && { variants }),
                    });
                }
            }

            componentDocs.push({
                name: component.name,
                exports,
            });
        }

        // Create output
        const output: ExtractorOutput = {
            metadata: {
                version: '2.0.0',
                generatedAt: new Date().toISOString(),
                rootPath: cli.flags.cwd,
                componentCount: componentDocs.length,
            },
            components: componentDocs,
        };

        // Write component files to individual JSON files
        await jsonRenderer.writeComponentFiles(output, cli.flags.output);

        logger.success(`Extracted ${componentDocs.length} components`);
        logger.info(`Output: ${path.resolve(cli.flags.output)}`);
    } catch (error) {
        logger.error('Extraction failed:', error);
        process.exit(1);
    }
};

/**
 * Find the Props interface for a component
 */
function findPropsInterface(
    sourceFile: SourceFile,
    componentName: string,
    logger: Logger,
): InterfaceDeclaration | null {
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
 */
async function extractPropsFromInterface(
    propsInterface: InterfaceDeclaration,
    docExtractor: DocExtractor,
    mergeEngine: MergeEngine,
    typeResolver: TypeResolver,
    recipeDefaultsExtractor: RecipeDefaultsExtractor,
    projectAnalyzer: ProjectAnalyzer,
    logger: Logger,
    corePackagePath: string,
): Promise<MergedPropertyDoc[]> {
    const allProps: PropertyDoc[] = [];

    // Get the type of the interface
    const type = propsInterface.getType();
    const properties = typeResolver.getAllProperties(type);

    logger.debug(`Found ${properties.length} properties (including inherited)`);

    // Extract docs for each property
    for (const prop of properties) {
        const propDoc = docExtractor.extractPropertyDoc(prop);
        allProps.push(propDoc);
    }

    // Separate local and external props
    const localProps = allProps.filter((p) => !p.isExternal);
    const externalProps = allProps.filter((p) => p.isExternal);

    logger.debug(`Local props: ${localProps.length}, External props: ${externalProps.length}`);

    // Merge docs
    let mergedProps = mergeEngine.mergeDocs(localProps, externalProps, cli.flags.includeHtmlProps);

    // Inject synthetic sprinkles props if the interface extends VComponentProps
    // This is done after merging to avoid interference with the merge process
    if (typeResolver.extendsVComponentProps(propsInterface)) {
        logger.debug('Interface extends VComponentProps, injecting sprinkles props');
        const syntheticSprinklesProps = typeResolver.createSyntheticSprinklesProps(corePackagePath);
        mergedProps.push(...syntheticSprinklesProps);
        logger.debug(`Injected ${syntheticSprinklesProps.length} synthetic sprinkles props`);
    }

    // Filter React special props (ref, key) unless --include-react-props is specified
    mergedProps = typeResolver.filterReactSpecialProps(mergedProps, cli.flags.includeReactProps);

    // Filter sprinkles props based on --style-props option
    mergedProps = typeResolver.filterSprinklesProps(
        mergedProps,
        cli.flags.styleProps,
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

run();
