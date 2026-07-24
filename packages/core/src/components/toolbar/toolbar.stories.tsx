import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import {
    AlignCenterOutlineIcon,
    AlignLeftOutlineIcon,
    AlignRightOutlineIcon,
    BoldOutlineIcon,
    ItalicIcon,
    StrikeOutlineIcon,
    UnderlineOutlineIcon,
} from '@vapor-ui/icons';

import { useRenderElement } from '~/hooks/use-render-element';

import { Toolbar } from '.';
import { Card } from '../card';
import { Select } from '../select';
import { Toggle } from '../toggle';
import { ToggleGroup } from '../toggle-group';
import { Tooltip } from '../tooltip';

export default {
    title: 'Toolbar',
    component: Toolbar.Root,
    subcomponents: {
        Button: Toolbar.Button,
        Input: Toolbar.Input,
        Separator: Toolbar.Separator,
    },
} satisfies Meta<typeof Toolbar.Root>;

type Story = StoryObj<typeof Toolbar.Root>;

type SelectItem = {
    value: string;
    label: string;
};

const selectItems: SelectItem[] = [
    { value: 'helvetica', label: 'Helvetica' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Monospace', label: 'Monospace' },
    { value: 'Monserrat', label: 'Monserrat' },
];

export const Default: Story = {
    render: (args) => {
        return (
            <Toolbar.Root {...args}>
                <TooltipButton description={<span>Bold</span>}>
                    <Toolbar.Button render={<Toggle />}>
                        <BoldOutlineIcon />
                    </Toolbar.Button>
                </TooltipButton>
                <TooltipButton description="Italic">
                    <Toolbar.Button render={<Toggle />}>
                        <ItalicIcon />
                    </Toolbar.Button>
                </TooltipButton>
                <TooltipButton description="Strike Through">
                    <Toolbar.Button render={<Toggle />}>
                        <StrikeOutlineIcon />
                    </Toolbar.Button>
                </TooltipButton>
                <TooltipButton description="Underline">
                    <Toolbar.Button render={<Toggle />}>
                        <UnderlineOutlineIcon />
                    </Toolbar.Button>
                </TooltipButton>

                <Toolbar.Separator />

                <ToggleGroup.Root>
                    <TooltipButton description="Align Left">
                        <Toolbar.Button render={<Toggle />}>
                            <AlignLeftOutlineIcon />
                        </Toolbar.Button>
                    </TooltipButton>
                    <TooltipButton description="Align Center">
                        <Toolbar.Button render={<Toggle />}>
                            <AlignCenterOutlineIcon />
                        </Toolbar.Button>
                    </TooltipButton>
                    <TooltipButton description="Align Right">
                        <Toolbar.Button render={<Toggle />}>
                            <AlignRightOutlineIcon />
                        </Toolbar.Button>
                    </TooltipButton>
                </ToggleGroup.Root>

                <Toolbar.Separator />

                <Toolbar.Input placeholder="Input" />

                <AlignSelect
                    trigger={<Toolbar.Button />}
                    items={selectItems}
                    defaultValue="helvetica"
                />

                <Toolbar.Separator />

                <Toolbar.Group>
                    <Toolbar.Button>Button 1</Toolbar.Button>
                    <Toolbar.Button>Button 2</Toolbar.Button>
                    <Toolbar.Button>Button 3</Toolbar.Button>
                </Toolbar.Group>
            </Toolbar.Root>
        );
    },
};

export const WithCard: Story = {
    render: (args, ctx) => {
        return (
            <Card.Root>
                <Card.Header>{Default.render?.(args, ctx)}</Card.Header>
                <Card.Body>Test</Card.Body>
            </Card.Root>
        );
    },
};

/* -----------------------------------------------------------------------------------------------*/

interface TooltipButtonProps {
    description: React.ReactNode;
    children: React.ReactElement;
}

const TooltipButton = ({ description, children, ...props }: TooltipButtonProps) => {
    return (
        <Tooltip.Root {...props}>
            <Tooltip.Trigger render={children} delay={150} />
            <Tooltip.Popup>{description}</Tooltip.Popup>
        </Tooltip.Root>
    );
};

/* -----------------------------------------------------------------------------------------------*/

interface AlignSelectProps {
    trigger: React.ReactElement;
    items: SelectItem[];
    defaultValue: string;
}

const AlignSelect = ({ trigger: triggerProp, items, defaultValue }: AlignSelectProps) => {
    const [font, setFont] = useState(defaultValue);
    const handleFontChange = (value: string | null) => {
        setFont((prev) => value ?? prev);
    };

    const trigger = useRenderElement({
        render: triggerProp,
        props: {
            render: <Select.TriggerPrimitive />,
            children: (
                <>
                    <Select.ValuePrimitive style={{ fontFamily: font }} />
                    <Select.TriggerIconPrimitive />
                </>
            ),
        },
    });

    return (
        <Select.Root items={items} value={font} onValueChange={handleFontChange}>
            {trigger}

            <Select.Popup $css={{ minWidth: 'auto' }}>
                {items.map((item) => (
                    <Select.Item key={item.value} value={item.value}>
                        {item.label}
                    </Select.Item>
                ))}
            </Select.Popup>
        </Select.Root>
    );
};
