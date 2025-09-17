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

    test('supports required prop', () => {
        render(<Textarea required />);

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveAttribute('aria-required', 'true');
    });

    describe('minHeight and maxHeight props', () => {
        test('applies custom minHeight and maxHeight with numbers', () => {
            render(<Textarea autoResize minHeight={100} maxHeight={300} data-testid="textarea" />);

            const textarea = screen.getByTestId('textarea');

            // CSS variables should be set with pixel values
            expect(textarea.style.getPropertyValue('--vapor-textarea-min-height')).toBe('100px');
            expect(textarea.style.getPropertyValue('--vapor-textarea-max-height')).toBe('300px');
        });

        test('applies custom minHeight and maxHeight with strings', () => {
            render(
                <Textarea autoResize minHeight="5rem" maxHeight="20rem" data-testid="textarea" />,
            );

            const textarea = screen.getByTestId('textarea');

            // CSS variables should be set with string values as-is
            expect(textarea.style.getPropertyValue('--vapor-textarea-min-height')).toBe('5rem');
            expect(textarea.style.getPropertyValue('--vapor-textarea-max-height')).toBe('20rem');
        });

        test('uses default values when minHeight and maxHeight are not provided', () => {
            render(<Textarea autoResize data-testid="textarea" />);

            const textarea = screen.getByTestId('textarea');

            // Should use default values
            expect(textarea.style.getPropertyValue('--vapor-textarea-min-height')).toBe('116px');
            expect(textarea.style.getPropertyValue('--vapor-textarea-max-height')).toBe('400px');
        });

        test('minHeight and maxHeight only affect autoResize variant', () => {
            const { rerender } = render(
                <Textarea minHeight={100} maxHeight={300} data-testid="textarea" />,
            );

            let textarea = screen.getByTestId('textarea');

            // CSS variables should still be set even without autoResize
            expect(textarea.style.getPropertyValue('--vapor-textarea-min-height')).toBe('100px');
            expect(textarea.style.getPropertyValue('--vapor-textarea-max-height')).toBe('300px');

            // But the actual CSS classes should not include autoResize styles
            expect(textarea).not.toHaveClass(/autoResize_true/);

            rerender(
                <Textarea autoResize minHeight={100} maxHeight={300} data-testid="textarea" />,
            );

            textarea = screen.getByTestId('textarea');
            expect(textarea).toHaveClass(/autoResize_true/);
        });
    });

    describe('autoResize functionality', () => {
        test('autoResize enables proper CSS classes', () => {
            render(<Textarea autoResize data-testid="textarea" />);

            const textarea = screen.getByTestId('textarea');
            expect(textarea).toHaveClass(/autoResize_true/);
        });

        test('autoResize with custom heights works together', () => {
            render(<Textarea autoResize minHeight={80} maxHeight={250} data-testid="textarea" />);

            const textarea = screen.getByTestId('textarea');

            // Should have autoResize class
            expect(textarea).toHaveClass(/autoResize_true/);

            // Should have custom height variables
            expect(textarea.style.getPropertyValue('--vapor-textarea-min-height')).toBe('80px');
            expect(textarea.style.getPropertyValue('--vapor-textarea-max-height')).toBe('250px');
        });
    });

    describe('CSS variable inheritance', () => {
        test('allows CSS variables to be overridden by external styles', () => {
            render(
                <Textarea
                    autoResize
                    minHeight={100}
                    maxHeight={300}
                    style={
                        {
                            '--vapor-textarea-min-height': '150px',
                            '--vapor-textarea-max-height': '500px',
                        } as React.CSSProperties
                    }
                    data-testid="textarea"
                />,
            );

            const textarea = screen.getByTestId('textarea');

            // External style should override props
            expect(textarea.style.getPropertyValue('--vapor-textarea-min-height')).toBe('150px');
            expect(textarea.style.getPropertyValue('--vapor-textarea-max-height')).toBe('500px');
        });

        test('supports mixed number and string height values', () => {
            render(
                <Textarea autoResize minHeight={100} maxHeight="25rem" data-testid="textarea" />,
            );

            const textarea = screen.getByTestId('textarea');

            expect(textarea.style.getPropertyValue('--vapor-textarea-min-height')).toBe('100px');
            expect(textarea.style.getPropertyValue('--vapor-textarea-max-height')).toBe('25rem');
        });
    });
});
