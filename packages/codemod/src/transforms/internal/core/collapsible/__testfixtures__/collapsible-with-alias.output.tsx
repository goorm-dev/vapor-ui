import { Collapsible as CoreCollapsible } from '@vapor-ui/core';

export const Component = () => (
    <CoreCollapsible.Root>
        <CoreCollapsible.Trigger>Toggle</CoreCollapsible.Trigger>
        <CoreCollapsible.Panel>Content</CoreCollapsible.Panel>
    </CoreCollapsible.Root>
);
