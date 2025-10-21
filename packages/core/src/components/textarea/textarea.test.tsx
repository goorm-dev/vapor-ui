import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { Textarea } from './textarea';

describe('Textarea', () => {
    afterEach(cleanup);

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

    test('supports placeholder text', () => {
        const placeholderText = 'Enter your message...';
        const rendered = render(<Textarea placeholder={placeholderText} />);

        expect(rendered.getByPlaceholderText(placeholderText)).toBeInTheDocument();
    });

    test('handles controlled value and onValueChange', async () => {
        const handleValueChange = vi.fn();
        const rendered = render(
            <Textarea
                data-testid="textarea"
                defaultValue="initial"
                onValueChange={handleValueChange}
            />,
        );

        const textarea = rendered.getByTestId('textarea');
        expect(textarea).toHaveValue('initial');

        await userEvent.clear(textarea);
        await userEvent.type(textarea, 'new content');

        expect(handleValueChange).toHaveBeenLastCalledWith('new content', expect.any(Object));
    });

    describe('prop: disabled', () => {
        it('should not have aria-disabled attribute when not disabled', () => {
            const rendered = render(<Textarea />);
            const textarea = rendered.getByRole('textbox');

            expect(textarea).not.toBeDisabled();
            expect(textarea).not.toHaveAttribute('data-disabled');
        });

        it('should have aria-disabled attribute', () => {
            const rendered = render(<Textarea disabled />);
            const textarea = rendered.getByRole('textbox');

            expect(textarea).toBeDisabled();
            expect(textarea).toHaveAttribute('data-disabled');
        });

        it('should not invoke onValueChange when typed', async () => {
            const onValueChange = vi.fn();
            const rendered = render(<Textarea disabled onValueChange={onValueChange} />);
            const textarea = rendered.getByRole('textbox');

            await userEvent.type(textarea, 'trying to type');

            expect(onValueChange).not.toHaveBeenCalled();
        });

        it('should not change its value when typed', async () => {
            const rendered = render(<Textarea disabled />);
            const textarea = rendered.getByRole('textbox');

            expect(textarea).toHaveValue('');
            await userEvent.type(textarea, 'trying to type');

            expect(textarea).toHaveValue('');
        });
    });

    describe('prop: readOnly', () => {
        afterEach(cleanup);

        it('should not have readonly attribute when not readOnly', () => {
            const rendered = render(<Textarea />);
            const textarea = rendered.getByRole('textbox');

            expect(textarea).not.toHaveAttribute('readonly');
        });

        it('should have readonly attribute when readOnly', () => {
            const rendered = render(<Textarea readOnly />);
            const textarea = rendered.getByRole('textbox');

            expect(textarea).toHaveAttribute('readonly');
        });

        it('should not invoke onValueChange when typed', async () => {
            const onValueChange = vi.fn();
            const rendered = render(<Textarea readOnly onValueChange={onValueChange} />);
            const textarea = rendered.getByRole('textbox');

            await userEvent.type(textarea, 'trying to type');

            expect(onValueChange).not.toHaveBeenCalled();
        });

        it('should not change its value when typed', async () => {
            const rendered = render(<Textarea readOnly />);
            const textarea = rendered.getByRole('textbox');

            expect(textarea).toHaveValue('');
            await userEvent.type(textarea, 'trying to type');

            expect(textarea).toHaveValue('');
        });

        it('should allow text selection in readonly mode', async () => {
            const rendered = render(<Textarea readOnly defaultValue="ReadOnly Content" />);
            const textarea = rendered.getByRole('textbox') as HTMLTextAreaElement;

            // Focus the textarea
            await userEvent.click(textarea);
            expect(textarea).toHaveFocus();

            // Select all text using select() method
            await userEvent.pointer([
                { keys: '[ControlLeft>]', target: textarea }, // Hold Control
                { keys: 'a', target: textarea }, // Press 'A' to select all
                { keys: '[/ControlLeft]', target: textarea }, // Release Control
            ]);

            expect(textarea.selectionEnd).toBe('ReadOnly Content'.length);

            //TODO - Copy Test
            // await userEvent.copy();
        });
    });

    test('supports invalid state', () => {
        render(<Textarea invalid />);

        expect(screen.getByRole('textbox')).toBeInvalid();
    });

    describe('prop: maxLength', () => {
        it('should limit input length', async () => {
            const rendered = render(<Textarea maxLength={5} />);
            const textarea = rendered.getByRole('textbox');

            await userEvent.type(textarea, 'Exceeding');

            expect(textarea).toHaveValue('Excee');
        });
    });

    describe('prop: required', () => {
        it('should be required when provided required props', () => {
            render(<Textarea required />);

            const textarea = screen.getByRole('textbox');
            expect(textarea).toBeRequired();
        });
    });
});
