import { Tooltip } from '@vapor-ui/core';

export const Component = ({ isHoverable }: { isHoverable: boolean }) => (
    <>
        {/* true */}
        <Tooltip.Root hoverable={true}>
            <Tooltip.Trigger>Hover me</Tooltip.Trigger>
            <Tooltip.Popup>Content</Tooltip.Popup>
        </Tooltip.Root>
        {/* false */}
        <Tooltip.Root hoverable={false}>
            <Tooltip.Trigger>Hover me</Tooltip.Trigger>
            <Tooltip.Popup>Content</Tooltip.Popup>
        </Tooltip.Root>
        {/* shorthand */}
        <Tooltip.Root hoverable>
            <Tooltip.Trigger>Hover me</Tooltip.Trigger>
            <Tooltip.Popup>Content</Tooltip.Popup>
        </Tooltip.Root>
        {/* expression */}
        <Tooltip.Root hoverable={isHoverable}>
            <Tooltip.Trigger>Hover me</Tooltip.Trigger>
            <Tooltip.Popup>Content</Tooltip.Popup>
        </Tooltip.Root>
    </>
);
