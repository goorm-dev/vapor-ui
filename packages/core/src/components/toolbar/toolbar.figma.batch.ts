import figma from 'figma';
import type { InstanceHandle } from 'figma';

import {
    body,
    bool,
    connectedChildren,
    example,
    flags,
    pick,
    placeholder,
} from '../../utils/figma';
import type { Snippet } from '../../utils/figma';

const TOOLBAR_PART_ID = {
    root: 'toolbar-root',
    button: 'toolbar-button',
    toggleButton: 'toolbar-toggle-button',
    input: 'toolbar-input',
    separator: 'toolbar-separator',
} as const;

type ToolbarPart = keyof typeof TOOLBAR_PART_ID;

const instance = figma.selectedInstance;
const part: ToolbarPart = figma.batch.part;

// The inner Toggle or IconButton is connected, so its own template writes it. Writing it here too would put it in the
// figma-blueprint answer sheet twice.
function toolbarButton(inner: InstanceHandle) {
    const disabled = flags({ disabled: bool(inner, 'disabled') });

    return figma.code`<Toolbar.Button render={${example(inner)}}${disabled} />`;
}

function selectButton(trigger: InstanceHandle) {
    const props = flags({
        invalid: bool(trigger, 'invalid'),
        readOnly: bool(trigger, 'readOnly'),
    });
    const disabled = flags({ disabled: bool(trigger, 'disabled') });
    const slot = trigger.findInstance('🟨Select.Trigger/SlotLayer');
    const hint = slot.type === 'INSTANCE' ? placeholder(slot) : '';

    return figma.code`<Select.Root${hint}${props}>
    <Toolbar.Button render={<Select.TriggerPrimitive />}${disabled}>
        <Select.ValuePrimitive />
        <Select.TriggerIconPrimitive />
    </Toolbar.Button>
    <Select.Popup>{/* contents */}</Select.Popup>
</Select.Root>`;
}

function layer(parent: InstanceHandle, name: string) {
    const found = parent.findInstance(name);
    if (found.type !== 'INSTANCE') throw new Error(`Figma layer "${name}" is missing (Drift).`);
    return found;
}

function toggleGroup(node: InstanceHandle): Snippet {
    const buttons = node.findConnectedInstances(
        (item) => item.codeConnectId() === TOOLBAR_PART_ID.toggleButton,
        { traverseInstances: true },
    );

    return figma.code`<Toolbar.Group render={<ToggleGroup />}>${body(buttons.map(example), '    ')}</Toolbar.Group>`;
}

function render() {
    if (part === 'root') {
        const size = pick(instance, 'size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
        const variant = pick(instance, 'variant', { outline: 'outline', ghost: 'ghost' });
        const disabled = flags({ disabled: bool(instance, 'disabled') });

        const items = instance.children.flatMap((node) => {
            if (node.type !== 'INSTANCE') return [];
            if (node.hasCodeConnect()) return [example(node)];
            if (node.name === 'Toolbar.toggleGroup') return [toggleGroup(node)];
            return connectedChildren(node).map(example);
        });

        return figma.code`<Toolbar.Root size="${size}" variant="${variant}"${disabled}>${body(items)}</Toolbar.Root>`;
    }

    if (part === 'button') {
        const renderLayer = layer(instance, '🟩Toolbar/RenderLayer');
        const type = pick(renderLayer, 'type', {
            toggle: 'toggle',
            select: 'select',
            iconButton: 'iconButton',
        });

        if (type === 'select') return selectButton(layer(renderLayer, '💙Select.Trigger'));
        if (type === 'iconButton') return toolbarButton(layer(renderLayer, '💙IconButton'));
        return toolbarButton(layer(renderLayer, '💙Toggle'));
    }

    if (part === 'toggleButton') {
        return toolbarButton(layer(layer(instance, '🟩Toolbar/Toggle/RenderLayer'), '💙Toggle'));
    }

    if (part === 'input') {
        const textInput = layer(instance, '💙TextInput');
        const hint = placeholder(layer(textInput, '🟨TextInput/SlotLayer'));
        const props = flags({
            disabled: bool(textInput, 'disabled'),
            readOnly: bool(textInput, 'readOnly'),
        });

        const invalid = bool(textInput, 'invalid') ? ' render={<TextInput invalid />}' : '';

        return figma.code`<Toolbar.Input${hint}${props}${invalid} />`;
    }

    return figma.code`<Toolbar.Separator />`;
}

const IMPORTS: Record<ToolbarPart, string> = {
    root: 'import { ToggleGroup, Toolbar } from "@vapor-ui/core"',
    button: 'import { Select, Toolbar } from "@vapor-ui/core"',
    toggleButton: 'import { Toolbar } from "@vapor-ui/core"',
    input: 'import { TextInput, Toolbar } from "@vapor-ui/core"',
    separator: 'import { Toolbar } from "@vapor-ui/core"',
};

export default {
    example: render(),
    imports: [IMPORTS[part]],
    id: TOOLBAR_PART_ID[part],
    metadata: { nestable: true },
};
