import { Collapsible } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Collapsible defaultOpen disabled className="custom-class">
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Content keepMounted>Content</Collapsible.Content>
    </Collapsible>
);
