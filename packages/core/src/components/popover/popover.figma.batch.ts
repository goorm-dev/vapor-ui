import figma from 'figma';

const POPOVER_PART_ID = {
    root: 'popover-root',
    popup: 'popover-popup',
} as const;

type PopoverPart = keyof typeof POPOVER_PART_ID;

const instance = figma.selectedInstance;
const part: PopoverPart = figma.batch.part;

function render() {
    if (part === 'root') {
        // `side`/`align` sit on the Figma root but on Popover.PositionerPrimitive in code, so the
        // root writes the popup itself instead of reusing the popup template. Figma has no trigger,
        // and its `Popover.Arrow` has no code part.
        const side = instance.getEnum('side', {
            top: 'top',
            bottom: 'bottom',
            left: 'left',
            right: 'right',
        });
        const align = instance.getEnum('align', { start: 'start', center: 'center', end: 'end' });

        return figma.code`<Popover.Root>
    <Popover.Trigger>{/* trigger */}</Popover.Trigger>
    <Popover.Popup positionerElement={<Popover.PositionerPrimitive side="${side}" align="${align}" />}>{/* contents */}</Popover.Popup>
</Popover.Root>`;
    }

    return figma.code`<Popover.Popup>{/* contents */}</Popover.Popup>`;
}

export default {
    example: render(),
    imports: ['import { Popover } from "@vapor-ui/core"'],
    id: POPOVER_PART_ID[part],
    metadata: { nestable: true },
};
