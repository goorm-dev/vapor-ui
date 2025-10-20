import { Collapsible } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Collapsible asChild>
        <div>
            <Collapsible.Trigger asChild>
                <button>Toggle</button>
            </Collapsible.Trigger>
            <Collapsible.Content asChild>
                <div>Content</div>
            </Collapsible.Content>
        </div>
    </Collapsible>
);
