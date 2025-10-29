import { Text } from '@vapor-ui/core';

export default function TextForeground() {
    return (
        <div className="flex flex-wrap gap-2">
            <Text foreground="primary-100">Primary</Text>
            <Text foreground="secondary-100">Secondary</Text>
            <Text foreground="success-100">Success</Text>
            <Text foreground="warning-100">Warning</Text>
            <Text foreground="danger-100">Danger</Text>
            <Text foreground="hint-100">Hint</Text>
        </div>
    );
}
