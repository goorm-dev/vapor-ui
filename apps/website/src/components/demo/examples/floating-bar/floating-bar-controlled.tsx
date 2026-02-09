import { useState } from 'react';

import {
    Badge,
    Box,
    Button,
    Checkbox,
    Field,
    FloatingBar,
    IconButton,
    Text,
    VStack,
} from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

const options = [
    { id: 'item1', label: 'First Item', defaultChecked: false },
    { id: 'item2', label: 'Second Item', defaultChecked: false },
    { id: 'item3', label: 'Third Item', defaultChecked: false },
];

export default function FloatingBarControlled() {
    const [selectedItems, setSelectedItems] = useState(() =>
        Object.fromEntries(options.map((option) => [option.id, option.defaultChecked])),
    );

    const selectedCount = Object.values(selectedItems).filter(Boolean).length;
    const [open, setOpen] = useState(selectedCount > 0);

    const handleItemChange = (itemId: string, isChecked: boolean) => {
        setSelectedItems((prev) => {
            const newSelectedItems = { ...prev, [itemId]: isChecked };
            const newSelectedCount = Object.values(newSelectedItems).filter(Boolean).length;
            setOpen(newSelectedCount > 0);

            return newSelectedItems;
        });
    };

    const handleSelectAll = () => {
        setSelectedItems(Object.fromEntries(options.map((option) => [option.id, true])));
        setOpen(true);
    };

    const handleClearAll = () => {
        setSelectedItems(Object.fromEntries(options.map((option) => [option.id, false])));
        setOpen(false);
    };

    return (
        <>
            <Text render={<div />} $styles={{ marginBottom: '$200' }}>
                Select options below to see the FloatingBar.
            </Text>

            <VStack $styles={{ justifyContent: 'center' }}>
                {options.map((option) => (
                    <Field.Root
                        key={option.id}
                        $styles={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '$100',
                        }}
                    >
                        <Checkbox.Root
                            checked={selectedItems[option.id]}
                            onCheckedChange={(checked) => handleItemChange(option.id, checked)}
                        />
                        <Field.Label>{option.label}</Field.Label>
                    </Field.Root>
                ))}
            </VStack>

            <FloatingBar.Root open={open} onOpenChange={setOpen}>
                <FloatingBar.Popup>
                    <Badge colorPalette="primary">{selectedCount} Selected</Badge>

                    <Box
                        $styles={{
                            width: '1px',
                            backgroundColor: '$basic-gray-300',
                            alignSelf: 'stretch',
                        }}
                    />

                    <Button colorPalette="primary" onClick={handleSelectAll}>
                        Select All
                    </Button>
                    <Button colorPalette="danger" onClick={handleClearAll}>
                        Delete
                    </Button>

                    <FloatingBar.Close
                        render={
                            <IconButton
                                aria-label="close floating-bar"
                                variant="ghost"
                                colorPalette="secondary"
                            />
                        }
                    >
                        <CloseOutlineIcon />
                    </FloatingBar.Close>
                </FloatingBar.Popup>
            </FloatingBar.Root>
        </>
    );
}
