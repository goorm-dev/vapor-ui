// @ts-nocheck
import { Tooltip } from '@vapor-ui/core';

export const Component = ({ isHoverable }: { isHoverable: boolean }) => (
    <>
        {/* true */}
        <Tooltip.Root disableHoverablePopup={false}>
            <Tooltip.Trigger>Hover me</Tooltip.Trigger>
            <Tooltip.Popup>Content</Tooltip.Popup>
        </Tooltip.Root>
        {/* false */}
        <Tooltip.Root disableHoverablePopup={true}>
            <Tooltip.Trigger>Hover me</Tooltip.Trigger>
            <Tooltip.Popup>Content</Tooltip.Popup>
        </Tooltip.Root>
        {/* shorthand */}
        <Tooltip.Root disableHoverablePopup={false}>
            <Tooltip.Trigger>Hover me</Tooltip.Trigger>
            <Tooltip.Popup>Content</Tooltip.Popup>
        </Tooltip.Root>
        {/* expression */}
        <Tooltip.Root disableHoverablePopup={!isHoverable}>
            <Tooltip.Trigger>Hover me</Tooltip.Trigger>
            <Tooltip.Popup>Content</Tooltip.Popup>
        </Tooltip.Root>
    </>
);
