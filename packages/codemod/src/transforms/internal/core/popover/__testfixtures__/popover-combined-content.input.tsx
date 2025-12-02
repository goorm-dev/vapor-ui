import { Popover } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Popover side="right" align="center">
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.CombinedContent>Content</Popover.CombinedContent>
        </Popover>
    );
}
