//@ts-nocheck
import { Tabs } from '@vapor-ui/core';

function App() {
    return (
        <Tabs.Root size="lg" variant="fill">
            <Tabs.List>
                {/* TODO: href prop removed. Use value prop for tabs. Add Tabs.Panel for content. */}
                <Tabs.Trigger selected>Home</Tabs.Trigger>

                <Tabs.Indicator />
            </Tabs.List>
        </Tabs.Root>
    );
}
