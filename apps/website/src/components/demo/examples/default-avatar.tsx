import { Avatar } from '@vapor-ui/core';

import { GOORM_FAVICON_URL } from '~/constants/image-urls';

export default function DefaultAvatar() {
    return (
        <Avatar.Root size="md" alt="goorm" src={GOORM_FAVICON_URL}>
            <Avatar.Image />
            <Avatar.Fallback>goorm</Avatar.Fallback>
        </Avatar.Root>
    );
}
