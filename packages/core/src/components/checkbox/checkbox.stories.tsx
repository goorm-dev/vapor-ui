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

        const allChecked = Object.values(checked).every(Boolean);
        const indeterminate = Object.values(checked).some(Boolean) && !allChecked;

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
                    <Checkbox.Label>Default</Checkbox.Label>
                </Checkbox.Root>

                <br />

                <Text typography="heading3">Controlled</Text>
                <Checkbox.Root
                    checked={allChecked}
                    indeterminate={indeterminate}
                    onCheckedChange={handleAllCheckedChange}
                    {...args}
                >
                    <Checkbox.Control />
                    <Checkbox.Label>하루 세끼 식사하기</Checkbox.Label>
                </Checkbox.Root>

                {checkboxItems.map((item) => (
                    <Checkbox.Root
                        key={item.key}
                        checked={checked[item.key]}
                        onCheckedChange={(checkedState) =>
                            handleCheckedChange(item.key, checkedState)
                        }
                        {...args}
                    >
                        <Checkbox.Control />
                        <Checkbox.Label>{item.label}</Checkbox.Label>
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
                        <Checkbox.Label>Default</Checkbox.Label>
                        <Checkbox.Control />
                    </Checkbox.Root>
                    <Checkbox.Root checked>
                        <Checkbox.Label>Default checked</Checkbox.Label>
                        <Checkbox.Control />
                    </Checkbox.Root>
                    <Checkbox.Root indeterminate>
                        <Checkbox.Label>Default Indeterminate</Checkbox.Label>
                        <Checkbox.Control />
                    </Checkbox.Root>
                </Flex>

                <Flex style={{ gap: 'var(--vapor-size-dimension-150)' }}>
                    <Checkbox.Root disabled>
                        <Checkbox.Label>Disabled</Checkbox.Label>
                        <Checkbox.Control />
                    </Checkbox.Root>
                    <Checkbox.Root checked disabled>
                        <Checkbox.Label>Disabled Checked</Checkbox.Label>
                        <Checkbox.Control />
                    </Checkbox.Root>
                    <Checkbox.Root indeterminate disabled>
                        <Checkbox.Label>Disabled Indeterminate</Checkbox.Label>
                        <Checkbox.Control />
                    </Checkbox.Root>
                </Flex>

                <Flex style={{ gap: 'var(--vapor-size-dimension-150)' }}>
                    <Checkbox.Root invalid>
                        <Checkbox.Label>Invalid</Checkbox.Label>
                        <Checkbox.Control />
                    </Checkbox.Root>
                    <Checkbox.Root checked invalid>
                        <Checkbox.Label>Invalid Checked</Checkbox.Label>
                        <Checkbox.Control />
                    </Checkbox.Root>
                    <Checkbox.Root indeterminate invalid>
                        <Checkbox.Label>Invalid Indeterminate</Checkbox.Label>
                        <Checkbox.Control />
                    </Checkbox.Root>
                </Flex>

                <Checkbox.Root size="md">
                    <Checkbox.Label>MD</Checkbox.Label>
                    <Checkbox.Control />
                </Checkbox.Root>

                <Checkbox.Root size="lg">
                    <Checkbox.Label>LG</Checkbox.Label>
                    <Checkbox.Control />
                </Checkbox.Root>

                <Checkbox.Root visuallyHidden>
                    <Checkbox.Label>Visually Hidden</Checkbox.Label>
                    <Checkbox.Control />
                </Checkbox.Root>
            </Flex>
        );
    },
};

/* -----------------------------------------------------------------------------------------------*/

type CheckboxItems = Record<string, boolean>;

const checkboxItems = [
    { key: 'morning', label: '아침' },
    { key: 'lunch', label: '점심' },
    { key: 'dinner', label: '저녁' },
];

const evaluateNextCheckedState = (checked: boolean) => {
    const nextChecked = checkboxItems.reduce((acc, item) => {
        acc[item.key] = checked;
        return acc;
    }, {} as CheckboxItems);

    return nextChecked;
};
