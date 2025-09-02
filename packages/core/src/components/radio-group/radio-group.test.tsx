import { act } from 'react';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import type { RadioGroupRootProps } from './radio-group';
import { RadioGroup } from './radio-group';

const OPTION_1 = 'Option 1';
const OPTION_2 = 'Option 2';

const RadioGroupTest = (props: RadioGroupRootProps) => {
    return (
        <RadioGroup.Root {...props}>
            <RadioGroup.Item value="option1">
                <RadioGroup.Control />
                {OPTION_1}
            </RadioGroup.Item>
            <RadioGroup.Item value="option2">
                <RadioGroup.Control />
                {OPTION_2}
            </RadioGroup.Item>
        </RadioGroup.Root>
    );
};

describe('RadioGroup', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<RadioGroupTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    it('should invoke onValueChange when an item is clicked', async () => {
        const onValueChange = vi.fn();
        const rendered = render(<RadioGroupTest onValueChange={onValueChange} />);
        const [firstItem] = rendered.getAllByRole('radio');

        await userEvent.click(firstItem);

        expect(onValueChange).toHaveBeenCalledOnce();
        expect(onValueChange).toHaveBeenCalledWith('option1');
    });

    it('should invoke onValueChange when an label is clicked', async () => {
        const onValueChange = vi.fn();
        const rendered = render(<RadioGroupTest onValueChange={onValueChange} />);
        const item = rendered.getByText(OPTION_1);

        await userEvent.click(item);

        expect(onValueChange).toHaveBeenCalledOnce();
        expect(onValueChange).toHaveBeenCalledWith('option1');
    });

    describe('prop: disabled', () => {
        it('should not have aria-disabled attribute when not disabled', () => {
            const rendered = render(<RadioGroupTest />);
            const root = rendered.getByRole('radiogroup');

            expect(root).not.toHaveAttribute('aria-disabled');
            expect(root).not.toHaveAttribute('data-disabled');
        });

        it('should have aria-disabled attribute', () => {
            const rendered = render(<RadioGroupTest disabled />);
            const root = rendered.getByRole('radiogroup');
            const [firstItem, secondItem] = rendered.getAllByRole('radio');

            // the root component does not support the disabled attribute directly, so use aria-disabled attributes.
            expect(root).toHaveAttribute('aria-disabled', 'true');
            expect(root).toHaveAttribute('data-disabled');

            expect(firstItem).toBeDisabled();
            expect(firstItem).toHaveAttribute('data-disabled');
            expect(secondItem).toBeDisabled();
            expect(secondItem).toHaveAttribute('data-disabled');
        });

        it('should not invoke onValueChange when an item is clicked', async () => {
            const onValueChange = vi.fn();
            const rendered = render(<RadioGroupTest disabled onValueChange={onValueChange} />);
            const [firstItem] = rendered.getAllByRole('radio');

            await userEvent.click(firstItem);

            expect(onValueChange).not.toHaveBeenCalled();
        });

        it('should not change its state when clicked', async () => {
            const rendered = render(<RadioGroupTest disabled />);
            const [firstItem] = rendered.getAllByRole('radio');

            expect(firstItem).not.toBeChecked();
            expect(firstItem).toHaveAttribute('aria-checked', 'false');

            await userEvent.click(firstItem);

            expect(firstItem).not.toBeChecked();
            expect(firstItem).toHaveAttribute('aria-checked', 'false');
        });
    });

    it('should propagate the name attribute to the input', () => {
        const name = 'test-radio-group';
        const rendered = render(
            <form>
                <RadioGroupTest name={name} />
            </form>,
        );

        const group = rendered.getByRole('radiogroup');
        const inputs = group.querySelectorAll<HTMLInputElement>('input[type="radio"]');

        inputs.forEach((input) => {
            expect(input).toHaveAttribute('name', name);
        });
    });

    it('should include the radio value in the form submission', async ({ skip }) => {
        if (isJSDOM) {
            // FormData is not available in JSDOM
            skip();
        }

        let stringifiedFormData = '';

        const rendered = render(
            <form
                onSubmit={(e) => {
                    e.preventDefault();

                    const formData = new FormData(e.currentTarget);
                    stringifiedFormData = new URLSearchParams(formData as never).toString();
                }}
            >
                <RadioGroup.Root name="radio-group-test">
                    <RadioGroup.Item value="a">
                        a
                        <RadioGroup.Control />
                    </RadioGroup.Item>
                    <RadioGroup.Item value="b">
                        b
                        <RadioGroup.Control />
                    </RadioGroup.Item>
                </RadioGroup.Root>

                <button type="submit">Submit</button>
            </form>,
        );

        const [radioA] = rendered.getAllByRole('radio');
        const submitButton = rendered.getByRole('button', { name: 'Submit' });

        await userEvent.click(submitButton);

        expect(stringifiedFormData).toBe('');

        await userEvent.click(radioA);
        await userEvent.click(submitButton);

        expect(stringifiedFormData).toBe('radio-group-test=a');
    });

    it('should change the checked state using the arrow keys', async () => {
        const rendered = render(
            <RadioGroup.Root>
                <RadioGroup.Item value="option1">
                    <RadioGroup.Control />
                    option1
                </RadioGroup.Item>
                <RadioGroup.Item value="option2">
                    <RadioGroup.Control />
                    option2
                </RadioGroup.Item>
                <RadioGroup.Item value="option3">
                    <RadioGroup.Control />
                    option3
                </RadioGroup.Item>
            </RadioGroup.Root>,
        );
        const [option1, option2, option3] = rendered.getAllByRole('radio');

        act(() => option1.focus());
        await userEvent.keyboard('[Space]');

        expect(option1).toHaveFocus();
        expect(option1).toBeChecked();

        await userEvent.keyboard('[ArrowDown]');
        await userEvent.keyboard('[Space]');

        expect(option2).toHaveFocus();
        expect(option2).toBeChecked();

        await userEvent.keyboard('[ArrowDown]');
        await userEvent.keyboard('[Space]');

        expect(option3).toHaveFocus();
        expect(option3).toBeChecked();

        await userEvent.keyboard('[ArrowUp]');
        await userEvent.keyboard('[Space]');
    });

    it('should not include disabled items during keyboard navigation', async () => {
        const rendered = render(
            <RadioGroup.Root>
                <RadioGroup.Item value="option1">
                    <RadioGroup.Control />
                    option1
                </RadioGroup.Item>
                <RadioGroup.Item value="option2" disabled>
                    <RadioGroup.Control />
                    option2
                </RadioGroup.Item>
                <RadioGroup.Item value="option3">
                    <RadioGroup.Control />
                    option3
                </RadioGroup.Item>
            </RadioGroup.Root>,
        );
        const [option1, _option2, option3] = rendered.getAllByRole('radio');

        act(() => option1.focus());
        await userEvent.keyboard('[Space]');

        expect(option1).toHaveFocus();
        expect(option1).toBeChecked();

        await userEvent.keyboard('[ArrowDown]');
        await userEvent.keyboard('[Space]');

        expect(option3).toHaveFocus();
        expect(option3).toBeChecked();

        await userEvent.keyboard('[ArrowUp]');
        await userEvent.keyboard('[Space]');

        expect(option1).toHaveFocus();
        expect(option1).toBeChecked();
    });

    it('should automatically select radio upon navigation', async () => {
        const rendered = render(<RadioGroupTest />);
        const [firstItem, secondItem] = rendered.getAllByRole('radio');

        act(() => firstItem.focus());

        expect(firstItem).toHaveFocus();
        expect(firstItem).not.toBeChecked();
        expect(secondItem).not.toBeChecked();

        await userEvent.keyboard('[ArrowDown]');

        expect(secondItem).toHaveFocus();

        /**
         * NOTE
         * - When userEvent.keyboard([ArrowDown]) is input in the test environment, the checked state does not automatically change.
         * - Therefore, userEvent.keyboard([Space]) has been temporarily added to manually toggle the state.
         *
         * @link https://github.com/radix-ui/primitives/issues/3076
         */
        await userEvent.keyboard('[Space]');

        expect(firstItem).not.toBeChecked();
        expect(secondItem).toBeChecked();
    });

    it('does not forward `value` prop', async () => {
        const rendered = render(
            <RadioGroup.Root value="test" data-testid="radio-group">
                <RadioGroup.Item value="">
                    <RadioGroup.Control />
                </RadioGroup.Item>
            </RadioGroup.Root>,
        );

        const root = rendered.getByTestId('radio-group');

        expect(root).not.toHaveAttribute('value');
    });

    it('sets tabIndex=0 to the correct element when focused', async () => {
        const rendered = render(
            <RadioGroup.Root defaultValue="b">
                <RadioGroup.Item value="a">
                    <RadioGroup.Control />
                </RadioGroup.Item>
                <RadioGroup.Item value="b">
                    <RadioGroup.Control />
                </RadioGroup.Item>
            </RadioGroup.Root>,
        );

        const [radioA, radioB] = rendered.getAllByRole('radio');

        await userEvent.tab();

        expect(radioA).toHaveAttribute('tabindex', '-1');
        expect(radioB).toHaveAttribute('tabindex', '0');
    });
});

const isJSDOM = /jsdom/.test(window.navigator.userAgent);
