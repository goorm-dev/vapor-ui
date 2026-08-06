import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RadioCard } from '.';
import { Field } from '../field';
import { RadioGroup } from '../radio-group';

describe('RadioCard', () => {
    describe('prop: invalid', () => {
        it('has the `aria-invalid` attribute', () => {
            const rendered = render(
                <RadioGroup.Root>
                    <RadioCard value="a" invalid aria-label="A" />
                </RadioGroup.Root>,
            );

            expect(rendered.getByRole('radio')).toHaveAttribute('aria-invalid', 'true');
        });

        it('omits the `aria-invalid` attribute when `invalid` is not set', () => {
            const rendered = render(
                <RadioGroup.Root>
                    <RadioCard value="a" aria-label="A" />
                </RadioGroup.Root>,
            );

            expect(rendered.getByRole('radio')).not.toHaveAttribute('aria-invalid');
        });

        it('does not clobber `aria-invalid` computed by Field validation', async () => {
            const rendered = render(
                <Field.Root name="plan" validationMode="onBlur" validate={() => 'Required'}>
                    <RadioGroup.Root>
                        <RadioCard value="a" invalid={false} aria-label="A" />
                    </RadioGroup.Root>
                    <Field.Error>Required</Field.Error>
                </Field.Root>,
            );
            const radio = rendered.getByRole('radio');

            await userEvent.click(radio);
            await userEvent.tab();

            expect(radio).toHaveAttribute('aria-invalid', 'true');
        });
    });
});
