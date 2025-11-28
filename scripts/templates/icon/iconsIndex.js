export default (iconNames) => `
${iconNames.map((iconName) => `export { default as ${iconName} } from './${iconName}';`).join(' ')}
`;
