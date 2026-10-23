// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=41669-92378
// source=src/components/spinner/spinner.tsx
// component=Spinner
import figma from 'figma';

import { pick } from '../../utils/figma';

const instance = figma.selectedInstance;

const size = pick(instance, 'size', { md: 'md', lg: 'lg', xl: 'xl' });
const colorPalette = pick(instance, 'colorPalette', { primary: 'primary', inherit: 'inherit' });

export default {
    example: figma.code`<Spinner size="${size}" colorPalette="${colorPalette}" />`,
    imports: ['import { Spinner } from "@vapor-ui/core"'],
    id: 'spinner',
    metadata: { nestable: true },
};
