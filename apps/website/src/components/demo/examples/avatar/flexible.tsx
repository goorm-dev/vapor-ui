import { Avatar } from '@vapor-ui/core';

export default function Flexible() {
    return (
        <div className="flex gap-4">
            <Avatar.Root
                size="md"
                alt="UI"
                src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
            >
                <Avatar.FallbackPrimitive>UI</Avatar.FallbackPrimitive>
                <Avatar.ImagePrimitive />
            </Avatar.Root>
            <Avatar.Root size="md" alt="Core" src="/invalid-image.jpg">
                <Avatar.FallbackPrimitive>VC</Avatar.FallbackPrimitive>
                <Avatar.ImagePrimitive />
            </Avatar.Root>
            <Avatar.Root size="md" alt="Design">
                <Avatar.FallbackPrimitive>VD</Avatar.FallbackPrimitive>
                <Avatar.ImagePrimitive />
            </Avatar.Root>
        </div>
    );
}
