//@ts-nocheck
import { Tabs } from '@vapor-ui/core';

function App() {
    return (
        <Tabs.Root size="lg" variant="fill">
            <Tabs.List>
                <Tabs.Trigger selected>Home</Tabs.Trigger>
            </Tabs.List>
        </Tabs.Root>
    );
}
