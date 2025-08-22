import { Avatar } from '@vapor-ui/core';

export default function AvatarVariants() {
    return (
        <div className="flex items-center gap-4">
            <Avatar.Simple size="sm" shape="circle" alt="Vapor Small" src="/icons/vapor-logo.png" />
            <Avatar.Simple
                size="md"
                shape="square"
                alt="Vapor Medium"
                src="/icons/vapor-logo.png"
            />
            <Avatar.Simple size="lg" shape="circle" alt="Vapor Large" src="/icons/vapor-logo.png" />
            <Avatar.Simple size="xl" shape="square" alt="Vapor Extra" src="/icons/vapor-logo.png" />
        </div>
    );
}
