import figma from 'figma';

const { component } = figma.batch as { component: string };

export default { id: component, example: figma.code`<${component} />` };
