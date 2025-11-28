import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <Popover.Trigger render={<button>Open</button>} />
            <Popover.Popup>Content</Popover.Popup>
        </Popover.Root>
    );
}
