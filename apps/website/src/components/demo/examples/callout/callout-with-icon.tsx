import { Callout, VStack } from '@vapor-ui/core';
import { CheckCircleIcon, HeartIcon, InfoCircleOutlineIcon } from '@vapor-ui/icons';

export default function CalloutWithIcon() {
    return (
        <VStack $styles={{ gap: '$100' }} className="w-full max-w-xl">
            <Callout.Root colorPalette="success">
                <Callout.Icon>
                    <CheckCircleIcon />
                </Callout.Icon>
                Task completed successfully
            </Callout.Root>
            <Callout.Root colorPalette="warning">
                <Callout.Icon>
                    <InfoCircleOutlineIcon />
                </Callout.Icon>
                Please review your settings
            </Callout.Root>
            <Callout.Root colorPalette="primary">
                <Callout.Icon>
                    <HeartIcon />
                </Callout.Icon>
                New notification available
            </Callout.Root>
        </VStack>
    );
}
