import { Collapsible } from '@vapor-ui/core';

export const Component = () => (
    <Collapsible.Root
        render={
            <div className="wrapper">
                <Collapsible.Trigger render={<button>Toggle</button>} />
                <Collapsible.Panel render={<section>Content</section>} />
            </div>
        }
    />
);
