//@ts-nocheck
import { Button, Tabs } from '@vapor-ui/core';

function App() {
    return (
        <>
            <Button>Click</Button>
            {/* TODO: Nav pill migrated to Tabs fill. Verify behavior and styling. */}
            <Tabs.Root variant="fill">
                <Tabs.List>
                    <Tabs.Trigger>Home</Tabs.Trigger>
                </Tabs.List>
            </Tabs.Root>
        </>
    );
}
