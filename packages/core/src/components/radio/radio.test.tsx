import { createRef } from 'react';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Radio } from '.';
import { Field } from '../field';
import { RadioGroup } from '../radio-group';

describe('<Radio.Root />', () => {
    it('does not forward `value` prop', async () => {
        const rendered = render(
            <RadioGroup.Root value="test">
                <Radio.Root value="" />
            </RadioGroup.Root>,
        );

        const root = rendered.getByRole('radio');

        expect(root).not.toHaveAttribute('value');
    });

    it('allows `null` value', async () => {
        const groupInputRef = createRef<HTMLInputElement>();
        const rendered = render(
            <RadioGroup.Root inputRef={groupInputRef}>
                <Radio.Root value={null} data-testid="radio-null" />
                <Radio.Root value="a" data-testid="radio-a" />
            </RadioGroup.Root>,
        );

        const radioNull = rendered.getByTestId('radio-null');
        const radioA = rendered.getByTestId('radio-a');
        const inputNull = radioNull.nextElementSibling as HTMLInputElement;
        const inputA = radioA.nextElementSibling as HTMLInputElement;

        await userEvent.click(radioNull);
        expect(radioNull).toBeChecked();
        expect(groupInputRef.current).toBe(inputNull);

        await userEvent.click(radioA);
        expect(radioNull).not.toBeChecked();
        expect(groupInputRef.current).toBe(inputA);
    });

    describe('prop: invalid', () => {
        it('has the `aria-invalid` attribute', () => {
            const rendered = render(
                <RadioGroup.Root>
                    <Radio.Root value="a" invalid aria-label="A" />
                </RadioGroup.Root>,
            );

            expect(rendered.getByRole('radio')).toHaveAttribute('aria-invalid', 'true');
        });

        it('omits the `aria-invalid` attribute when `invalid` is not set', () => {
            const rendered = render(
                <RadioGroup.Root>
                    <Radio.Root value="a" aria-label="A" />
                </RadioGroup.Root>,
            );

            expect(rendered.getByRole('radio')).not.toHaveAttribute('aria-invalid');
        });

        it('does not clobber `aria-invalid` computed by Field validation', async () => {
            const rendered = render(
                <Field.Root name="plan" validationMode="onBlur" validate={() => 'Required'}>
                    <RadioGroup.Root>
                        <Radio.Root value="a" invalid={false} aria-label="A" />
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
