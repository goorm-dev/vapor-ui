// source=src/components/menu/menu.tsx
import figma from 'figma';

import { getProperties, renderInnerInstances } from '../../../utils/figma-utils';

const batch = figma.batch;
const instance = figma.selectedInstance;

function buildRoot() {
    const children = renderInnerInstances(
        instance,
        new Set(['Item', 'Submenu item', 'Item group', 'Check group']),
    );
    return {
        example: figma.code`
        <Menu.Root 
            /* TODO: 트리거 요소를 입력하세요. */ 
            trigger={<Button>...</Button>}
        >
            ${children}
        </Menu.Root>
    `,
        imports: [
            'import { Menu } from "@vapor-ui/composites"',
            'import { Button } from "@vapor-ui/core"',
        ],
    };
}

function buildGroup() {
    const group = getProperties(instance, null, {
        label: { kind: 'string', name: 'label' },
    });
    const children = renderInnerInstances(instance, new Set(['Item']));
    return {
        example: figma.code`
        <Menu.Group ${group.label}>
            ${children}
        </Menu.Group>
    `,
        imports: ['import { Menu } from "@vapor-ui/composites"'],
    };
}

function buildCheckGroup() {
    const group = getProperties(instance, null, {
        mode: {
            kind: 'enum',
            name: 'mode',
            options: { single: 'single', multiple: 'multiple' },
        },
        label: { kind: 'string', name: 'label' },
    });
    const children = renderInnerInstances(instance, new Set(['Check item']));
    return {
        example: figma.code`
        <Menu.CheckGroup ${group.mode} ${group.label}>
            ${children}
        </Menu.CheckGroup>
    `,
        imports: ['import { Menu } from "@vapor-ui/composites"'],
    };
}

function buildItem() {
    const item = getProperties(instance, 'Item', {
        isDisabled: {
            kind: 'enum',
            name: 'isDisabled',
            options: { true: true, false: undefined },
        },
        leading: { kind: 'instance-swap', name: 'leading', visibleWhen: '(has leading)' },
        label: { kind: 'string', name: 'label' },
        description: { kind: 'string', name: 'description', visibleWhen: '(has description)' },
        trailing: { kind: 'prop-slot', name: 'trailing', visibleWhen: '(has trailing)' },
        variant: {
            kind: 'enum',
            name: 'variant',
            options: { default: undefined, danger: 'critical' },
        },
    });
    return {
        example: figma.code`
        <Menu.Item
            ${item.label} ${item.isDisabled} ${item.leading} ${item.description} ${item.trailing} ${item.variant}
            onClick={() => {}}
        />
    `,
        imports: ['import { Menu } from "@vapor-ui/composites"'],
    };
}

function buildCheckItem() {
    const item = getProperties(instance, null, {
        isDisabled: {
            kind: 'enum',
            name: 'isDisabled',
            options: { true: true, false: undefined },
        },
        leading: { kind: 'instance-swap', name: 'leading', visibleWhen: '(has leading)' },
        label: { kind: 'string', name: 'label' },
        description: { kind: 'string', name: 'description', visibleWhen: '(has description)' },
        trailing: { kind: 'prop-slot', name: 'trailing', visibleWhen: '(has trailing)' },
    });
    return {
        example: figma.code`
        <Menu.CheckItem
            value="" // TODO: 아이템을 특정하는 ID를 추가하세요.
            ${item.label} ${item.isDisabled} ${item.leading} ${item.description} ${item.trailing}
        />
    `,
        imports: ['import { Menu } from "@vapor-ui/composites"'],
    };
}

function buildSubmenuItem() {
    const item = getProperties(instance, null, {
        isDisabled: {
            kind: 'enum',
            name: 'isDisabled',
            options: { true: true, false: undefined },
        },
        leading: { kind: 'instance-swap', name: 'leading', visibleWhen: '(has leading)' },
        label: { kind: 'string', name: 'label' },
        description: { kind: 'string', name: 'description', visibleWhen: '(has description)' },
        trailing: { kind: 'prop-slot', name: 'trailing', visibleWhen: '(has trailing)' },
    });
    const children = renderInnerInstances(instance, new Set(['Item', 'Item group', 'Check group']));
    return {
        example: figma.code`
        <Menu.Root trigger={<Menu.SubmenuItem ${item.label} ${item.isDisabled} ${item.leading} ${item.description} ${item.trailing} />}>
            ${children}
        </Menu.Root>
    `,
        imports: ['import { Menu } from "@vapor-ui/composites"'],
    };
}

/* -----------------------------------------------------------------------------------------------*/

function build() {
    switch (batch.part) {
        case 'menu-root':
            return buildRoot();
        case 'menu-group':
            return buildGroup();
        case 'menu-check-group':
            return buildCheckGroup();
        case 'menu-item':
            return buildItem();
        case 'menu-check-item':
            return buildCheckItem();
        case 'menu-submenu-item':
            return buildSubmenuItem();
    }
}

const result = build();

export default {
    id: batch.part,
    imports: result?.imports,
    example: result?.example,
    metadata: { nestable: true },
};
