import { Collapsible } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Collapsible defaultOpen disabled className="collapsible">
        <Collapsible.Trigger className="trigger">Toggle</Collapsible.Trigger>
        <Collapsible.Content className="content" keepMounted>
            Content
        </Collapsible.Content>
    </Collapsible>
);
