import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { TextInput, type TextInputRootProps } from './text-input';

const LABEL_TEXT = 'Label';
const TextInputTest = (props: TextInputRootProps) => {
    return (
        <TextInput.Root {...props}>
            <TextInput.Label>{LABEL_TEXT}</TextInput.Label>
            <TextInput.Field />
        </TextInput.Root>
    );
};

describe('TextInput', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<TextInputTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    it('should associate the label with the input field', () => {
        const rendered = render(<TextInputTest />);
        const label = rendered.getByText(LABEL_TEXT) as HTMLLabelElement;
        const input = rendered.getByRole('textbox');

        expect(label.htmlFor).toBe(input.id);
    });

    it('should invoke onValueChange when the input value changes', async () => {
        const handleValueChange = vi.fn();
        const rendered = render(<TextInputTest onValueChange={handleValueChange} />);
        const input = rendered.getByRole('textbox');

        await userEvent.type(input, 'Testing');
        expect(handleValueChange).toHaveBeenCalledWith('Testing');
    });

    it('should render the proper value when typed', async () => {
        const rendered = render(<TextInputTest />);
        const input = rendered.getByRole('textbox');

        await userEvent.type(input, 'Testing');
        expect(input).toHaveValue('Testing');
    });

    it('should not typable when disabled', async () => {
        const rendered = render(<TextInputTest disabled />);
        const input = rendered.getByRole('textbox');

        await userEvent.type(input, 'Testing');
        expect(input).toHaveValue('');
        expect(input).toBeDisabled();
    });

    it('should not typable when readOnly', async () => {
        const rendered = render(<TextInputTest readOnly />);
        const input = rendered.getByRole('textbox');

        await userEvent.type(input, 'Testing');
        expect(input).toHaveValue('');
        expect(input).toHaveAttribute('readonly');
    });

    it('should have aria-invalid when invalid', () => {
        const rendered = render(<TextInputTest invalid />);
        const input = rendered.getByRole('textbox');

        expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should render placeholder text when not typed', async () => {
        const placeholderText = 'Enter text here';

        const rendered = render(<TextInputTest placeholder={placeholderText} />);
        const input = rendered.getByPlaceholderText(placeholderText);

        expect(input).toBeInTheDocument();
    });
});
