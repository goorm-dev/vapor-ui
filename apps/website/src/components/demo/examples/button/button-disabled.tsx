import { Button, Text } from '@vapor-ui/core';

export default function ButtonDisabled() {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    enabled
                </Text>
                <Button>Save</Button>
            </div>
            <div className="flex items-center gap-3">
                <Text className="w-20" typography="body3" foreground="hint-100">
                    disabled
                </Text>
                <Button disabled>Save</Button>
            </div>
        </div>
    );
}
