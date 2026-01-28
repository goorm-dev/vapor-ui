import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { CloseOutlineIcon, CopyOutlineIcon, TrashOutlineIcon } from '@vapor-ui/icons';

import { FloatingBar } from '.';
import { Badge } from '../badge';
import { Box } from '../box';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Field } from '../field';
import { HStack } from '../h-stack';
import { IconButton } from '../icon-button';
import { Text } from '../text';
import { VStack } from '../v-stack';

export default {
    title: 'FloatingBar',
    component: FloatingBar.Root,
} satisfies Meta<typeof FloatingBar.Root>;

type Story = StoryObj<typeof FloatingBar.Root>;

export const Default: Story = {
    render: (args) => (
        <FloatingBar.Root {...args}>
            <FloatingBar.Trigger>Open Floating Bar</FloatingBar.Trigger>
            <FloatingBar.Popup>This is the floating bar content.</FloatingBar.Popup>
        </FloatingBar.Root>
    ),
};

export const Controlled: Story = {
    render: () => {
        const [tasks, setTasks] = useState([
            { id: '1', name: 'Weekly Status Report', checked: false },
            { id: '2', name: 'Client Invoice Review', checked: false },
            { id: '3', name: 'Product Roadmap', checked: false },
            { id: '4', name: 'Team Standup Notes', checked: false },
        ]);

        const handleCheckedChange = (id: string, checked: boolean) => {
            setTasks((prevTasks) =>
                prevTasks.map((task) => (task.id === id ? { ...task, checked } : task)),
            );
        };

        const onDuplicate = () => {
            const selectedTasks = tasks.filter((task) => task.checked);
            const duplicates = selectedTasks.map((task) => ({
                ...task,
                id: crypto.randomUUID(),
                name: `${task.name} (copy)`,
                checked: false,
            }));
            setTasks([...tasks, ...duplicates]);
        };

        const onDelete = () => {
            setTasks(tasks.filter((task) => !task.checked));
        };

        const onUncheckAll = () => {
            setTasks((prevTasks) => prevTasks.map((task) => ({ ...task, checked: false })));
        };

        return (
            <VStack $styles={{ width: '100%', gap: '$100' }}>
                (Select tasks to see the FloatingBar in action)
                <Text typography="heading5">Tasks</Text>
                <VStack $styles={{ gap: '$050' }}>
                    {tasks.map((task) => (
                        <Field.Root
                            key={task.id}
                            $styles={{ gap: '$100', flexDirection: 'row', alignItems: 'center' }}
                        >
                            <Checkbox.Root
                                checked={task.checked}
                                onCheckedChange={(checked) => {
                                    handleCheckedChange(task.id, checked);
                                }}
                            />
                            <Field.Label>{task.name}</Field.Label>
                        </Field.Root>
                    ))}
                </VStack>
                <FloatingBar.Root open={tasks.some((task) => task.checked)}>
                    <FloatingBar.Popup>
                        <HStack
                            $styles={{
                                border: '1px dashed',
                                borderColor: '$normal',
                                paddingBlock: '$050',
                                paddingLeft: '$150',
                                paddingRight: '$100',
                                borderRadius: '$200',
                                alignItems: 'center',
                                gap: '$050',
                            }}
                        >
                            <Text style={{ whiteSpace: 'nowrap' }}>
                                {tasks.filter((task) => task.checked).length} selected
                            </Text>

                            <FloatingBar.Close
                                onClick={onUncheckAll}
                                render={
                                    <IconButton
                                        size="sm"
                                        aria-label="Remove selected tasks"
                                        colorPalette="secondary"
                                        variant="ghost"
                                    />
                                }
                            >
                                <CloseOutlineIcon />
                            </FloatingBar.Close>
                        </HStack>

                        <HStack $styles={{ gap: '$150' }}>
                            <FloatingBar.Close
                                render={<Button colorPalette="secondary" variant="outline" />}
                                onClick={onDuplicate}
                            >
                                <CopyOutlineIcon />
                                Duplicate
                            </FloatingBar.Close>

                            <FloatingBar.Close
                                render={<Button colorPalette="danger" />}
                                onClick={onDelete}
                            >
                                <TrashOutlineIcon />
                                Delete
                            </FloatingBar.Close>
                        </HStack>
                    </FloatingBar.Popup>
                </FloatingBar.Root>
            </VStack>
        );
    },
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
                <Text render={<div />} $styles={{ marginBottom: '$200' }}>
                    Select options using the checkboxes below to see the FloatingBar in action.
                </Text>

                {options.map((option) => (
                    <Field.Root
                        key={option.id}
                        $styles={{ gap: '$100', flexDirection: 'row', alignItems: 'center' }}
                    >
                        <Checkbox.Root
                            checked={selectedItems[option.id]}
                            onCheckedChange={(checked) => handleItemChange(option.id, checked)}
                        />
                        <Field.Label>{option.label}</Field.Label>
                    </Field.Root>
                ))}

                <FloatingBar.Root open={hasSelection} {...args} modal={false}>
                    {/* TODO: initialFocus API from @base-ui-components/react@1.0.0-beta.6 */}
                    <FloatingBar.Popup autoFocus={false}>
                        <Badge colorPalette="primary">{selectedCount} Selected</Badge>

                        <Box
                            $styles={{
                                width: '1px',
                                backgroundColor: '$gray-300',
                                alignSelf: 'stretch',
                            }}
                        />

                        <Button colorPalette="primary" onClick={handleSelectAll}>
                            Select All
                        </Button>
                        <Button colorPalette="danger" onClick={handleClearAll}>
                            Delete
                        </Button>
                    </FloatingBar.Popup>
                </FloatingBar.Root>
            </>
        );
    },
};
