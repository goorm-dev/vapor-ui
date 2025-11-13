import { Avatar } from '@vapor-ui/core';

export default function AvatarShape() {
    return (
        <div className="flex flex-wrap items-center gap-4">
            <Avatar.Root
                size="lg"
                shape="circle"
                alt="Circle Avatar"
                src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
            />
            <Avatar.Root
                size="lg"
                shape="square"
                alt="Square Avatar"
                src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
            />
        </div>
    );
}
