import { Avatar } from '@vapor-ui/core';

export default function AvatarVariants() {
    return (
        <div className="flex items-center gap-4">
            <Avatar.Simple
                size="sm"
                shape="circle"
                alt="Vapor Small"
                src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
            />
            <Avatar.Simple
                size="md"
                shape="square"
                alt="Vapor Medium"
                src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
            />
            <Avatar.Simple
                size="lg"
                shape="circle"
                alt="Vapor Large"
                src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
            />
            <Avatar.Simple
                size="xl"
                shape="square"
                alt="Vapor Extra"
                src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
            />
        </div>
    );
}
