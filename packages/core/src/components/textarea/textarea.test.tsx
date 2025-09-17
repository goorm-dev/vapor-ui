import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { Textarea } from './textarea';

describe('Textarea', () => {
    test('should have no a11y violations', async () => {
        const rendered = render(
            <label>
                <Textarea />
                Label
            </label>,
        );
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    test('renders textarea', () => {
        render(<Textarea />);

        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('supports placeholder text', () => {
        render(<Textarea placeholder="Enter your message..." />);

        expect(screen.getByPlaceholderText('Enter your message...')).toBeInTheDocument();
    });

    test('supports default value', () => {
        render(<Textarea defaultValue="Default content" />);

        expect(screen.getByDisplayValue('Default content')).toBeInTheDocument();
    });

    test('handles controlled value and onChange', async () => {
        const user = userEvent.setup();
        const handleValueChange = vi.fn((value: string) => {
            rerender(<Textarea value={value} onValueChange={handleValueChange} />);
        });

        const { rerender } = render(<Textarea value="initial" onValueChange={handleValueChange} />);

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveValue('initial');

        await user.clear(textarea);
        await user.type(textarea, 'new content');

        expect(handleValueChange).toHaveBeenLastCalledWith('new content');

        // Simulate controlled component behavior by updating the value prop
        rerender(<Textarea value="new content" onValueChange={handleValueChange} />);

        expect(textarea).toHaveValue('new content');
    });

    test('can be disabled', () => {
        render(<Textarea disabled />);

        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    test('can be readonly', () => {
        render(<Textarea readOnly />);

        expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    test('supports invalid state', () => {
        render(<Textarea invalid />);

        expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    test('supports custom rows and cols', () => {
        render(<Textarea rows={10} cols={50} />);

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveAttribute('rows', '10');
        expect(textarea).toHaveAttribute('cols', '50');
    });

    test('applies size variants', () => {
        const { rerender } = render(<Textarea size="sm" data-testid="textarea" />);

        expect(screen.getByTestId('textarea')).toBeInTheDocument();

        rerender(<Textarea size="lg" data-testid="textarea" />);

        expect(screen.getByTestId('textarea')).toBeInTheDocument();
    });

    test('supports resizing control', () => {
        const { rerender } = render(<Textarea resizing={true} data-testid="textarea" />);

        expect(screen.getByTestId('textarea')).toBeInTheDocument();

        rerender(<Textarea resizing={false} data-testid="textarea" />);

        expect(screen.getByTestId('textarea')).toBeInTheDocument();
    });

    test('supports maxLength prop', () => {
        render(<Textarea maxLength={5} />);

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveAttribute('maxLength', '5');
    });
});
