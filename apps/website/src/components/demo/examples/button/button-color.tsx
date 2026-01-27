import { Button, Text } from '@vapor-ui/core';

export default function ButtonColor() {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    primary
                </Text>
                <Button colorPalette="primary">Save</Button>
            </div>
            <div className="flex items-center gap-3">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    secondary
                </Text>
                <Button colorPalette="secondary">Save</Button>
            </div>
            <div className="flex items-center gap-3">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    success
                </Text>
                <Button colorPalette="success">Save</Button>
            </div>
            <div className="flex items-center gap-3">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    warning
                </Text>
                <Button colorPalette="warning">Save</Button>
            </div>
            <div className="flex items-center gap-3">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    danger
                </Text>
                <Button colorPalette="danger">Save</Button>
            </div>
            <div className="flex items-center gap-3">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    contrast
                </Text>
                <Button colorPalette="contrast">Save</Button>
            </div>
        </div>
    );
}
