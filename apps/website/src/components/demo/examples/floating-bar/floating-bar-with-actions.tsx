import { Box, Button, FloatingBar } from '@vapor-ui/core';

export default function FloatingBarWithActions() {
    return (
        <FloatingBar.Root>
            <FloatingBar.Trigger render={<Button />}>Open FloatingBar</FloatingBar.Trigger>
            <FloatingBar.Popup>
                <Button colorPalette="primary">Select All</Button>
                <Box
                    $styles={{
                        width: '1px',
                        backgroundColor: '$basic-gray-300',
                        alignSelf: 'stretch',
                    }}
                />
                <Button colorPalette="danger">Delete</Button>
            </FloatingBar.Popup>
        </FloatingBar.Root>
    );
}
