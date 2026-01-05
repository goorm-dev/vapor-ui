import path from 'path';
import type { Project, SourceFile } from 'ts-morph';
import { SyntaxKind } from 'ts-morph';

import type { PropertyDoc } from '../types';
import type { Logger } from '../utils/logger';

/**
 * Filters properties based on various criteria (React props, Sprinkles props, etc.)
 */
export class PropsFilter {
    private sprinklesPropsSet: Set<string> | null = null;

    constructor(
        private logger: Logger,
        private project: Project,
    ) {}

    /**
     * Check if a property name is a React special prop (ref, key)
     * These props are specific to React and should be filtered by default
     */
    isReactSpecialProp(propName: string): boolean {
        return propName === 'ref' || propName === 'key';
    }

    /**
     * Filter out React special props from a property list
     * @param props - List of property docs to filter
     * @param includeReactProps - If true, keeps React special props; if false, filters them out
     * @returns Filtered property list
     */
    filterReactSpecialProps<T extends PropertyDoc>(props: T[], includeReactProps: boolean): T[] {
        if (includeReactProps) {
            return props;
        }
        return props.filter((prop) => !this.isReactSpecialProp(prop.name));
    }

    /**
     * Check if a property name is a sprinkles prop
     */
    isSprinklesProp(propName: string, projectRoot: string): boolean {
        const sprinklesSet = this.loadSprinklesPropsSet(projectRoot);
        return sprinklesSet.has(propName);
    }

    /**
     * Filter sprinkles props based on CLI option
     * @param props - List of property docs to filter
     * @param stylePropsOption - CLI option value: undefined | 'all' | 'prop1,prop2,...'
     * @param projectRoot - Root path of the project
     * @returns Filtered property list
     */
    filterSprinklesProps<T extends PropertyDoc>(
        props: T[],
        stylePropsOption: string | undefined,
        projectRoot: string,
    ): T[] {
        // Default: exclude all sprinkles props
        if (stylePropsOption === undefined) {
            return props.filter((prop) => !this.isSprinklesProp(prop.name, projectRoot));
        }

        // Show all sprinkles props
        if (stylePropsOption === 'all') {
            return props;
        }

        // Show specific sprinkles props
        const allowedSprinklesProps = new Set(stylePropsOption.split(',').map((s) => s.trim()));

        // Validate and warn about invalid prop names
        for (const prop of allowedSprinklesProps) {
            if (!this.loadSprinklesPropsSet(projectRoot).has(prop)) {
                this.logger.warn(`Invalid sprinkles prop specified: ${prop}`);
            }
        }

        return props.filter((prop) => {
            const isSprinkles = this.isSprinklesProp(prop.name, projectRoot);

            // Keep non-sprinkles props
            if (!isSprinkles) return true;

            // Keep allowed sprinkles props
            return allowedSprinklesProps.has(prop.name);
        });
    }

    /**
     * Get the set of sprinkles props
     */
    getSprinklesPropsSet(projectRoot: string): Set<string> {
        return this.loadSprinklesPropsSet(projectRoot);
    }

    /**
     * Load the list of sprinkles props from resolve-styles.ts
     * This is cached after the first load for performance
     */
    private loadSprinklesPropsSet(projectRoot: string): Set<string> {
        if (this.sprinklesPropsSet) {
            return this.sprinklesPropsSet;
        }

        const FALLBACK_SPRINKLES_PROPS = [
            'position',
            'display',
            'alignItems',
            'justifyContent',
            'flexDirection',
            'gap',
            'alignContent',
            'padding',
            'paddingTop',
            'paddingBottom',
            'paddingLeft',
            'paddingRight',
            'margin',
            'marginTop',
            'marginBottom',
            'marginLeft',
            'marginRight',
            'width',
            'height',
            'minWidth',
            'minHeight',
            'maxWidth',
            'maxHeight',
            'border',
            'borderColor',
            'borderRadius',
            'backgroundColor',
            'color',
            'opacity',
            'pointerEvents',
            'overflow',
            'textAlign',
            'paddingX',
            'paddingY',
            'marginX',
            'marginY',
        ];

        try {
            const resolveStylesPath = path.join(projectRoot, 'src/utils/resolve-styles.ts');

            this.logger.debug(`Loading sprinkles props from: ${resolveStylesPath}`);

            // Try to load existing source file or add it
            let sourceFile: SourceFile | undefined;
            try {
                sourceFile = this.project.getSourceFile(resolveStylesPath);
                if (!sourceFile) {
                    sourceFile = this.project.addSourceFileAtPath(resolveStylesPath);
                }
            } catch (error) {
                this.logger.warn(`Failed to load resolve-styles.ts: ${error}`);
                this.logger.warn('Using fallback sprinkles props list');
                this.sprinklesPropsSet = new Set(FALLBACK_SPRINKLES_PROPS);
                return this.sprinklesPropsSet;
            }

            // Find the createSplitProps call expression
            const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
            const createSplitPropsCall = callExpressions.find((call) => {
                const expr = call.getExpression();
                return expr.getText().includes('createSplitProps');
            });

            if (!createSplitPropsCall) {
                this.logger.warn('Could not find createSplitProps call in resolve-styles.ts');
                this.logger.warn('Using fallback sprinkles props list');
                this.sprinklesPropsSet = new Set(FALLBACK_SPRINKLES_PROPS);
                return this.sprinklesPropsSet;
            }

            // Get the second argument (the array of props)
            const args = createSplitPropsCall.getArguments();
            if (args.length < 2) {
                this.logger.warn('createSplitProps call does not have enough arguments');
                this.logger.warn('Using fallback sprinkles props list');
                this.sprinklesPropsSet = new Set(FALLBACK_SPRINKLES_PROPS);
                return this.sprinklesPropsSet;
            }

            const arrayArg = args[1];
            if (arrayArg.getKind() !== SyntaxKind.ArrayLiteralExpression) {
                this.logger.warn('Second argument of createSplitProps is not an array');
                this.logger.warn('Using fallback sprinkles props list');
                this.sprinklesPropsSet = new Set(FALLBACK_SPRINKLES_PROPS);
                return this.sprinklesPropsSet;
            }

            // Extract prop names from array
            const propsArray: string[] = [];
            arrayArg.forEachChild((child) => {
                if (child.getKind() === SyntaxKind.StringLiteral) {
                    const text = child.getText().replace(/['"]/g, '');
                    propsArray.push(text);
                }
            });

            this.logger.debug(`Loaded ${propsArray.length} sprinkles props from resolve-styles.ts`);
            this.sprinklesPropsSet = new Set(propsArray);
            return this.sprinklesPropsSet;
        } catch (error) {
            this.logger.warn(`Error loading sprinkles props: ${error}`);
            this.logger.warn('Using fallback sprinkles props list');
            this.sprinklesPropsSet = new Set(FALLBACK_SPRINKLES_PROPS);
            return this.sprinklesPropsSet;
        }
    }
}
