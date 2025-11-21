import { Button } from '@vapor-ui/core';

export default function ButtonColor() {
    return (
        <div className="flex flex-wrap gap-2">
            <Button colorPalette="primary">Primary</Button>
            <Button colorPalette="secondary">Secondary</Button>
            <Button colorPalette="success">Success</Button>
            <Button colorPalette="warning">Warning</Button>
            <Button colorPalette="danger">Danger</Button>
            <Button colorPalette="contrast">Contrast</Button>
        </div>
    );
}
