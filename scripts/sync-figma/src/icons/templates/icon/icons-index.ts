export default (iconNames: string[]) => `
${iconNames.map((iconName) => `export { default as ${iconName} } from './${iconName}';`).join(' ')}
`;
