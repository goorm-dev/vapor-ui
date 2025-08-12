import { Text } from '@vapor-ui/core';

export default function TextForeground() {
    return (
        <div className="flex flex-wrap gap-2">
            <Text foreground="primary">Primary</Text>
            <Text foreground="secondary">Secondary</Text>
            <Text foreground="success">Success</Text>
            <Text foreground="warning">Warning</Text>
            <Text foreground="danger">Danger</Text>
            <Text foreground="hint">Hint</Text>
        </div>
    );
}