import { Popover } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Popover>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.CombinedContent>This is a basic popover example.</Popover.CombinedContent>
        </Popover>
    );
}
