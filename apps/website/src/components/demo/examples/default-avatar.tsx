import { Avatar } from '@vapor-ui/core';

export default function DefaultAvatar() {
    return (
        <Avatar.Root
            size="md"
            alt="goorm"
            src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
        >
            <Avatar.Image />
            <Avatar.Fallback>goorm</Avatar.Fallback>
        </Avatar.Root>
    );
}
