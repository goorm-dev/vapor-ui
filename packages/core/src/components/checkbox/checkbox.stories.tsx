import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from '.';
import type { CheckedState } from '.';
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

        const allChecked = Object.values(checked).every(Boolean)
            ? true
            : Object.values(checked).some(Boolean)
              ? 'indeterminate'
              : false;

        const handleAllCheckedChange = (checked: CheckedState) => {
            const newValue = !!checked;
            const nextChecked = evaluateNextCheckedState(newValue);

            setChecked(nextChecked);
        };

        const handleCheckedChange = (key: string, checked: CheckedState) => {
            setChecked((prev) => ({ ...prev, [key]: checked }));
        };

        return (
            <Flex flexDirection="column">
                <Text typography="heading3">Uncontrolled</Text>
                <Checkbox.Root {...args}>
                    <Checkbox.Indicator />
                    <Checkbox.Label>Default</Checkbox.Label>
                </Checkbox.Root>

                <br />

                <Text typography="heading3">Controlled</Text>
                <Checkbox.Root
                    checked={allChecked}
                    onCheckedChange={handleAllCheckedChange}
                    {...args}
                >
                    <Checkbox.Indicator />
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
                        <Checkbox.Indicator />
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
            <Flex flexDirection="column" gap="$100">
                <Checkbox.Root>
                    <Checkbox.Label>Default</Checkbox.Label>
                    <Checkbox.Indicator />
                </Checkbox.Root>

                <Checkbox.Root checked>
                    <Checkbox.Label>Default checked</Checkbox.Label>
                    <Checkbox.Indicator />
                </Checkbox.Root>

                <Checkbox.Root disabled>
                    <Checkbox.Label>disabled</Checkbox.Label>
                    <Checkbox.Indicator />
                </Checkbox.Root>

                <Checkbox.Root checked disabled>
                    <Checkbox.Label>checked disabled</Checkbox.Label>
                    <Checkbox.Indicator />
                </Checkbox.Root>

                <Checkbox.Root invalid>
                    <Checkbox.Label>invalid</Checkbox.Label>
                    <Checkbox.Indicator />
                </Checkbox.Root>

                <Checkbox.Root checked invalid>
                    <Checkbox.Label>checked invalid</Checkbox.Label>
                    <Checkbox.Indicator />
                </Checkbox.Root>

                <Checkbox.Root size="md">
                    <Checkbox.Label>MD</Checkbox.Label>
                    <Checkbox.Indicator />
                </Checkbox.Root>

                <Checkbox.Root size="lg">
                    <Checkbox.Label>LG</Checkbox.Label>
                    <Checkbox.Indicator />
                </Checkbox.Root>

                <Checkbox.Root visuallyHidden>
                    <Checkbox.Label>Visually Hidden</Checkbox.Label>
                    <Checkbox.Indicator />
                </Checkbox.Root>
            </Flex>
        );
    },
};

/* -----------------------------------------------------------------------------------------------*/

type CheckboxItems = Record<string, CheckedState>;

const checkboxItems = [
    { key: 'morning', label: '아침' },
    { key: 'lunch', label: '점심' },
    { key: 'dinner', label: '저녁' },
];

const evaluateNextCheckedState = (checked: CheckedState) => {
    const nextChecked = checkboxItems.reduce((acc, item) => {
        acc[item.key] = checked;
        return acc;
    }, {} as CheckboxItems);

    return nextChecked;
};
