import figma from 'figma';

import { pick } from '../../utils/figma';

const TOOLTIP_PART_ID = {
    root: 'tooltip-root',
    popup: 'tooltip-popup',
} as const;

type TooltipPart = keyof typeof TOOLTIP_PART_ID;

const instance = figma.selectedInstance;
const part: TooltipPart = figma.batch.part;

function render() {
    if (part === 'root') {
        // `side`/`align` sit on the Figma root but on Tooltip.PositionerPrimitive in code, so the
        // root writes the popup itself instead of reusing the popup template. Figma has no trigger.
        const side = pick(instance, 'side', {
            top: 'top',
            bottom: 'bottom',
            left: 'left',
            right: 'right',
        });
        const align = pick(instance, 'align', { start: 'start', center: 'center', end: 'end' });

        return figma.code`<Tooltip.Root>
    <Tooltip.Trigger>{/* trigger */}</Tooltip.Trigger>
    <Tooltip.Popup positionerElement={<Tooltip.PositionerPrimitive side="${side}" align="${align}" />}>{/* contents */}</Tooltip.Popup>
</Tooltip.Root>`;
    }

    return figma.code`<Tooltip.Popup>{/* contents */}</Tooltip.Popup>`;
}

export default {
    example: render(),
    imports: ['import { Tooltip } from "@vapor-ui/core"'],
    id: TOOLTIP_PART_ID[part],
    metadata: { nestable: true },
};
