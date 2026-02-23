import meow from 'meow';

export const cli = meow(
    `
  Usage
    $ ts-api-extractor <path>

  Options
    --component, -n   Component name to process (default: all components)
    --all, -a         Include all props (node_modules + sprinkles + html)
    --verbose, -v     Enable verbose output

  Examples
    $ ts-api-extractor ./packages/core
    $ ts-api-extractor ./packages/core --component Tabs
    $ ts-api-extractor ./packages/core -n Button -a
`,
    {
        importMeta: import.meta,
        flags: {
            component: {
                type: 'string',
                shortFlag: 'n',
            },
            all: {
                type: 'boolean',
                shortFlag: 'a',
                default: false,
            },
            verbose: {
                type: 'boolean',
                shortFlag: 'v',
                default: false,
            },
        },
    },
);
