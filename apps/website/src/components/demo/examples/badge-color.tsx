import { Badge } from '@vapor-ui/core';

export default function BadgeColor() {
    return (
        <div className="flex flex-wrap gap-2">
            <Badge color="primary">Primary</Badge>
            <Badge color="hint">Hint</Badge>
            <Badge color="danger">Danger</Badge>
            <Badge color="success">Success</Badge>
            <Badge color="warning">Warning</Badge>
            <Badge color="contrast">Contrast</Badge>
        </div>
    );
}
