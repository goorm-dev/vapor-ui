import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ActionBar } from '.';
import { Badge } from '../badge';
import { Box } from '../box';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Field } from '../field';
import { Text } from '../text';

export default {
    title: 'ActionBar',
    component: ActionBar.Root,
} satisfies Meta<typeof ActionBar.Root>;

type Story = StoryObj<typeof ActionBar.Root>;

export const Default: Story = {
    render: (args) => (
        <ActionBar.Root {...args}>
            <ActionBar.Trigger>Open Action Bar</ActionBar.Trigger>
            <ActionBar.Popup>This is the action bar content.</ActionBar.Popup>
        </ActionBar.Root>
    ),
};

export const TestBed: Story = {
    render: (args) => {
        const options = [
            { id: 'item1', label: 'First Item', defaultChecked: false },
            { id: 'item2', label: 'Second Item', defaultChecked: true },
            { id: 'item3', label: 'Third Item', defaultChecked: false },
        ] as const;

        const [selectedItems, setSelectedItems] = useState(() =>
            Object.fromEntries(options.map((option) => [option.id, option.defaultChecked])),
        );

        const selectedCount = Object.values(selectedItems).filter(Boolean).length;
        const hasSelection = selectedCount > 0;

        const handleItemChange = (itemId: string, isChecked: boolean) => {
            setSelectedItems((prev) => ({ ...prev, [itemId]: isChecked }));
        };

        const handleSelectAll = () => {
            setSelectedItems(Object.fromEntries(options.map((option) => [option.id, true])));
        };

        const handleClearAll = () => {
            setSelectedItems(Object.fromEntries(options.map((option) => [option.id, false])));
        };

        return (
            <>
                <Text render={<div />} marginBottom="$200">
                    Select options using the checkboxes below to see the ActionBar in action.
                </Text>

                {options.map((option) => (
                    <Field.Root
                        key={option.id}
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        gap="$100"
                    >
                        <Checkbox.Root
                            checked={selectedItems[option.id]}
                            onCheckedChange={(checked) => handleItemChange(option.id, checked)}
                        />
                        <Field.Label>{option.label}</Field.Label>
                    </Field.Root>
                ))}

                <ActionBar.Root open={hasSelection} {...args} modal={false}>
                    {/* TODO: initialFocus API from @base-ui-components/react@1.0.0-beta.6 */}
                    <ActionBar.Popup autoFocus={false}>
                        <Badge colorPalette="primary">{selectedCount} Selected</Badge>

                        <Box
                            width="1px"
                            backgroundColor="$gray-300"
                            style={{ alignSelf: 'stretch' }}
                        />

                        <Button colorPalette="primary" onClick={handleSelectAll}>
                            Select All
                        </Button>
                        <Button colorPalette="danger" onClick={handleClearAll}>
                            Delete
                        </Button>
                    </ActionBar.Popup>
                </ActionBar.Root>
            </>
        );
    },
};
