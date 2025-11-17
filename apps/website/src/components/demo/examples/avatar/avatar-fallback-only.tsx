import { Avatar } from '@vapor-ui/core';

export default function AvatarFallbackOnly() {
    return (
        <div className="flex gap-4">
            <Avatar.Root size="md" alt="Vapor Library">
                <Avatar.FallbackPrimitive />
            </Avatar.Root>
            <Avatar.Root size="md" alt="Vapor tokens">
                <Avatar.FallbackPrimitive>VT</Avatar.FallbackPrimitive>
            </Avatar.Root>
            <Avatar.Root size="md" alt="Vapor Delay" delay={600}>
                <Avatar.FallbackPrimitive>VD</Avatar.FallbackPrimitive>
            </Avatar.Root>
        </div>
    );
}
