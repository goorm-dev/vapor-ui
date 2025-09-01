import { Badge } from '@vapor-ui/core';

export default function BadgeShape() {
    return (
        <div className="flex flex-wrap gap-2">
            <Badge shape="square">Rectangle</Badge>
            <Badge shape="pill">Pill</Badge>
        </div>
    );
}
