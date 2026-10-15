import figma from 'figma';

import { bool, example, flags, lines } from '../../utils/figma';

const BREADCRUMB_PART_ID = {
    root: 'breadcrumb-root',
    item: 'breadcrumb-item',
    separator: 'breadcrumb-separator',
    ellipsis: 'breadcrumb-ellipsis',
} as const;

type BreadcrumbPart = keyof typeof BREADCRUMB_PART_ID;

const instance = figma.selectedInstance;
const part: BreadcrumbPart = figma.batch.part;
const { component } = figma.batch;

const CHILD_IDS: string[] = [
    BREADCRUMB_PART_ID.item,
    BREADCRUMB_PART_ID.separator,
    BREADCRUMB_PART_ID.ellipsis,
];

function render() {
    if (part === 'root') {
        const size = instance.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
        const children = lines(
            instance
                .findConnectedInstances((node) => CHILD_IDS.includes(node.codeConnectId() ?? ''))
                .map(example),
        );

        return figma.code`<Breadcrumb.Root size="${size}">${children}
</Breadcrumb.Root>`;
    }

    if (part === 'item') {
        const current = bool(instance, 'current');
        // Figma keeps the label in a different TEXT property per state.
        const text = instance.getString(current ? 'page name' : 'Text');

        return figma.code`<Breadcrumb.Item${flags({ current })}>${text}</Breadcrumb.Item>`;
    }

    // Separator/Ellipsis render their default icon when empty.
    return figma.code`<${component} />`;
}

export default {
    example: render(),
    imports: ['import { Breadcrumb } from "@vapor-ui/core"'],
    id: BREADCRUMB_PART_ID[part],
    metadata: { nestable: true },
};
