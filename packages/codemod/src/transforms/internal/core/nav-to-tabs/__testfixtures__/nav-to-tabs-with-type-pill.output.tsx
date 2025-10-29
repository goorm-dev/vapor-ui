//@ts-nocheck
import { Tabs } from '@vapor-ui/core';

function App() {
    return (
        <Tabs.Root size="md" orientation="horizontal" variant="fill">
            <Tabs.List>
                {/* TODO: href prop removed. Use value prop for tabs. Add Tabs.Panel for content. */}
                <Tabs.Trigger selected>Home</Tabs.Trigger>

                {/* TODO: href prop removed. Use value prop for tabs. Add Tabs.Panel for content. */}
                <Tabs.Trigger>About</Tabs.Trigger>

                <Tabs.Indicator />
            </Tabs.List>
        </Tabs.Root>
    );
}
