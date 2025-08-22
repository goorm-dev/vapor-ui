import { Button } from '@vapor-ui/core';

export default function ButtonVariant() {
    return (
        <div className="flex items-center gap-2">
            <Button variant="fill">Fill</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
        </div>
    );
}
