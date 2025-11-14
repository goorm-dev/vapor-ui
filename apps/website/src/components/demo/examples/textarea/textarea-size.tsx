import { Textarea } from '@vapor-ui/core';

export default function TextareaSize() {
    return (
        <div className="space-y-4">
            <Textarea size="sm" placeholder="Small size" />
            <Textarea size="md" placeholder="Medium size" />
            <Textarea size="lg" placeholder="Large size" />
            <Textarea size="xl" placeholder="Extra large size" />
        </div>
    );
}
