// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
    tabWidth: 4,
    semi: true,
    singleQuote: true,
    printWidth: 100,
    importOrder: [
        '^react(.*)',
        '<THIRD_PARTY_MODULES>',
        '^(@vapor-ui[^/]+)(/.*)?$',
        '^App',
        '^_constants',
        '^[~/]',
        '^types',
    ],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
    plugins: ['@trivago/prettier-plugin-sort-imports'],
};

export default config;
