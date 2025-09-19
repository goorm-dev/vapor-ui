import { Callout } from '@vapor-ui/core';

export default function CalloutColor() {
    return (
        <div className="flex w-full max-w-xl flex-col gap-2">
            <Callout.Root color="primary">Anyone can develop</Callout.Root>
            <Callout.Root color="success">Anyone can develop</Callout.Root>
            <Callout.Root color="warning">Anyone can develop</Callout.Root>
            <Callout.Root color="danger">Anyone can develop</Callout.Root>
            <Callout.Root color="hint">Anyone can develop</Callout.Root>
            <Callout.Root color="contrast">Anyone can develop</Callout.Root>
        </div>
    );
}
