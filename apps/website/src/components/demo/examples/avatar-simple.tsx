import { Avatar } from '@vapor-ui/core';

export default function AvatarSimple() {
    return (
        <div className="flex gap-4">
            <Avatar.Simple
                size="md"
                alt="Vapor UI"
                src="/icons/vapor-logo.png"
            />
            <Avatar.Simple size="md" alt="Vapor Core" src="/invalid-image.jpg" />
            <Avatar.Simple size="md" alt="Vapor Design" />
        </div>
    );
}