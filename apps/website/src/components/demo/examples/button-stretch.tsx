import { Button } from '@vapor-ui/core';

export default function ButtonStretch() {
    return (
        <div className="w-full space-y-2">
            <Button stretch>Stretch</Button>
            <Button>Normal</Button>
        </div>
    );
}
