import { useState } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, vi } from 'vitest';
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

const TextInputWithCountTest = (props: TextInputRootProps) => {
    return (
        <TextInput.Root {...props}>
            <TextInput.Label>{LABEL_TEXT}</TextInput.Label>
            <TextInput.Field />
            <TextInput.Count />
        </TextInput.Root>
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

    describe('TextInput.Count', () => {
        it('should display character count without maxLength', () => {
            render(<TextInputWithCountTest defaultValue="Hello" />);

            expect(screen.getByText('5')).toBeInTheDocument();
        });

        it('should display character count with maxLength', () => {
            render(<TextInputWithCountTest defaultValue="Hello" maxLength={10} />);

            expect(screen.getByText('5/10')).toBeInTheDocument();
        });

        it('should show count when exceeding maxLength', () => {
            render(<TextInputWithCountTest defaultValue="This is too long" maxLength={10} />);

            expect(screen.getByText('16/10')).toBeInTheDocument();
        });

        it('should update count when controlled value changes', async () => {
            const ControlledTextInputTest = () => {
                const [value, setValue] = useState('initial');
                return (
                    <TextInput.Root value={value} onValueChange={setValue} maxLength={10}>
                        <TextInput.Label>{LABEL_TEXT}</TextInput.Label>
                        <TextInput.Field />
                        <TextInput.Count />
                    </TextInput.Root>
                );
            };

            render(<ControlledTextInputTest />);

            expect(screen.getByText('7/10')).toBeInTheDocument();

            const input = screen.getByRole('textbox');
            await userEvent.clear(input);
            await userEvent.type(input, 'new');

            expect(screen.getByText('3/10')).toBeInTheDocument();
        });

        it('should support custom render props', () => {
            render(
                <TextInput.Root defaultValue="Hello" maxLength={10}>
                    <TextInput.Label>{LABEL_TEXT}</TextInput.Label>
                    <TextInput.Field />
                    <TextInput.Count>
                        {({ current, max }) => (
                            <span data-testid="custom-count">
                                {current} {max ? `of ${max}` : ''} chars
                            </span>
                        )}
                    </TextInput.Count>
                </TextInput.Root>,
            );

            expect(screen.getByTestId('custom-count')).toHaveTextContent('5 of 10 chars');
        });

        it('should support maxLength prop on input field', () => {
            render(<TextInputWithCountTest maxLength={5} />);
            const input = screen.getByRole('textbox');

            expect(input).toHaveAttribute('maxLength', '5');
        });

        it('should update count for uncontrolled inputs', async () => {
            render(<TextInputWithCountTest maxLength={10} />);

            expect(screen.getByText('0/10')).toBeInTheDocument();

            const input = screen.getByRole('textbox');
            await userEvent.type(input, 'test');

            expect(screen.getByText('4/10')).toBeInTheDocument();
        });

        it('should work when Field component is conditionally rendered', async () => {
            const ConditionalFieldTest = () => {
                const [showField, setShowField] = useState(false);
                return (
                    <div>
                        <button onClick={() => setShowField(true)}>Show Field</button>
                        <TextInput.Root maxLength={10}>
                            <TextInput.Label>{LABEL_TEXT}</TextInput.Label>
                            {showField && <TextInput.Field />}
                            <TextInput.Count />
                        </TextInput.Root>
                    </div>
                );
            };

            render(<ConditionalFieldTest />);

            // Initially, count should show 0/10 (no field rendered yet)
            expect(screen.getByText('0/10')).toBeInTheDocument();

            // Show the field
            await userEvent.click(screen.getByText('Show Field'));

            // Count should still work
            expect(screen.getByText('0/10')).toBeInTheDocument();

            // Type in the field
            const input = screen.getByRole('textbox');
            await userEvent.type(input, 'test');

            // Count should update correctly
            expect(screen.getByText('4/10')).toBeInTheDocument();
        });
    });
});
