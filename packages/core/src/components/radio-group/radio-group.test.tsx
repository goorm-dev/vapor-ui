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
            <RadioGroup.Item value="option1" data-testid="option1-item">
                <RadioGroup.Label data-testid="option1-label">{OPTION_1}</RadioGroup.Label>
                <RadioGroup.Control data-testid="option1-control" />
            </RadioGroup.Item>
            <RadioGroup.Item value="option2" data-testid="option2-item">
                <RadioGroup.Label data-testid="option2-label">{OPTION_2}</RadioGroup.Label>
                <RadioGroup.Control data-testid="option2-control" />
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
        const item = rendered.getByTestId('option1-label');

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

    it('should include the radio value in the form', async ({ skip }) => {
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
                    const formDataObject = Object.fromEntries(
                        [...formData.entries()].map(([key, value]) => [
                            key,
                            typeof value === 'string' ? value : value.name,
                        ]),
                    );

                    stringifiedFormData = new URLSearchParams(formDataObject).toString();
                }}
            >
                <RadioGroup.Root name="radio-group-test">
                    <RadioGroup.Item value="a">
                        <RadioGroup.Label>a</RadioGroup.Label>
                        <RadioGroup.Control />
                    </RadioGroup.Item>
                    <RadioGroup.Item value="b">
                        <RadioGroup.Label>b</RadioGroup.Label>
                        <RadioGroup.Control />
                    </RadioGroup.Item>
                </RadioGroup.Root>

                <button type="submit" data-testid="submit">
                    Submit
                </button>
            </form>,
        );

        const [radioA] = rendered.getAllByRole('radio');
        const submitButton = rendered.getByTestId('submit');

        await userEvent.click(submitButton);

        expect(stringifiedFormData).toBe('');

        await userEvent.click(radioA);
        await userEvent.click(submitButton);

        expect(stringifiedFormData).toBe('radio-group-test=a');
    });
});

const isJSDOM = /jsdom/.test(window.navigator.userAgent);
