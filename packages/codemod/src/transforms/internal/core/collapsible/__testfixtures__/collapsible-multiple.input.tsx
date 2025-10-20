import { Collapsible } from '@goorm-dev/vapor-core';

export const Component = () => (
    <>
        <Collapsible defaultOpen>
            <Collapsible.Trigger>First</Collapsible.Trigger>
            <Collapsible.Content>First Content</Collapsible.Content>
        </Collapsible>

        <Collapsible>
            <Collapsible.Trigger>Second</Collapsible.Trigger>
            <Collapsible.Content>Second Content</Collapsible.Content>
        </Collapsible>
    </>
);
