import { Collapsible as CoreCollapsible } from '@goorm-dev/vapor-core';

export const Component = () => (
    <CoreCollapsible>
        <CoreCollapsible.Trigger>Toggle</CoreCollapsible.Trigger>
        <CoreCollapsible.Content>Content</CoreCollapsible.Content>
    </CoreCollapsible>
);
