import { Avatar } from '@vapor-ui/core';

export default function AvatarComposition() {
    return (
        <div className="flex gap-4">
            <Avatar.Root
                size="md"
                alt="Vapor System"
                src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
            >
                <Avatar.Image />
                <Avatar.Fallback />
            </Avatar.Root>
            <Avatar.Root size="md" alt="Vapor Components" src="/invalid-image.jpg">
                <Avatar.Image />
                <Avatar.Fallback />
            </Avatar.Root>
            <Avatar.Root size="md" alt="Vapor Theme">
                <Avatar.Image />
                <Avatar.Fallback />
            </Avatar.Root>
        </div>
    );
}
