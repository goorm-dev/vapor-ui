import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '~/components/button';
import { Checkbox } from '~/components/checkbox';

import { Field } from './field';

const meta: Meta<typeof Field.Root> = {
    title: 'Field',
    component: Field.Root,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Field.Root>;

export const TestBed: Story = {
    render: () => {
        const [agreed, setAgreed] = useState(false);
        const [submitted, setSubmitted] = useState(false);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            setSubmitted(true);
        };

        const showError = submitted && !agreed;

        return (
            <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}
            >
                <h3>Terms of Service Agreement</h3>

                <Field.Root
                    validationMode="onBlur"
                    validate={(value) => {
                        console.log(value);
                        return value === true ? null : 'You must agree to the terms.';
                    }}
                >
                    <Checkbox.Root
                        checked={agreed}
                        onCheckedChange={(checked) => setAgreed(!!checked)}
                        invalid={showError}
                    >
                        <Checkbox.Control />
                        <Checkbox.Label>I agree to the Terms of Service *</Checkbox.Label>
                    </Checkbox.Root>
                    <Field.Description>
                        Please read and accept our terms of service to proceed with registration.
                    </Field.Description>

                    <Field.Error match="customError" />

                    <Field.Success>
                        <span>Thank you for agreeing!</span>
                    </Field.Success>
                </Field.Root>

                <Button type="submit" style={{ alignSelf: 'flex-start' }}>
                    Submit
                </Button>
            </form>
        );
    },
};
