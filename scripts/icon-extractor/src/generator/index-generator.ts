/**
 * `<IconName>/index.ts` — re-exports the component so the folder is importable.
 */
const iconComponentIndex = (name: string) => `
import ${name} from './${name}';

export default ${name};
`;

/**
 * `<type>-icons/index.ts` — the entry that lists every icon of a type.
 */
const iconsIndex = (iconNames: string[]) => `
${iconNames.map((iconName) => `export { default as ${iconName} } from './${iconName}';`).join(' ')}
`;

export { iconComponentIndex, iconsIndex };
