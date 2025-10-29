//@ts-nocheck
import { Button, Tabs } from '@vapor-ui/core';

function App() {
    return (
        <>
            <Button>Click</Button>
            {/* TODO: Nav pill migrated to Tabs fill. Verify behavior and styling. */}
            <Tabs.Root variant="fill">
                <Tabs.List>
                    {/* TODO: href prop removed. Use value prop for tabs. Add Tabs.Panel for content. */}
                    <Tabs.Trigger>Home</Tabs.Trigger>

                    <Tabs.Indicator />
                </Tabs.List>
            </Tabs.Root>
        </>
    );
}
