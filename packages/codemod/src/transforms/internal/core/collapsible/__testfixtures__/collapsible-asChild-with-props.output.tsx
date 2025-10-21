import { Collapsible } from '@vapor-ui/core';

export const Component = () => (
    <Collapsible.Root
        render={
            <div className="wrapper">
                <Collapsible.Trigger render={<button type="button">Toggle</button>} />
                <Collapsible.Panel
                    render={<section aria-label="content">Content</section>}
                    keepMounted
                />
            </div>
        }
    />
);
