import { Badge } from '@vapor-ui/core';

export default function BadgeColor() {
    return (
        <div className="flex flex-wrap gap-2">
            <Badge colorPalette="primary">Primary</Badge>
            <Badge colorPalette="hint">Hint</Badge>
            <Badge colorPalette="danger">Danger</Badge>
            <Badge colorPalette="success">Success</Badge>
            <Badge colorPalette="warning">Warning</Badge>
            <Badge colorPalette="contrast">Contrast</Badge>
        </div>
    );
}
