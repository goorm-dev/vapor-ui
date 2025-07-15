/** @type {import("prettier").Config} */
module.exports = {
    tabWidth: 4,
    semi: true,
    singleQuote: true,
    printWidth: 100,

    plugins: ['@trivago/prettier-plugin-sort-imports'],
    importOrder: ['global.css', '^react(.*)', '<THIRD_PARTY_MODULES>', '^[~/]', '^[./]'],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
};
