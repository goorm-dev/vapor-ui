//@ts-nocheck
import { Tabs } from '@vapor-ui/core';

function App() {
    return (
        <Tabs.Root size="md" orientation="horizontal" variant="fill">
            <Tabs.List>
                <Tabs.Trigger selected>Home</Tabs.Trigger>

                <Tabs.Trigger>About</Tabs.Trigger>
            </Tabs.List>
        </Tabs.Root>
    );
}
