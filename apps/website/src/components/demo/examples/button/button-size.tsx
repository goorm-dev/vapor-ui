import { Button, Text } from '@vapor-ui/core';

export default function ButtonSize() {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <Text className="w-8" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <Button size="sm">Save</Button>
            </div>
            <div className="flex items-center gap-3">
                <Text className="w-8" typography="body3" foreground="hint-100">
                    md
                </Text>
                <Button size="md">Save</Button>
            </div>
            <div className="flex items-center gap-3">
                <Text className="w-8" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <Button size="lg">Save</Button>
            </div>
            <div className="flex items-center gap-3">
                <Text className="w-8" typography="body3" foreground="hint-100">
                    xl
                </Text>
                <Button size="xl">Save</Button>
            </div>
        </div>
    );
}
