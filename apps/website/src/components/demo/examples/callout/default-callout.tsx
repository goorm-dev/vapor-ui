import { Callout } from '@vapor-ui/core';
import { InfoCircleOutlineIcon } from '@vapor-ui/icons';

export default function DefaultCallout() {
    return (
        <Callout.Root>
            <Callout.Icon>
                <InfoCircleOutlineIcon />
            </Callout.Icon>
            Your changes have been saved successfully.
        </Callout.Root>
    );
}
