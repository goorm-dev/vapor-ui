import { Button, Text } from '@vapor-ui/core';

export default function ButtonVariant() {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    fill
                </Text>
                <Button variant="fill">Save</Button>
            </div>
            <div className="flex items-center gap-3">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    outline
                </Text>
                <Button variant="outline">Save</Button>
            </div>
            <div className="flex items-center gap-3">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    ghost
                </Text>
                <Button variant="ghost">Save</Button>
            </div>
        </div>
    );
}
