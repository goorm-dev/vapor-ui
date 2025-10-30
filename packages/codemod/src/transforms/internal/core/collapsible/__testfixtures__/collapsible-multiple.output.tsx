import { Collapsible } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Collapsible.Root defaultOpen>
            <Collapsible.Trigger>First</Collapsible.Trigger>
            <Collapsible.Panel>First Content</Collapsible.Panel>
        </Collapsible.Root>

        <Collapsible.Root>
            <Collapsible.Trigger>Second</Collapsible.Trigger>
            <Collapsible.Panel>Second Content</Collapsible.Panel>
        </Collapsible.Root>
    </>
);
