import { TextInput } from '@vapor-ui/core';

export default function TextInputType() {
    return (
        <div className="space-y-4 flex flex-col">
            <TextInput type="text" placeholder="type='text'" />
            <TextInput type="email" placeholder="type='email'" />
            <TextInput type="password" placeholder="type='password'" />
        </div>
    );
}
