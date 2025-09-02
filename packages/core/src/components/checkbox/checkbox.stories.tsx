import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from '.';
import { Flex } from '../flex';
import { Text } from '../text';

export default {
    title: 'Checkbox',
    component: Checkbox.Root,
    argTypes: {
        size: { control: 'inline-radio', options: ['md', 'lg'] },
        disabled: { control: 'boolean' },
        invalid: { control: 'boolean' },
        visuallyHidden: { control: 'boolean' },
    },
} as Meta<typeof Checkbox.Root>;

type Story = StoryObj<typeof Checkbox.Root>;

export const Default: Story = {
    render: (args) => {
        const [checked, setChecked] = useState(evaluateNextCheckedState(false));

        const values = Object.values(checked);
        const allChecked = values.every(Boolean);
        const indeterminate = allChecked ? false : values.some(Boolean);

        const handleAllCheckedChange = (checked: boolean) => {
            const newValue = !!checked;
            const nextChecked = evaluateNextCheckedState(newValue);

            setChecked(nextChecked);
        };

        const handleCheckedChange = (key: string, checked: boolean) => {
            setChecked((prev) => ({ ...prev, [key]: checked }));
        };

        return (
            <Flex style={{ flexDirection: 'column' }}>
                <Text typography="heading3">Uncontrolled</Text>
                <Checkbox.Root {...args}>
                    <Checkbox.Control />
                    Default
                </Checkbox.Root>

                <br />

                <Text typography="heading3">Controlled</Text>
                <Checkbox.Root
                    {...args}
                    checked={allChecked}
                    indeterminate={indeterminate}
                    onCheckedChange={handleAllCheckedChange}
                >
                    <Checkbox.Control />
                    three meals a day
                </Checkbox.Root>

                {checkboxItems.map((item) => (
                    <Checkbox.Root
                        {...args}
                        key={item.key}
                        checked={checked[item.key]}
                        onCheckedChange={(checkedState) =>
                            handleCheckedChange(item.key, checkedState)
                        }
                    >
                        <Checkbox.Control />
                        {item.label}
                    </Checkbox.Root>
                ))}
            </Flex>
        );
    },
};

export const TestBed: Story = {
    render: () => {
        return (
            <Flex style={{ gap: 'var(--vapor-size-dimension-100)', flexDirection: 'column' }}>
                <Flex style={{ gap: 'var(--vapor-size-dimension-150)' }}>
                    <Checkbox.Root>
                        Default
                        <Checkbox.Control />
                    </Checkbox.Root>
                    <Checkbox.Root checked>
                        Default checked
                        <Checkbox.Control />
                    </Checkbox.Root>
                    <Checkbox.Root indeterminate>
                        Default Indeterminate
                        <Checkbox.Control />
                    </Checkbox.Root>
                </Flex>

                <Flex style={{ gap: 'var(--vapor-size-dimension-150)' }}>
                    <Checkbox.Root disabled>
                        Disabled
                        <Checkbox.Control />
                    </Checkbox.Root>
                    <Checkbox.Root checked disabled>
                        Disabled Checked
                        <Checkbox.Control />
                    </Checkbox.Root>
                    <Checkbox.Root indeterminate disabled>
                        Disabled Indeterminate
                        <Checkbox.Control />
                    </Checkbox.Root>
                </Flex>

                <Flex style={{ gap: 'var(--vapor-size-dimension-150)' }}>
                    <Checkbox.Root invalid>
                        Invalid
                        <Checkbox.Control />
                    </Checkbox.Root>
                    <Checkbox.Root checked invalid>
                        Invalid Checked
                        <Checkbox.Control />
                    </Checkbox.Root>
                    <Checkbox.Root indeterminate invalid>
                        Invalid Indeterminate
                        <Checkbox.Control />
                    </Checkbox.Root>
                </Flex>

                <Checkbox.Root size="md">
                    MD
                    <Checkbox.Control />
                </Checkbox.Root>

                <Checkbox.Root size="lg">
                    LG
                    <Checkbox.Control />
                </Checkbox.Root>
            </Flex>
        );
    },
};

/* -----------------------------------------------------------------------------------------------*/

type CheckboxItems = Record<string, boolean>;

const checkboxItems = [
    { key: 'morning', label: 'breakfast' },
    { key: 'lunch', label: 'lunch' },
    { key: 'dinner', label: 'dinner' },
];

const evaluateNextCheckedState = (checked: boolean) => {
    const nextChecked = checkboxItems.reduce((acc, item) => {
        acc[item.key] = checked;
        return acc;
    }, {} as CheckboxItems);

    return nextChecked;
};
