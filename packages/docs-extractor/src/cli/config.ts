import meow from 'meow';

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
 * CLI instance type
 */
export type CliInstance = ReturnType<typeof createCli>;

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

/**
 * Create and return CLI instance
 */
export function createCli() {
    return meow(helpText, cliOptions);
}
