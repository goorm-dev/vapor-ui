import { Collapsible } from '@vapor-ui/core';

export const Component = () => (
    <Collapsible.Root
        render={
            <div>
                <Collapsible.Trigger render={<button>Toggle</button>} />
                <Collapsible.Panel render={<div>Content</div>} />
            </div>
        }
    />
);
