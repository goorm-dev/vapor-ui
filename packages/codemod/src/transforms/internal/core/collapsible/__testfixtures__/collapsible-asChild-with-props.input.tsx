import { Collapsible } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Collapsible asChild>
        <div className="wrapper">
            <Collapsible.Trigger asChild>
                <button type="button">Toggle</button>
            </Collapsible.Trigger>
            <Collapsible.Content asChild forceMount>
                <section aria-label="content">Content</section>
            </Collapsible.Content>
        </div>
    </Collapsible>
);
