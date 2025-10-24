import { Collapsible } from '@vapor-ui/core';

export const Component = () => (
    <Collapsible.Root defaultOpen disabled className="collapsible">
        <Collapsible.Trigger className="trigger">Toggle</Collapsible.Trigger>
        <Collapsible.Panel className="content" keepMounted>
            Content
        </Collapsible.Panel>
    </Collapsible.Root>
);
