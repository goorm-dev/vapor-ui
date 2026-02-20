import meow from 'meow';

export const cli = meow(
    `
  Usage
    $ ts-api-extractor [path]

  Options
    --tsconfig, -c         Path to tsconfig.json (default: auto-detect)
    --exclude, -e          Additional exclude patterns (added to defaults)
    --no-exclude-defaults  Disable default exclude patterns (.stories.tsx, .css.ts)
    --component, -n        Component name to process (e.g., Button, TextInput)
    --output-dir, -d       Output directory for per-component files
    --all, -a              Include all props (node_modules + sprinkles + html)
    --include              Include specific props (can be used multiple times)
    --include-html         Include specific HTML attributes (e.g., --include-html className style)
    --config               Config file path (default: docs-extractor.config.ts)
    --no-config            Ignore config file
    --lang, -l             Output language (ko, en, all)
    --verbose, -v          Enable verbose output

  Examples
    $ ts-api-extractor ./packages/core
    $ ts-api-extractor ./packages/core --component Tabs
    $ ts-api-extractor ./packages/core --component Tabs --output-dir ./output
    $ ts-api-extractor ./packages/core --lang en
    $ ts-api-extractor ./packages/core --lang all
    $ ts-api-extractor  # Interactive mode: prompts for path and components
`,
    {
        importMeta: import.meta,
        flags: {
            tsconfig: {
                type: 'string',
                shortFlag: 'c',
            },
            exclude: {
                type: 'string',
                shortFlag: 'e',
                isMultiple: true,
            },
            excludeDefaults: {
                type: 'boolean',
                default: true,
            },
            component: {
                type: 'string',
                shortFlag: 'n',
            },
            outputDir: {
                type: 'string',
                shortFlag: 'd',
            },
            all: {
                type: 'boolean',
                shortFlag: 'a',
                default: false,
            },
            include: {
                type: 'string',
                isMultiple: true,
            },
            includeHtml: {
                type: 'string',
                isMultiple: true,
            },
            config: {
                type: 'string',
            },
            noConfig: {
                type: 'boolean',
                default: false,
            },
            lang: {
                type: 'string',
                shortFlag: 'l',
            },
            verbose: {
                type: 'boolean',
                shortFlag: 'v',
                default: false,
            },
        },
    },
);
