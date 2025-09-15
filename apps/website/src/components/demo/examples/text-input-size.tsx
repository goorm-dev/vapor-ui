import { TextInput } from '@vapor-ui/core';

export default function TextInputSize() {
    return (
        <div className="space-y-4">
            <TextInput size="sm" placeholder="Small size" />
            <TextInput size="md" placeholder="Medium size" />
            <TextInput size="lg" placeholder="Large size" />
            <TextInput size="xl" placeholder="Extra large size" />
        </div>
    );
}
