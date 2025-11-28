import { Collapsible } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Collapsible>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Content forceMount>
            <div>Panel content</div>
        </Collapsible.Content>
    </Collapsible>
);
