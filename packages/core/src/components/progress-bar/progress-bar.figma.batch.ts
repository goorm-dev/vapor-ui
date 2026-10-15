import figma from 'figma';

import { bool, example } from '../../utils/figma';

const PROGRESS_BAR_PART_ID = {
    root: 'progress-bar-root',
    label: 'progress-bar-label',
    track: 'progress-bar-track',
    value: 'progress-bar-value',
    description: 'progress-bar-description',
} as const;

type ProgressBarPart = keyof typeof PROGRESS_BAR_PART_ID;

const instance = figma.selectedInstance;
const part: ProgressBarPart = figma.batch.part;
const { component } = figma.batch;

function child(name: ProgressBarPart) {
    return example(instance.findConnectedInstance(PROGRESS_BAR_PART_ID[name]));
}

function render() {
    if (part === 'root') {
        const size = instance.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg' });
        // Code has no `indeterminate` type; it is `value={null}` with the default type.
        const indeterminate = instance.getEnum('type', { indeterminate: true }) ?? false;
        const type = instance.getEnum('type', {
            default: 'default',
            indeterminate: 'default',
            error: 'error',
        });

        // Figma draws the value with a slot layer, hidden in indeterminate variants.
        const valueSlot = instance.findInstance('🟨ProgressBar.Value/SlotLayer');
        const hasValueSlot = !indeterminate && valueSlot.type === 'INSTANCE';
        const parsed = hasValueSlot ? parseFloat(valueSlot.getString('value')) : NaN;
        const value = indeterminate ? 'null' : Number.isFinite(parsed) ? parsed : 50;

        // `value` is required in code; the label row is a visibility toggle in Figma, not a code prop.
        if (!instance.getBoolean('(has label area)')) {
            return figma.code`<ProgressBar.Root size="${size}" type="${type}" value={${value}} aria-label="...">
    ${child('track')}
    ${child('description')}
</ProgressBar.Root>`;
        }

        // `maxValue` is both a variant (show/hide) and a text property on the slot layer. Code has no
        // max prop on ProgressBar.Value, so it maps to the children function with a placeholder.
        const showMax = hasValueSlot && bool(valueSlot, 'maxValue');
        const progressValue = !hasValueSlot
            ? ''
            : showMax
              ? figma.code`<ProgressBar.Value>{(formattedValue) => \`\${formattedValue} / \${maxValue}\`}</ProgressBar.Value>`
              : child('value') || figma.code`<ProgressBar.Value />`;

        return figma.code`<ProgressBar.Root size="${size}" type="${type}" value={${value}}>
    ${child('label')}
    ${progressValue}
    ${child('track')}
    ${child('description')}
</ProgressBar.Root>`;
    }

    if (part === 'label') {
        return figma.code`<ProgressBar.Label>${instance.getString('label')}</ProgressBar.Label>`;
    }

    if (part === 'description') {
        const slot = instance.findInstance('🟨ProgressBar.Description/SlotLayer');
        const text = slot.type === 'INSTANCE' ? slot.getString('description') : '';
        return figma.code`<ProgressBar.Description>${text}</ProgressBar.Description>`;
    }

    // Track renders its indicator and Value renders the formatted value on their own.
    return figma.code`<${component} />`;
}

export default {
    example: render(),
    imports: ['import { ProgressBar } from "@vapor-ui/core"'],
    id: PROGRESS_BAR_PART_ID[part],
    metadata: { nestable: true },
};
