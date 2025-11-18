import { Badge } from '@vapor-ui/core';
import { Collapsible } from '@goorm-dev/vapor-core';

export const Component = () => (
    <>
        <Badge>Badge</Badge>
        <Collapsible>
            <Collapsible.Trigger>Toggle</Collapsible.Trigger>
            <Collapsible.Content>Content</Collapsible.Content>
        </Collapsible>
    </>
);
