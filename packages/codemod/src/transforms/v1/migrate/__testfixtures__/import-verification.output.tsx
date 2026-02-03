// @ts-nocheck
import { Menu } from '@vapor-ui/core';
import { Tooltip } from 'some-other-library';

export const Component = () => (
    <>
        {/* Should transform - from @vapor-ui/core */}
        <Menu.Root loopFocus>
            <Menu.Trigger openOnHover delay={200}>
                Open
            </Menu.Trigger>
            <Menu.Popup disableAnchorTracking={false}>Content</Menu.Popup>
        </Menu.Root>

        {/* Should NOT transform - from different library */}
        <Tooltip.Root hoverable closeDelay={100}>
            <Tooltip.Trigger>Hover</Tooltip.Trigger>
            <Tooltip.Popup loop trackAnchor={false}>
                Content
            </Tooltip.Popup>
        </Tooltip.Root>
    </>
);
