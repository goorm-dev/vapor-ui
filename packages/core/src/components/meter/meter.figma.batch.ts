import figma from 'figma';

import { example } from '../../utils/figma';

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
        const size = instance.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg' });
        const type = instance.getEnum('type', { default: 'default', warning: 'warning' });

        // `value` is required in code; read it from the displayed value text when it is numeric,
        // otherwise fall back to a sample value.
        const valueSlot = instance.findInstance('🟨Meter.Value/SlotLayer');
        const parsed =
            valueSlot.type === 'INSTANCE' ? parseFloat(valueSlot.getString('value')) : NaN;
        const value = Number.isFinite(parsed) ? parsed : 50;

        // The label row is a visibility toggle in Figma, not a code prop.
        if (!instance.getBoolean('(has label area)')) {
            return figma.code`<Meter.Root size="${size}" type="${type}" value={${value}} aria-label="...">
    ${child('track')}
</Meter.Root>`;
        }

        // Figma draws the value with a slot layer instead of a `💙Meter.Value` instance.
        // Code has no max prop on Meter.Value, so the "Value / Max" toggle maps to its children function.
        // `maxValue` is both a variant (show/hide) and a text property (the max) on the slot layer.
        const showMax =
            valueSlot.type === 'INSTANCE' &&
            valueSlot.getEnum('maxValue', { true: true, false: false });
        // `maxValue` is left as a placeholder for the consumer to fill in.
        const meterValue = showMax
            ? figma.code`<Meter.Value>{(formattedValue) => \`\${formattedValue} / \${maxValue}\`}</Meter.Value>`
            : child('value') || figma.code`<Meter.Value />`;

        return figma.code`<Meter.Root size="${size}" type="${type}" value={${value}}>
    ${child('label')}
    ${meterValue}
    ${child('track')}
</Meter.Root>`;
    }

    if (part === 'label') {
        return figma.code`<Meter.Label>${instance.getString('label')}</Meter.Label>`;
    }

    // Track renders its indicator and Value renders the formatted value on their own.
    return figma.code`<${component} />`;
}

export default {
    example: render(),
    imports: ['import { Meter } from "@vapor-ui/core"'],
    id: METER_PART_ID[part],
    metadata: { nestable: true },
};
