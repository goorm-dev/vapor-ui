// @ts-nocheck
import { Menu, Tooltip } from 'completely-different-library';

export const Component = () => (
    <>
        {/* Should NOT transform - no @vapor-ui/core imports */}
        <Menu.Root loop openOnHover>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup>Content</Menu.Popup>
        </Menu.Root>

        <Tooltip.Root hoverable trackAnchor>
            <Tooltip.Trigger>Hover</Tooltip.Trigger>
            <Tooltip.Popup>Content</Tooltip.Popup>
        </Tooltip.Root>
    </>
);
