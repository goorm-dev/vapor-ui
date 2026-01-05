#!/usr/bin/env node
import { input, select } from '@inquirer/prompts';
import meow from 'meow';
import path from 'path';

import {
    ComponentScanner,
    DocExtractor,
    ProjectAnalyzer,
    PropsExtractor,
    RecipeDefaultsExtractor,
    TypeResolver,
    VariantsExtractor,
} from '../extractors';
import { MergeEngine, formatDisplayName } from '../models';
import type { ComponentDocumentation, ComponentExport, ExtractorOutput } from '../models';
import { JsonRenderer } from '../output';
import { Logger } from '../utils/logger';

/**
 * CLI Runner - orchestrates the documentation extraction process
 */
export class CliRunner {
    private logger: Logger;

    constructor(private flags: CliFlags) {
        this.logger = new Logger(flags.verbose);
    }

    /**
     * Run the extraction process
     */
    async run(): Promise<void> {
        try {
            this.logger.info('Starting documentation extraction...');

            // Interactive prompts if no flags
            let componentName = this.flags.component;

            if (!componentName && process.stdin.isTTY) {
                componentName = await this.promptForComponent();
            }

            // Initialize core modules
            const corePackagePath = path.join(this.flags.cwd, 'packages/core');
            const projectAnalyzer = new ProjectAnalyzer(this.flags.cwd, this.logger);
            const componentScanner = new ComponentScanner(this.logger);
            const typeResolver = new TypeResolver(this.logger, projectAnalyzer.getProject());
            const docExtractor = new DocExtractor(typeResolver, this.logger);
            const mergeEngine = new MergeEngine(this.logger);
            const variantsExtractor = new VariantsExtractor(this.logger);
            const recipeDefaultsExtractor = new RecipeDefaultsExtractor(this.logger);
            const jsonRenderer = new JsonRenderer(this.logger);

            // Create props extractor with dependencies
            const propsExtractor = new PropsExtractor(
                {
                    docExtractor,
                    mergeEngine,
                    typeResolver,
                    recipeDefaultsExtractor,
                    projectAnalyzer,
                    logger: this.logger,
                    corePackagePath,
                },
                {
                    includeHtmlProps: this.flags.includeHtmlProps,
                    includeReactProps: this.flags.includeReactProps,
                    styleProps: this.flags.styleProps,
                },
            );

            // Scan for components
            this.logger.info('Scanning for components...');
            const components = await componentScanner.scanComponents(
                corePackagePath,
                componentName,
            );
            this.logger.info(`Found ${components.length} components`);

            if (components.length === 0) {
                this.logger.warn('No components found');
                process.exit(0);
            }

            // Load component files
            const filePaths = components.map((c) => c.filePath);
            projectAnalyzer.loadFiles(filePaths);

            // Extract documentation for each component
            const componentDocs: ComponentDocumentation[] = [];

            for (const component of components) {
                this.logger.info(`Extracting docs for ${component.name}...`);

                const sourceFile = projectAnalyzer.getSourceFile(component.filePath);
                if (!sourceFile) {
                    this.logger.warn(`Could not load source file for ${component.name}`);
                    continue;
                }

                const exports: ComponentExport[] = [];

                // Find all exported variables (component declarations)
                const exportedVars = sourceFile.getVariableDeclarations().filter((decl) => {
                    const varStatement = decl.getVariableStatement();
                    return varStatement?.isExported();
                });

                // Find all exported namespaces
                const _exportedNamespaces = sourceFile
                    .getModules()
                    .filter((mod) => mod.isExported());

                // Extract props from exported variables (components)
                for (const varDecl of exportedVars) {
                    const compName = varDecl.getName();
                    this.logger.debug(`Processing component: ${compName}`);

                    // Extract JSDoc description from the component
                    const varStatement = varDecl.getVariableStatement();
                    const jsDocs = varStatement?.getJsDocs() ?? [];
                    const description =
                        jsDocs.length > 0 ? jsDocs[0].getDescription().trim() : undefined;

                    // Find the Props interface in the namespace
                    const propsInterface = propsExtractor.findPropsInterface(sourceFile, compName);

                    if (propsInterface) {
                        // displayName을 전달하여 State → ComponentName.State 변환에 사용
                        // 복합 컴포넌트는 점 표기법으로 변환 (예: MenuPopup → Menu.Popup)
                        const displayName = formatDisplayName(compName);
                        const props = await propsExtractor.extractPropsFromInterface(
                            propsInterface,
                            displayName,
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

                                // Filter variants to only include those that exist in Props
                                if (variants) {
                                    const propNames = new Set(props.map((p) => p.name));
                                    variants.variants = variants.variants.filter((v) =>
                                        propNames.has(v.name),
                                    );

                                    // If no variants match, set to null
                                    if (variants.variants.length === 0) {
                                        variants = null;
                                    }
                                }
                            } catch (error) {
                                this.logger.warn(
                                    `Failed to extract variants from ${cssFile}: ${error}`,
                                );
                            }
                        }

                        exports.push({
                            type: 'component',
                            name: compName,
                            displayName: displayName,
                            description,
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
                    rootPath: this.flags.cwd,
                    componentCount: componentDocs.length,
                },
                components: componentDocs,
            };

            // Write component files to individual JSON files
            await jsonRenderer.writeComponentFiles(output, this.flags.output);

            this.logger.success(`Extracted ${componentDocs.length} components`);
            this.logger.info(`Output: ${path.resolve(this.flags.output)}`);
        } catch (error) {
            this.logger.error('Extraction failed:', error);
            process.exit(1);
        }
    }

    /**
     * Prompt user for component selection
     */
    private async promptForComponent(): Promise<string | undefined> {
        const operation = await select({
            message: 'What would you like to extract?',
            choices: [
                { name: 'All components', value: 'all' },
                { name: 'Specific component', value: 'single' },
            ],
        });

        if (operation === 'single') {
            return await input({
                message: 'Enter component name:',
                validate: (value) => value.length > 0 || 'Component name required',
            });
        }

        return undefined;
    }
}

/**
 * CLI flags type definition
 */
export interface CliFlags {
    output: string;
    component?: string;
    verbose: boolean;
    cwd: string;
    includeHtmlProps: boolean;
    includeReactProps: boolean;
    styleProps?: string;
}

/**
 * Help text for the CLI
 */
const helpText = `Usage
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
`;

/**
 * CLI options configuration
 */
const cliOptions = {
    importMeta: import.meta,
    flags: {
        output: {
            type: 'string' as const,
            shortFlag: 'o',
            default: './references',
        },
        component: {
            type: 'string' as const,
            shortFlag: 'c',
        },
        verbose: {
            type: 'boolean' as const,
            shortFlag: 'v',
            default: false,
        },
        cwd: {
            type: 'string' as const,
            default: process.cwd(),
        },
        includeHtmlProps: {
            type: 'boolean' as const,
            default: false,
        },
        includeReactProps: {
            type: 'boolean' as const,
            default: false,
        },
        styleProps: {
            type: 'string' as const,
        },
    },
};

function createCli() {
    return meow(helpText, cliOptions);
}

function runCli(): void {
    const cli = createCli();
    const runner = new CliRunner(cli.flags);
    runner.run();
}

runCli();
