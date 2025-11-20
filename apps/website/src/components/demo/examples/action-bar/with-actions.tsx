import { ActionBar, Box, Button } from '@vapor-ui/core';

export default function WithActions() {
    return (
        <ActionBar.Root>
            <ActionBar.Trigger render={<Button />}>Open ActionBar</ActionBar.Trigger>
            <ActionBar.Popup>
                <Button colorPalette="primary">Select All</Button>
                <Box width="1px" backgroundColor="$gray-300" style={{ alignSelf: 'stretch' }} />
                <Button colorPalette="danger">Delete</Button>
            </ActionBar.Popup>
        </ActionBar.Root>
    );
}
