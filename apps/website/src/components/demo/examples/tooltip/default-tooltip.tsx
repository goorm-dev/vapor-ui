'use client';

import { HStack, IconButton, Tooltip } from '@vapor-ui/core';
import { AlignCenterOutlineIcon, BoldOutlineIcon, UnderlineOutlineIcon } from '@vapor-ui/icons';

export default function DefaultTooltip() {
    return (
        <HStack gap="$100">
            <Tooltip.Root>
                <Tooltip.Trigger
                    render={
                        <IconButton>
                            <BoldOutlineIcon />
                        </IconButton>
                    }
                />
                <Tooltip.Popup>Bold</Tooltip.Popup>
            </Tooltip.Root>
            <Tooltip.Root>
                <Tooltip.Trigger
                    render={
                        <IconButton>
                            <UnderlineOutlineIcon />
                        </IconButton>
                    }
                />
                <Tooltip.Popup>Underline</Tooltip.Popup>
            </Tooltip.Root>
            <Tooltip.Root>
                <Tooltip.Trigger
                    render={
                        <IconButton>
                            <AlignCenterOutlineIcon />
                        </IconButton>
                    }
                />
                <Tooltip.Popup>Align Center</Tooltip.Popup>
            </Tooltip.Root>
        </HStack>
    );
}
