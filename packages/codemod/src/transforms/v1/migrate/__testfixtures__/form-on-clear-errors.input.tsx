import { useState } from 'react';

import { Form } from '@vapor-ui/core';

export const Component = () => {
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    return (
        <>
            {/* with errors prop and onClearErrors callback */}
            <Form
                errors={errors}
                onClearErrors={(clearedErrors: Record<string, string[]>) => {
                    setErrors((prev) => {
                        const next = { ...prev };
                        Object.keys(clearedErrors).forEach((name) => delete next[name]);
                        return next;
                    });
                }}
            >
                <input name="email" type="email" />
                <button type="submit">Submit</button>
            </Form>

            {/* only onClearErrors callback */}
            <Form onClearErrors={() => console.log('cleared')}>
                <input name="name" type="text" />
                <button type="submit">Submit</button>
            </Form>

            {/* inline function expression */}
            <Form errors={errors} onClearErrors={handleClearErrors}>
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
