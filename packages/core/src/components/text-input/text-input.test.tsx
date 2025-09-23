import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { TextInput, type TextInputProps } from './text-input';

const LABEL_TEXT = 'Label';
const TextInputTest = (props: TextInputProps) => {
    return (
        <label>
            {LABEL_TEXT}
            <TextInput {...props} />
        </label>
    );
};

describe('TextInput', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<TextInputTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    it('should associate the label with the input field', async () => {
        const rendered = render(<TextInputTest />);
        const label = rendered.getByText(LABEL_TEXT);
        const input = rendered.getByRole('textbox');

        await userEvent.click(label);

        expect(input).toHaveFocus();
    });

    it('should invoke onValueChange when the input value changes', async () => {
        const handleValueChange = vi.fn();
        const rendered = render(<TextInputTest onValueChange={handleValueChange} />);
        const input = rendered.getByRole('textbox');

        await userEvent.type(input, 'Testing');
        expect(handleValueChange).toHaveBeenLastCalledWith('Testing', expect.any(Event));
    });

    it('should be disabled and prevent input', async () => {
        const rendered = render(<TextInputTest disabled />);
        const input = rendered.getByRole('textbox');

        expect(input).toBeDisabled();
        await userEvent.type(input, 'Testing');
        expect(input).toHaveValue('');
    });

    it('should be readonly and prevent input', async () => {
        const rendered = render(<TextInputTest readOnly />);
        const input = rendered.getByRole('textbox');

        expect(input).toHaveAttribute('readonly');
        await userEvent.type(input, 'Testing');
        expect(input).toHaveValue('');
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
