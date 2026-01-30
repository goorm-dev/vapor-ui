// @ts-nocheck
import { Menu as VaporMenu } from '@vapor-ui/core';
import { Menu as ThirdPartyMenu } from 'third-party-ui';

export const Component = () => (
    <>
        {/* Should transform - Vapor UI */}
        <VaporMenu.Root>
            <VaporMenu.Trigger openOnHover>Open</VaporMenu.Trigger>
            <VaporMenu.Popup loopFocus>Content</VaporMenu.Popup>
        </VaporMenu.Root>

        {/* Should NOT transform - Third Party */}
        <ThirdPartyMenu.Root openOnHover>
            <ThirdPartyMenu.Trigger>Open</ThirdPartyMenu.Trigger>
            <ThirdPartyMenu.Popup loop>Content</ThirdPartyMenu.Popup>
        </ThirdPartyMenu.Root>
    </>
);
