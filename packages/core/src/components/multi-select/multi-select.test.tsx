import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MultiSelect } from '.';
import { Field } from '../field';

const ITEMS = [{ value: 'a', label: 'A' }];

describe('MultiSelect', () => {
    describe('prop: invalid', () => {
        it('has the `aria-invalid` attribute', () => {
            const rendered = render(
                <MultiSelect.Root items={ITEMS} invalid>
                    <MultiSelect.Trigger />
                </MultiSelect.Root>,
            );

            expect(rendered.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
        });

        it('omits the `aria-invalid` attribute when `invalid` is not set', () => {
            const rendered = render(
                <MultiSelect.Root items={ITEMS}>
                    <MultiSelect.Trigger />
                </MultiSelect.Root>,
            );

            expect(rendered.getByRole('combobox')).not.toHaveAttribute('aria-invalid');
        });

        it('does not clobber `aria-invalid` computed by Field validation', async () => {
            const rendered = render(
                <Field.Root name="letters" validationMode="onBlur" validate={() => 'Required'}>
                    <MultiSelect.Root items={ITEMS} invalid={false}>
                        <MultiSelect.Trigger />
                    </MultiSelect.Root>
                    <Field.Error>Required</Field.Error>
                </Field.Root>,
            );
            const trigger = rendered.getByRole('combobox');

            await userEvent.click(trigger);
            await userEvent.keyboard('{Escape}');
            await userEvent.tab();

            expect(trigger).toHaveAttribute('aria-invalid', 'true');
        });
    });

    describe('prop: required', () => {
        it('has the `aria-required` attribute', () => {
            const rendered = render(
                <MultiSelect.Root items={ITEMS} required>
                    <MultiSelect.Trigger />
                </MultiSelect.Root>,
            );

            expect(rendered.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
        });

        it('omits the `aria-required` attribute when `required` is not set', () => {
            const rendered = render(
                <MultiSelect.Root items={ITEMS}>
                    <MultiSelect.Trigger />
                </MultiSelect.Root>,
            );

            expect(rendered.getByRole('combobox')).not.toHaveAttribute('aria-required');
        });
    });
});
