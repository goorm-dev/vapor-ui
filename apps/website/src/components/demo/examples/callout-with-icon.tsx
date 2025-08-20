import { Callout } from '@vapor-ui/core';
import { CheckCircleIcon, InfoCircleOutlineIcon, HeartIcon } from '@vapor-ui/icons';

export default function CalloutWithIcon() {
    return (
        <div className="flex w-full max-w-xl flex-col gap-2">
            <Callout color="success">
                <CheckCircleIcon />
                Task completed successfully
            </Callout>
            <Callout color="warning">
                <InfoCircleOutlineIcon />
                Please review your settings
            </Callout>
            <Callout color="primary">
                <HeartIcon />
                New notification available
            </Callout>
        </div>
    );
}