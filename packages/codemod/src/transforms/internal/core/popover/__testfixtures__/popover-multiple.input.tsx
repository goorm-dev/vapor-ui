import { Popover } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <>
            <Popover side="top">
                <Popover.Trigger>Open 1</Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content>Content 1</Popover.Content>
                </Popover.Portal>
            </Popover>
            <Popover side="bottom" align="end">
                <Popover.Trigger>Open 2</Popover.Trigger>
                <Popover.CombinedContent>Content 2</Popover.CombinedContent>
            </Popover>
        </>
    );
}
