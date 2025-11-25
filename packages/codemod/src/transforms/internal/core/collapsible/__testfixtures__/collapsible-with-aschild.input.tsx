import { Collapsible } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Collapsible asChild>
        <div className="wrapper">
            <Collapsible.Trigger asChild>
                <button>Toggle</button>
            </Collapsible.Trigger>
            <Collapsible.Content asChild>
                <section>Content</section>
            </Collapsible.Content>
        </div>
    </Collapsible>
);
