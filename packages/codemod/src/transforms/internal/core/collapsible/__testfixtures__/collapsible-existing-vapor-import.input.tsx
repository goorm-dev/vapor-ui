import { Collapsible } from '@goorm-dev/vapor-core';
import { Badge } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Badge>Badge</Badge>
        <Collapsible>
            <Collapsible.Trigger>Toggle</Collapsible.Trigger>
            <Collapsible.Content>Content</Collapsible.Content>
        </Collapsible>
    </>
);
