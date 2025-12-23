import { Button } from '@vapor-ui/core';

export default function ButtonDisabled() {
    return (
        <div className="flex items-center gap-2">
            <Button disabled>Disabled</Button>
            <Button>Enabled</Button>
        </div>
    );
}
