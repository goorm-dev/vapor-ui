import { Button, Collapsible } from '@vapor-ui/core';

export const Component = () => (
    <Collapsible.Root>
        <Collapsible.Trigger>
            <Button>Toggle</Button>
        </Collapsible.Trigger>
        <Collapsible.Panel>Content</Collapsible.Panel>
    </Collapsible.Root>
);
