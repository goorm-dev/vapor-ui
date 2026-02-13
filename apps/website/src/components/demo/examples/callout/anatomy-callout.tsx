import { Callout } from '@vapor-ui/core';
import { InfoCircleOutlineIcon } from '@vapor-ui/icons';

export default function AnatomyCallout() {
    return (
        <Callout.Root data-part="Root">
            <Callout.Icon data-part="Icon">
                <InfoCircleOutlineIcon />
            </Callout.Icon>
            Your changes have been saved successfully.
        </Callout.Root>
    );
}
