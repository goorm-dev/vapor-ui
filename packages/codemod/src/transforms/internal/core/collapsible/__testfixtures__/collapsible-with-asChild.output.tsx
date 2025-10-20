import { Collapsible } from '@vapor-ui/core';

export const Component = () => (
    <Collapsible.Root render={<div />}>
        <Collapsible.Trigger render={<button />}>Toggle</Collapsible.Trigger>
        <Collapsible.Panel render={<div />}>Content</Collapsible.Panel>
    </Collapsible.Root>
);
