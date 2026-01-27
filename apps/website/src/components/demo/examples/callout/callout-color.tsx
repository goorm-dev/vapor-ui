import { Callout, Text } from '@vapor-ui/core';

export default function CalloutColor() {
    return (
        <div className="flex w-full max-w-xl flex-col gap-3">
            <div className="flex flex-col gap-1">
                <Text typography="body3" foreground="hint-100">
                    primary
                </Text>
                <Callout.Root colorPalette="primary">
                    Your changes have been saved successfully.
                </Callout.Root>
            </div>
            <div className="flex flex-col gap-1">
                <Text typography="body3" foreground="hint-100">
                    success
                </Text>
                <Callout.Root colorPalette="success">
                    Your changes have been saved successfully.
                </Callout.Root>
            </div>
            <div className="flex flex-col gap-1">
                <Text typography="body3" foreground="hint-100">
                    warning
                </Text>
                <Callout.Root colorPalette="warning">
                    Your changes have been saved successfully.
                </Callout.Root>
            </div>
            <div className="flex flex-col gap-1">
                <Text typography="body3" foreground="hint-100">
                    danger
                </Text>
                <Callout.Root colorPalette="danger">
                    Your changes have been saved successfully.
                </Callout.Root>
            </div>
            <div className="flex flex-col gap-1">
                <Text typography="body3" foreground="hint-100">
                    hint
                </Text>
                <Callout.Root colorPalette="hint">
                    Your changes have been saved successfully.
                </Callout.Root>
            </div>
            <div className="flex flex-col gap-1">
                <Text typography="body3" foreground="hint-100">
                    contrast
                </Text>
                <Callout.Root colorPalette="contrast">
                    Your changes have been saved successfully.
                </Callout.Root>
            </div>
        </div>
    );
}
