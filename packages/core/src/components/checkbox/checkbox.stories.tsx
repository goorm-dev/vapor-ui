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
                <Flex alignItems="center" gap="$100" render={<label />}>
                    <Checkbox.Root {...args} />
                    Default
                </Flex>
                <br />
                <Text typography="heading3">Controlled</Text>
                <Flex alignItems="center" gap="$100" render={<label />}>
                    <Checkbox.Root
                        {...args}
                        checked={allChecked}
                        indeterminate={indeterminate}
                        onCheckedChange={handleAllCheckedChange}
                    />
                    three meals a day
                </Flex>

                {checkboxItems.map((item) => (
                    <Flex key={item.key} alignItems="center" gap="$100" render={<label />}>
                        <Checkbox.Root
                            {...args}
                            checked={checked[item.key]}
                            onCheckedChange={(checkedState) =>
                                handleCheckedChange(item.key, checkedState)
                            }
                        />

                        {item.label}
                    </Flex>
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
                    <Flex alignItems="center" gap="$100" render={<label />}>
                        Default
                        <Checkbox.Root />
                    </Flex>
                    <Flex alignItems="center" gap="$100" render={<label />}>
                        Default checked
                        <Checkbox.Root checked />
                    </Flex>
                    <Flex alignItems="center" gap="$100" render={<label />}>
                        Default Indeterminate
                        <Checkbox.Root indeterminate />
                    </Flex>
                </Flex>

                <Flex style={{ gap: 'var(--vapor-size-dimension-150)' }}>
                    <Flex alignItems="center" gap="$100" render={<label />}>
                        Disabled
                        <Checkbox.Root disabled />
                    </Flex>
                    <Flex alignItems="center" gap="$100" render={<label />}>
                        Disabled Checked
                        <Checkbox.Root checked disabled />
                    </Flex>
                    <Flex alignItems="center" gap="$100" render={<label />}>
                        Disabled Indeterminate
                        <Checkbox.Root indeterminate disabled />
                    </Flex>
                </Flex>

                <Flex style={{ gap: 'var(--vapor-size-dimension-150)' }}>
                    <Flex alignItems="center" gap="$100" render={<label />}>
                        Invalid
                        <Checkbox.Root invalid />
                    </Flex>
                    <Flex alignItems="center" gap="$100" render={<label />}>
                        Invalid Checked
                        <Checkbox.Root checked invalid />
                    </Flex>
                    <Flex alignItems="center" gap="$100" render={<label />}>
                        Invalid Indeterminate
                        <Checkbox.Root indeterminate invalid />
                    </Flex>
                </Flex>

                <Flex alignItems="center" gap="$100" render={<label />}>
                    MD
                    <Checkbox.Root size="md" />
                </Flex>

                <Flex alignItems="center" gap="$100" render={<label />}>
                    LG
                    <Checkbox.Root size="lg" />
                </Flex>
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
