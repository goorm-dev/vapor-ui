import { Collapsible } from '@vapor-ui/core';

export const Component = () => (
    <Collapsible.Root defaultOpen disabled className="custom-class">
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Panel keepMounted>Content</Collapsible.Panel>
    </Collapsible.Root>
);
