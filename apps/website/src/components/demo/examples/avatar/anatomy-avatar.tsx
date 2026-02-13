import { Avatar, Flex } from '@vapor-ui/core';

import { VAPOR_LOGO_URL } from '~/constants/image-urls';

export default function AnatomyAvatar() {
    return (
        <Flex gap="$200">
            <Avatar.Root data-part="Root" alt="Vapor" src={VAPOR_LOGO_URL}>
                <Avatar.ImagePrimitive data-part="ImagePrimitive" />
                <Avatar.FallbackPrimitive data-part="FallbackPrimitive">V</Avatar.FallbackPrimitive>
            </Avatar.Root>
            <Avatar.Root data-part="Root">
                <Avatar.ImagePrimitive data-part="ImagePrimitive" />
                <Avatar.FallbackPrimitive data-part="FallbackPrimitive">V</Avatar.FallbackPrimitive>
            </Avatar.Root>
        </Flex>
    );
}
