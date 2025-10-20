import { Collapsible } from '@vapor-ui/core';

export const Component = () => (
    <Collapsible.Root render={<div className="wrapper" />}>
        <Collapsible.Trigger render={<button type="button" />}>Toggle</Collapsible.Trigger>
        <Collapsible.Panel render={<section aria-label="content" />} forceMount>
            Content
        </Collapsible.Panel>
    </Collapsible.Root>
);
