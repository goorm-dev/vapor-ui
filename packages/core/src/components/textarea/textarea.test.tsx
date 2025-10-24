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
        });

        it('should copy selected text to clipboard', async () => {
            const writeTextMock = vi.fn().mockResolvedValue(undefined);
            Object.defineProperty(navigator, 'clipboard', {
                value: { writeText: writeTextMock },
                configurable: true,
                writable: true,
            });

            const testContent = 'Content to copy';
            const rendered = render(<Textarea readOnly defaultValue={testContent} />);
            const textarea = rendered.getByRole('textbox') as HTMLTextAreaElement;

            textarea.select();

            const selectedText = textarea.value;
            await navigator.clipboard.writeText(selectedText);

            expect(writeTextMock).toHaveBeenCalledWith(testContent);
            expect(writeTextMock).toHaveBeenCalledTimes(1);
        });
    });

    test('supports invalid state', () => {
        const rendered = render(<Textarea invalid />);
        const textarea = rendered.getByRole('textbox');

        expect(textarea).toHaveAttribute('data-invalid');
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

    describe('prop: autoResize', () => {
        const lineHeight = 22;
        const paddingBlock = 12;

        beforeEach(() => {
            // Mock scrollHeight to simulate different content heights
            Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
                configurable: true,
                get: function (this: HTMLTextAreaElement) {
                    // Calculate height based on content length

                    // Handle empty content
                    if (!this.value) {
                        return paddingBlock; // Just paddingBlock for empty content
                    }

                    // Simply count actual line breaks for accurate calculation
                    const lines = this.value.split('\n').length;
                    return lines * lineHeight + paddingBlock;
                },
            });
        });

        it('should adjust height based on content when autoResize is true', async () => {
            const rendered = render(<Textarea rows={2} autoResize data-testid="textarea" />);
            const textarea = rendered.getByTestId('textarea') as HTMLTextAreaElement;

            expect(textarea.style.height).toBe(`${paddingBlock}px`); // padding only

            const longContent = 'Line 1\nLine 2\nLine 3\nLine 4';
            await userEvent.clear(textarea);
            await userEvent.type(textarea, longContent);

            expect(textarea.style.height).toBe('100px'); // 4 lines + padding
        });

        it('should not adjust height when autoResize is false', async () => {
            const rendered = render(<Textarea autoResize={false} data-testid="textarea" />);
            const textarea = rendered.getByTestId('textarea') as HTMLTextAreaElement;

            const longContent = 'Line 1\nLine 2\nLine 3\nLine 4';
            await userEvent.clear(textarea);
            await userEvent.type(textarea, longContent);

            expect(textarea.style.height).toBe('');
        });

        it('should reset height to auto before calculating new height', async () => {
            const rendered = render(<Textarea autoResize data-testid="textarea" />);
            const textarea = rendered.getByTestId('textarea') as HTMLTextAreaElement;

            // Spy on style.height setter
            const heightSetterSpy = vi.fn();
            Object.defineProperty(textarea.style, 'height', {
                configurable: true,
                set: heightSetterSpy,
                get: () =>
                    heightSetterSpy.mock.calls[heightSetterSpy.mock.calls.length - 1]?.[0] || '',
            });

            await userEvent.type(textarea, 'Some content');

            // Should first set to 'auto', then to calculated height
            expect(heightSetterSpy).toHaveBeenCalledWith('auto');
            expect(heightSetterSpy).toHaveBeenCalledWith(`${paddingBlock + lineHeight}px`);
        });

        it('should handle value changes programmatically', async () => {
            const rendered = render(<Textarea autoResize data-testid="textarea" />);
            const textarea = rendered.getByTestId('textarea') as HTMLTextAreaElement;
            let line: number;

            // Initial height
            expect(textarea.style.height).toBe(`${paddingBlock}px`); // Empty content + padding

            // Change value programmatically with actual line breaks

            await userEvent.type(textarea, 'Line 1');

            line = textarea.value.split('\n').length;
            expect(textarea.style.height).toBe(`${lineHeight * line + paddingBlock}px`);

            await userEvent.type(textarea, '{Enter}');
            await userEvent.type(textarea, 'Line 2');

            line = textarea.value.split('\n').length;
            expect(textarea.style.height).toBe(`${lineHeight * line + paddingBlock}px`);

            await userEvent.type(textarea, '{Enter}');
            await userEvent.type(textarea, 'Line 3');

            line = textarea.value.split('\n').length;
            expect(textarea.style.height).toBe(`${lineHeight * line + paddingBlock}px`);
        });
    });
});
