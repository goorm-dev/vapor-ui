import { Badge, Collapsible } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Badge>Badge</Badge>
        <Collapsible.Root>
            <Collapsible.Trigger>Toggle</Collapsible.Trigger>
            <Collapsible.Panel>Content</Collapsible.Panel>
        </Collapsible.Root>
    </>
);
