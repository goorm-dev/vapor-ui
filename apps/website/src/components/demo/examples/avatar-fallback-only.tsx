import { Avatar } from '@vapor-ui/core';

export default function AvatarFallbackOnly() {
    return (
        <div className="flex gap-4">
            <Avatar.Root size="md" alt="Vapor Library">
                <Avatar.Fallback />
            </Avatar.Root>
            <Avatar.Root size="md" alt="Vapor Tokens">
                <Avatar.Fallback>VT</Avatar.Fallback>
            </Avatar.Root>
            <Avatar.Root size="md" alt="Vapor Icons">
                <Avatar.Fallback>🎨</Avatar.Fallback>
            </Avatar.Root>
        </div>
    );
}