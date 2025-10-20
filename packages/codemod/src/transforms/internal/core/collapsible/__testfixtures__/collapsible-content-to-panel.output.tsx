import { Collapsible } from '@vapor-ui/core';

export const Component = () => (
    <Collapsible.Root>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Panel forceMount>
            <div>Panel content</div>
        </Collapsible.Panel>
    </Collapsible.Root>
);
