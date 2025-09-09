import { TextInput } from '@vapor-ui/core';

export default function TextInputSize() {
    return (
        <div className="space-y-4">
            <label>
                Small
                <TextInput size="sm" placeholder="Small size" />
            </label>
            <label>
                Medium
                <TextInput size="md" placeholder="Medium size" />
            </label>
            <label>
                Large
                <TextInput size="lg" placeholder="Large size" />
            </label>
            <label>
                Extra Large
                <TextInput size="xl" placeholder="Extra large size" />
            </label>
        </div>
    );
}
