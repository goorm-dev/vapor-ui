import figma from 'figma';

import { example, pick, text, toggle } from '../../utils/figma';

const METER_PART_ID = {
    root: 'meter-root',
    label: 'meter-label',
    track: 'meter-track',
    value: 'meter-value',
} as const;

type MeterPart = keyof typeof METER_PART_ID;

const instance = figma.selectedInstance;
const part: MeterPart = figma.batch.part;
const { component } = figma.batch;

function child(name: MeterPart) {
    return example(instance.findConnectedInstance(METER_PART_ID[name]));
}

function render() {
    if (part === 'root') {
        const size = pick(instance, 'size', { sm: 'sm', md: 'md', lg: 'lg' });
        const type = pick(instance, 'type', { default: 'default', warning: 'warning' });

        const valueSlot = instance.findInstance('🟨Meter.Value/SlotLayer');
        const parsed = valueSlot.type === 'INSTANCE' ? parseFloat(text(valueSlot, 'value')) : NaN;
        const value = Number.isFinite(parsed) ? parsed : 50;

        if (!toggle(instance, '(has label area)')) {
            return figma.code`<Meter.Root size="${size}" type="${type}" value={${value}} aria-label="...">
    ${child('track')}
</Meter.Root>`;
        }

        // Figma draws the value with a slot layer instead of a `💙Meter.Value` instance.
        return figma.code`<Meter.Root size="${size}" type="${type}" value={${value}}>
    ${child('label')}
    ${child('value') || figma.code`<Meter.Value />`}
    ${child('track')}
</Meter.Root>`;
    }

    if (part === 'label') {
        return figma.code`<Meter.Label>${text(instance, 'label')}</Meter.Label>`;
    }

    return figma.code`<${component} />`;
}

export default {
    example: render(),
    imports: ['import { Meter } from "@vapor-ui/core"'],
    id: METER_PART_ID[part],
    metadata: { nestable: true },
};
