import { Textarea } from '@vapor-ui/core';

export default function TextareaSize() {
    return (
        <div className="space-y-4">
            <Textarea.Root size="sm" placeholder="Small size">
                <Textarea.Field />
            </Textarea.Root>
            <Textarea.Root size="md" placeholder="Medium size">
                <Textarea.Field />
            </Textarea.Root>
            <Textarea.Root size="lg" placeholder="Large size">
                <Textarea.Field />
            </Textarea.Root>
            <Textarea.Root size="xl" placeholder="Extra large size">
                <Textarea.Field />
            </Textarea.Root>
        </div>
    );
}