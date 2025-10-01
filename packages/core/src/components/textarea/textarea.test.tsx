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
        const handleValueChange = vi.fn((value: string, _event: Event) => {
            rerender(<Textarea value={value} onValueChange={handleValueChange} />);
        });

        const { rerender } = render(<Textarea value="initial" onValueChange={handleValueChange} />);

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveValue('initial');

        await user.clear(textarea);
        await user.type(textarea, 'new content');

        expect(handleValueChange).toHaveBeenLastCalledWith('new content', expect.any(Event));

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

        expect(screen.getByTestId('textarea')).toHaveClass(/size_sm/);

        rerender(<Textarea size="lg" data-testid="textarea" />);

        expect(screen.getByTestId('textarea')).toHaveClass(/size_lg/);
    });

    test('supports maxLength prop', () => {
        render(<Textarea maxLength={5} />);

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveAttribute('maxLength', '5');
    });

    test('supports required prop', () => {
        render(<Textarea required />);

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveAttribute('aria-required', 'true');
    });

    describe('autoResize functionality', () => {
        test('applies autoResize CSS classes when enabled', () => {
            render(<Textarea autoResize data-testid="textarea" />);

            const textarea = screen.getByTestId('textarea');

            expect(textarea).toHaveClass(/autoResize_true/);
        });

        test('does not apply autoResize CSS classes when disabled', () => {
            render(<Textarea data-testid="textarea" />);

            const textarea = screen.getByTestId('textarea');

            expect(textarea).not.toHaveClass(/autoResize_true/);
        });
    });

    describe('custom styling', () => {
        test('supports custom styles via style prop', () => {
            render(
                <Textarea
                    autoResize
                    style={{
                        minHeight: '150px',
                        maxHeight: '500px',
                    }}
                    data-testid="textarea"
                />,
            );

            const textarea = screen.getByTestId('textarea');

            // Custom styles should be applied
            expect(textarea.style.minHeight).toBe('150px');
            expect(textarea.style.maxHeight).toBe('500px');
        });

        test('supports className prop for additional styling', () => {
            render(<Textarea className="custom-textarea" data-testid="textarea" />);

            const textarea = screen.getByTestId('textarea');

            expect(textarea).toHaveClass('custom-textarea');
        });
    });
});
