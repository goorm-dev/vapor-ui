import { Avatar } from '@vapor-ui/core';

export default function AvatarSize() {
    return (
        <div className="flex flex-wrap items-center gap-4">
            <Avatar.Root
                size="sm"
                alt="SM"
                src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
            />
            <Avatar.Root
                size="md"
                alt="MD"
                src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
            />
            <Avatar.Root
                size="lg"
                alt="LG"
                src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
            />
            <Avatar.Root
                size="xl"
                alt="XL"
                src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
            />
        </div>
    );
}
