import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Popup>
                <Popover.Close render={<button>Close</button>} />
            </Popover.Popup>
        </Popover.Root>
    );
}
