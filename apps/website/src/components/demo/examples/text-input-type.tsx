import { TextInput } from '@vapor-ui/core';

export default function TextInputType() {
    return (
        <div className="space-y-4">
            <label>
                Text
                <TextInput type="text" placeholder="Enter text" />
            </label>
            <label>
                Email
                <TextInput type="email" placeholder="Enter email" />
            </label>
            <label>
                Password
                <TextInput type="password" placeholder="Enter password" />
            </label>
        </div>
    );
}
