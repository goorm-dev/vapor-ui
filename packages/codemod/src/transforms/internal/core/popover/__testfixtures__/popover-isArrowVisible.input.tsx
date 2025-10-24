import { Popover } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Popover side="bottom">
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Portal>
                <Popover.Content isArrowVisible={false}>Content</Popover.Content>
            </Popover.Portal>
        </Popover>
    );
}
