import figma from 'figma';

import { example, pick, text, toggle } from '../../utils/figma';

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
        const size = pick(instance, 'size', { sm: 'sm', md: 'md', lg: 'lg' });
        const figmaType = pick(instance, 'type', {
            default: 'default',
            indeterminate: 'indeterminate',
            error: 'error',
        });
        const indeterminate = figmaType === 'indeterminate';
        const type = indeterminate ? 'default' : figmaType;

        // Figma draws the value with a slot layer, hidden in indeterminate variants.
        const valueSlot = instance.findInstance('🟨ProgressBar.Value/SlotLayer');
        const hasValueSlot = !indeterminate && valueSlot.type === 'INSTANCE';
        const parsed = hasValueSlot ? parseFloat(text(valueSlot, 'value')) : NaN;
        const value = indeterminate ? 'null' : Number.isFinite(parsed) ? parsed : 50;

        if (!toggle(instance, '(has label area)')) {
            return figma.code`<ProgressBar.Root size="${size}" type="${type}" value={${value}} aria-label="...">
    ${child('track')}
    ${child('description')}
</ProgressBar.Root>`;
        }

        const progressValue = hasValueSlot
            ? child('value') || figma.code`<ProgressBar.Value />`
            : '';

        return figma.code`<ProgressBar.Root size="${size}" type="${type}" value={${value}}>
    ${child('label')}
    ${progressValue}
    ${child('track')}
    ${child('description')}
</ProgressBar.Root>`;
    }

    if (part === 'label') {
        return figma.code`<ProgressBar.Label>${text(instance, 'label')}</ProgressBar.Label>`;
    }

    if (part === 'description') {
        const slot = instance.findInstance('🟨ProgressBar.Description/SlotLayer');
        const description = slot.type === 'INSTANCE' ? text(slot, 'description') : '';
        return figma.code`<ProgressBar.Description>${description}</ProgressBar.Description>`;
    }

    return figma.code`<${component} />`;
}

export default {
    example: render(),
    imports: ['import { ProgressBar } from "@vapor-ui/core"'],
    id: PROGRESS_BAR_PART_ID[part],
    metadata: { nestable: true },
};
