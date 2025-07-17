import { Avatar } from '@vapor-ui/core';

export default function DefaultAvatar() {
    return (
        <Avatar.Root
            size="md"
            alt="goorm"
            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
        >
            <Avatar.Image />
            <Avatar.Fallback>goorm</Avatar.Fallback>
        </Avatar.Root>
    );
}
