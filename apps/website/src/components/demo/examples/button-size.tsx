import { Button } from '@vapor-ui/core';

export default function ButtonSize() {
    return (
        <div className="flex items-center gap-2">
            <Button size="sm">SM</Button>
            <Button size="md">MD</Button>
            <Button size="lg">LG</Button>
            <Button size="xl">XL</Button>
        </div>
    );
}
