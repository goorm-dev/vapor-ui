import figma from 'figma';

import { bool, example, flags } from '../../utils/figma';

const PAGINATION_PART_ID = {
    root: 'pagination-root',
    items: 'pagination-items',
    previous: 'pagination-previous',
    next: 'pagination-next',
} as const;

type PaginationPart = keyof typeof PAGINATION_PART_ID;

const instance = figma.selectedInstance;
const part: PaginationPart = figma.batch.part;
const { component } = figma.batch;

function child(name: PaginationPart) {
    return example(instance.findConnectedInstance(PAGINATION_PART_ID[name]));
}

function render() {
    if (part === 'root') {
        const size = instance.getEnum('size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' });
        const disabled = bool(instance, 'disabled');

        return figma.code`<Pagination.Root totalPages={10} size="${size}"${flags({ disabled })}>
    ${child('previous')}
    ${child('items')}
    ${child('next')}
</Pagination.Root>`;
    }

    if (part === 'items') {
        // Page buttons are generated from Root's page state, so Figma's per-item layers aren't mapped.
        return figma.code`<Pagination.Items />`;
    }

    // Previous/Next render their default chevron icon when empty.
    const disabled = bool(instance, 'disabled');
    return figma.code`<${component}${flags({ disabled })} />`;
}

export default {
    example: render(),
    imports: ['import { Pagination } from "@vapor-ui/core"'],
    id: PAGINATION_PART_ID[part],
    metadata: { nestable: true },
};
