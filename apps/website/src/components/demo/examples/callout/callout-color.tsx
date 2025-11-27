import { Callout } from '@vapor-ui/core';

export default function CalloutColor() {
    return (
        <div className="flex w-full max-w-xl flex-col gap-2">
            <Callout.Root colorPalette="primary">Anyone can develop</Callout.Root>
            <Callout.Root colorPalette="success">Anyone can develop</Callout.Root>
            <Callout.Root colorPalette="warning">Anyone can develop</Callout.Root>
            <Callout.Root colorPalette="danger">Anyone can develop</Callout.Root>
            <Callout.Root colorPalette="hint">Anyone can develop</Callout.Root>
            <Callout.Root colorPalette="contrast">Anyone can develop</Callout.Root>
        </div>
    );
}
