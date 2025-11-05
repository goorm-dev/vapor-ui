import { Button } from '@vapor-ui/core';

export default function ButtonColor() {
    return (
        <div className="flex flex-wrap gap-2">
            <Button color="primary">Primary</Button>
            <Button color="secondary">Secondary</Button>
            <Button color="success">Success</Button>
            <Button color="warning">Warning</Button>
            <Button color="danger">Danger</Button>
            <Button color="contrast">Contrast</Button>
        </div>
    );
}
