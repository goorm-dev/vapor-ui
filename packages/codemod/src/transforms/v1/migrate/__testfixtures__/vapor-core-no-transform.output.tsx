import { Menu, Tooltip } from '@goorm-dev/vapor-core';

export const Component = () => (
    <>
        {/* Should NOT transform - from @goorm-dev/vapor-core */}
        <Tooltip.Root hoverable delay={500}>
            <Tooltip.Trigger>Hover</Tooltip.Trigger>
            <Tooltip.Popup trackAnchor>Content</Tooltip.Popup>
        </Tooltip.Root>

        <Menu.Root openOnHover>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup loop trackAnchor={false}>
                Content
            </Menu.Popup>
        </Menu.Root>
    </>
);
