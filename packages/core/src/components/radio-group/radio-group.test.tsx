import { act } from 'react';

import { Radio } from '@base-ui-components/react';
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
            <Radio.Root id="option1" value="option1" />
            <label htmlFor="option1">{OPTION_1}</label>

            <Radio.Root id="option2" value="option2" />
            <label htmlFor="option2">{OPTION_2}</label>
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
        expect(onValueChange).toHaveBeenCalledWith('option1', expect.any(Object));
    });

    it('should invoke onValueChange when an label is clicked', async () => {
        const onValueChange = vi.fn();
        const rendered = render(<RadioGroupTest onValueChange={onValueChange} />);
        const item = rendered.getByText(OPTION_1);

        await userEvent.click(item);

        expect(onValueChange).toHaveBeenCalledOnce();
        expect(onValueChange).toHaveBeenCalledWith('option1', expect.any(Object));
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
            const radioGroup = rendered.getByRole('radiogroup');
            const [firstItem, secondItem] = rendered.getAllByRole('radio');

            expect(radioGroup).toHaveAttribute('aria-disabled', 'true');
            expect(radioGroup).toHaveAttribute('data-disabled');

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

    it('should propagate the name attribute to the input', async () => {
        const name = 'test-radio-group';
        const rendered = render(<RadioGroupTest defaultValue={'option1'} name={name} />);

        const input = rendered.container.querySelector<HTMLInputElement>(`input[name="${name}"]`);
        expect(input).toBeInTheDocument();

        const [_, radio2] = rendered.getAllByRole('radio');
        await userEvent.click(radio2);

        expect(input).toHaveValue('option2');
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
                    <label htmlFor="a">a</label>
                    <Radio.Root id="a" value="a" />

                    <label htmlFor="b">b</label>
                    <Radio.Root id="b" value="b" />
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
                <Radio.Root id="option1" value="option1" />
                <label htmlFor="option1">option1</label>

                <Radio.Root id="option2" value="option2" />
                <label htmlFor="option2">option2</label>

                <Radio.Root id="option3" value="option3" />
                <label htmlFor="option3"> option3</label>
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
                <Radio.Root id="option1" value="option1" />
                <label htmlFor="option1">option1</label>

                <Radio.Root id="option2" value="option2" disabled />
                <label htmlFor="option2">option2</label>

                <Radio.Root id="option3" value="option3" />
                <label htmlFor="option3">option3</label>
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
        expect(firstItem).not.toBeChecked();
        expect(secondItem).toBeChecked();
    });

    it('sets tabIndex=0 to the correct element when focused', async () => {
        const rendered = render(
            <RadioGroup.Root defaultValue="b">
                <Radio.Root value="a" />
                <Radio.Root value="b" />
            </RadioGroup.Root>,
        );

        const [radioA, radioB] = rendered.getAllByRole('radio');

        await userEvent.tab();

        expect(radioA).toHaveAttribute('tabindex', '-1');
        expect(radioB).toHaveAttribute('tabindex', '0');
    });
});

const isJSDOM = /jsdom/.test(window.navigator.userAgent);
