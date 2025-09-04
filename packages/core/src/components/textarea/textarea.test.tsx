import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { Textarea } from './textarea';

describe('Textarea', () => {
    test('renders textarea field', () => {
        render(
            <Textarea.Root>
                <Textarea.Field />
            </Textarea.Root>,
        );

        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('supports placeholder text', () => {
        render(
            <Textarea.Root placeholder="Enter your message...">
                <Textarea.Field />
            </Textarea.Root>,
        );

        expect(screen.getByPlaceholderText('Enter your message...')).toBeInTheDocument();
    });

    test('supports default value', () => {
        render(
            <Textarea.Root defaultValue="Default content">
                <Textarea.Field />
            </Textarea.Root>,
        );

        expect(screen.getByDisplayValue('Default content')).toBeInTheDocument();
    });

    test('handles controlled value and onChange', async () => {
        const user = userEvent.setup();
        const handleValueChange = vi.fn();

        render(
            <Textarea.Root value="initial" onValueChange={handleValueChange}>
                <Textarea.Field />
            </Textarea.Root>,
        );

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveValue('initial');

        await user.clear(textarea);
        await user.type(textarea, 'new content');

        expect(handleValueChange).toHaveBeenCalledWith('new content');
    });

    test('can be disabled', () => {
        render(
            <Textarea.Root disabled>
                <Textarea.Field />
            </Textarea.Root>,
        );

        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    test('can be readonly', () => {
        render(
            <Textarea.Root readOnly>
                <Textarea.Field />
            </Textarea.Root>,
        );

        expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    test('supports invalid state', () => {
        render(
            <Textarea.Root invalid>
                <Textarea.Field />
            </Textarea.Root>,
        );

        expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    test('supports custom rows and cols', () => {
        render(
            <Textarea.Root rows={10} cols={50}>
                <Textarea.Field />
            </Textarea.Root>,
        );

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveAttribute('rows', '10');
        expect(textarea).toHaveAttribute('cols', '50');
    });

    test('applies size variants', () => {
        const { rerender } = render(
            <Textarea.Root size="sm">
                <Textarea.Field data-testid="textarea" />
            </Textarea.Root>,
        );

        expect(screen.getByTestId('textarea')).toBeInTheDocument();

        rerender(
            <Textarea.Root size="lg">
                <Textarea.Field data-testid="textarea" />
            </Textarea.Root>,
        );

        expect(screen.getByTestId('textarea')).toBeInTheDocument();
    });

    test('supports resizing control', () => {
        const { rerender } = render(
            <Textarea.Root resizing={true}>
                <Textarea.Field data-testid="textarea" />
            </Textarea.Root>,
        );

        expect(screen.getByTestId('textarea')).toBeInTheDocument();

        rerender(
            <Textarea.Root resizing={false}>
                <Textarea.Field data-testid="textarea" />
            </Textarea.Root>,
        );

        expect(screen.getByTestId('textarea')).toBeInTheDocument();
    });
});