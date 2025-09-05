import { Avatar } from '@vapor-ui/core';

export default function AvatarFallbackOnly() {
    return (
        <div className="flex gap-4">
            <Avatar.Root size="md" alt="Vapor Library">
                <Avatar.Fallback />
            </Avatar.Root>
            <Avatar.Root size="md" alt="Vapor tokens">
                <Avatar.Fallback>VT</Avatar.Fallback>
            </Avatar.Root>
            <Avatar.Root size="md" alt="Vapor Delay" delay={600}>
                <Avatar.Fallback>VD</Avatar.Fallback>
            </Avatar.Root>
        </div>
    );
}
