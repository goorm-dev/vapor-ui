// @ts-nocheck
import { useState } from 'react';

import { Form } from '@vapor-ui/core';

export const Component = () => {
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    return (
        <>
            {/* with errors prop and onClearErrors callback */}
            <Form errors={errors}>
                <input name="email" type="email" />
                <button type="submit">Submit</button>
            </Form>
            {/* only onClearErrors callback */}
            <Form>
                <input name="name" type="text" />
                <button type="submit">Submit</button>
            </Form>
            {/* inline function expression */}
            <Form errors={errors}>
                <input name="password" type="password" />
                <button type="submit">Submit</button>
            </Form>
            {/* no onClearErrors - should remain unchanged */}
            <Form errors={errors}>
                <input name="confirm" type="password" />
                <button type="submit">Submit</button>
            </Form>
        </>
    );
};

function handleClearErrors(errors: Record<string, string[]>) {
    console.log('Clearing errors:', errors);
}
