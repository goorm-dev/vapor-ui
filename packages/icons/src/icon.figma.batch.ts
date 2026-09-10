// Shared Code Connect template for every `@vapor-ui/icons` component.
// Per-icon data (url / component / source) lives in the sibling `*.figma.batch.json`
// files, which `sync-icons` regenerates from Figma on every sync.
import figma from 'figma';

const { component } = figma.batch as { component: string };

export default {
    example: figma.code`<${component} />`,
    imports: [`import { ${component} } from '@vapor-ui/icons';`],
    id: component,
    metadata: { nestable: true },
};
