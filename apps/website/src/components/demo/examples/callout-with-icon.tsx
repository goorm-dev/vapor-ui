import { Callout } from '@vapor-ui/core';
import { CheckCircleIcon, HeartIcon, InfoCircleOutlineIcon } from '@vapor-ui/icons';

export default function CalloutWithIcon() {
    return (
        <div className="flex w-full max-w-xl flex-col gap-2">
            <Callout.Root color="success">
                <Callout.Icon>
                    <CheckCircleIcon />
                </Callout.Icon>
                Task completed successfully
            </Callout.Root>
            <Callout.Root color="warning">
                <Callout.Icon>
                    <InfoCircleOutlineIcon />
                </Callout.Icon>
                Please review your settings
            </Callout.Root>
            <Callout.Root color="primary">
                <Callout.Icon>
                    <HeartIcon />
                </Callout.Icon>
                New notification available
            </Callout.Root>
        </div>
    );
}
