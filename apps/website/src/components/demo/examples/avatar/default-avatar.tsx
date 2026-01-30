import { Avatar } from '@vapor-ui/core';

import { VAPOR_LOGO_URL } from '~/constants/image-urls';

export default function DefaultAvatar() {
    return <Avatar.Root alt="Vapor" src={VAPOR_LOGO_URL} />;
}
