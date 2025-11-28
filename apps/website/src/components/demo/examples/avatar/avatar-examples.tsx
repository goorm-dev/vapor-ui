import { Avatar } from '@vapor-ui/core';

export default function AvatarExamples() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium">Avatar.Simple</h4>
                <div className="flex gap-4">
                    <Avatar.Root
                        size="md"
                        alt="John Doe"
                        src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
                    />
                    <Avatar.Root size="md" alt="Jane Smith" src="/invalid-image.jpg" />
                    <Avatar.Root size="md" alt="Mike Johnson" />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium">
                    Avatar.Root + Avatar.Image + Avatar.Fallback
                </h4>
                <div className="flex gap-4">
                    <Avatar.Root
                        size="md"
                        alt="Alice Brown"
                        src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
                    />
                    <Avatar.Root size="md" alt="Bob Wilson" src="/invalid-image.jpg" />
                    <Avatar.Root size="md" alt="Carol Davis" />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium">Avatar.Root + Avatar.Fallback (No Image)</h4>
                <div className="flex gap-4">
                    <Avatar.Root size="md" alt="David Miller">
                        <Avatar.FallbackPrimitive />
                    </Avatar.Root>
                    <Avatar.Root size="md" alt="Eva Garcia">
                        <Avatar.FallbackPrimitive>EG</Avatar.FallbackPrimitive>
                    </Avatar.Root>
                    <Avatar.Root size="md" alt="Frank Taylor">
                        <Avatar.FallbackPrimitive>👤</Avatar.FallbackPrimitive>
                    </Avatar.Root>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium">Different Sizes & Shapes</h4>
                <div className="flex items-center gap-4">
                    <Avatar.Root
                        size="sm"
                        shape="circle"
                        alt="Grace Lee"
                        src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
                    />
                    <Avatar.Root
                        size="md"
                        shape="square"
                        alt="Henry Kim"
                        src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
                    />
                    <Avatar.Root
                        size="lg"
                        shape="circle"
                        alt="Iris Chen"
                        src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
                    />
                    <Avatar.Root
                        size="xl"
                        shape="square"
                        alt="Jack Wong"
                        src="https://statics.goorm.io/gds/docs/images/vapor-log.svg"
                    />
                </div>
            </div>
        </div>
    );
}
