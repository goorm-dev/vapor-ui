import { Callout } from '@vapor-ui/core';

export default function CalloutColor() {
    return (
        <div className="flex w-full max-w-xl flex-col gap-2">
            <Callout color="primary">Anyone can develop</Callout>
            <Callout color="success">Anyone can develop</Callout>
            <Callout color="warning">Anyone can develop</Callout>
            <Callout color="danger">Anyone can develop</Callout>
            <Callout color="hint">Anyone can develop</Callout>
            <Callout color="contrast">Anyone can develop</Callout>
        </div>
    );
}
