import { Collapsible as CoreCollapsible } from '@goorm-dev/vapor-core';

export const Component = () => (
    <CoreCollapsible defaultOpen>
        <CoreCollapsible.Trigger>Toggle</CoreCollapsible.Trigger>
        <CoreCollapsible.Content>Content</CoreCollapsible.Content>
    </CoreCollapsible>
);
