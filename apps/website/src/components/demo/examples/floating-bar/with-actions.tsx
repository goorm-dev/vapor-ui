import { Box, Button, FloatingBar } from '@vapor-ui/core';

export default function WithActions() {
    return (
        <FloatingBar.Root>
            <FloatingBar.Trigger render={<Button />}>Open FloatingBar</FloatingBar.Trigger>
            <FloatingBar.Popup>
                <Button colorPalette="primary">Select All</Button>
                <Box width="1px" backgroundColor="$gray-300" style={{ alignSelf: 'stretch' }} />
                <Button colorPalette="danger">Delete</Button>
            </FloatingBar.Popup>
        </FloatingBar.Root>
    );
}
