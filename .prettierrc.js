/** @type {import("prettier").Config} */
module.exports = {
    tabWidth: 4,
    semi: true,
    singleQuote: true,
    printWidth: 100,

    plugins: ['@trivago/prettier-plugin-sort-imports'],
    importOrder: ['<BUILTIN_MODULES>', '^react(.*)', '<THIRD_PARTY_MODULES>', '^[~/]', '^[./]'],
    importOrderSideEffects: false, // TODO: Fix the side-effect import order issue and remove this option.
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
};
