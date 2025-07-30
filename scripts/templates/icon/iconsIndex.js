module.exports = (iconNames) => `
${iconNames
    .map(
        (iconName) => `export { default as ${iconName} } from './${iconName}';`,
    )
    .join(' ')}
`;
