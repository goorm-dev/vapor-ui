import { cleanup, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Sheet } from '.';

describe('Sheet', () => {
    const consoleWarnMockFunction = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    const consoleErrorMockFunction = vi.spyOn(console, 'error').mockImplementation(vi.fn());

    afterEach(() => {
        cleanup();
        consoleWarnMockFunction.mockClear();
        consoleErrorMockFunction.mockClear();
    });

    it('should have no a11y violations', async () => {
        const rendered = render(<SheetTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    /**
     * TODO
     * - After migrating from Radix UI to Base UI, activate the test below and modify the internal implementation as needed
     */
    // it('should display an error in the console when no title has been provided', async () => {
    //     const rendered = render(<NoTitleSheetTest />);
    //     const trigger = rendered.getByText(TRIGGER_TEXT);

    //     await userEvent.click(trigger);

    //     expect(consoleErrorMockFunction).toHaveBeenCalled();
    // });

    // it('should warn to the console when no description has been provided', async () => {
    //     const rendered = render(<NoDescriptionSheetTest />);
    //     const trigger = rendered.getByText(TRIGGER_TEXT);

    //     await userEvent.click(trigger);

    //     expect(consoleWarnMockFunction).toHaveBeenCalledTimes(1);
    // });

    it('should not warn to the console when aria-describedby is set to undefined', async () => {
        const rendered = render(<UndefinedDescriptionSheetTest />);
        const trigger = rendered.getByText(TRIGGER_TEXT);

        await userEvent.click(trigger);

        expect(consoleWarnMockFunction).not.toHaveBeenCalled();
    });

    it('should open the content when the trigger is clicked', async () => {
        const rendered = render(<SheetTest />);
        const trigger = rendered.getByText(TRIGGER_TEXT);

        await userEvent.click(trigger);

        expect(rendered.getByText(CLOSE_TEXT)).toBeInTheDocument();
    });

    it('should focus the close button when the trigger is clicked', async () => {
        const rendered = render(<SheetTest />);
        const trigger = rendered.getByText(TRIGGER_TEXT);

        await userEvent.click(trigger);

        expect(rendered.getByText(CLOSE_TEXT)).toHaveFocus();
    });

    it('should close the content when the close button is clicked', async () => {
        const rendered = render(<SheetTest />);
        const trigger = rendered.getByText(TRIGGER_TEXT);

        await userEvent.click(trigger);
        const closeButton = rendered.getByText(CLOSE_TEXT);

        await userEvent.click(closeButton);

        expect(rendered.queryByText(CLOSE_TEXT)).not.toBeInTheDocument();
    });

    it('should close the content when the escape key is pressed', async () => {
        const rendered = render(<SheetTest />);
        const trigger = rendered.getByText(TRIGGER_TEXT);

        await userEvent.click(trigger);
        const content = rendered.getByRole('dialog');

        await userEvent.keyboard('{Escape}');

        expect(content).not.toBeInTheDocument();
    });

    /**
     * TODO
     * - Activate the test below depending on the need for closeOnEscape
     */
    // it('should not close the content when the escape key is pressed if closeOnEscape is false', async () => {
    //     const rendered = render(<SheetTest closeOnEscape={false} />);
    //     const trigger = rendered.getByText(TRIGGER_TEXT);

    //     await userEvent.click(trigger);
    //     const content = rendered.getByRole('Sheet');

    //     await userEvent.keyboard('{Escape}');

    //     expect(content).toBeInTheDocument();
    // });

    it('should close the content when the overlay is clicked', async () => {
        const rendered = render(<SheetTest />);
        const trigger = rendered.getByText(TRIGGER_TEXT);

        await userEvent.click(trigger);
        const overlay = rendered.getByTestId(OVERLAY_TEXT);

        await userEvent.click(overlay);

        expect(rendered.queryByText(CLOSE_TEXT)).not.toBeInTheDocument();
    });

    it('should not close the content when the overlay is clicked if closeOnClickOverlay is false', async () => {
        const rendered = render(<SheetTest closeOnClickOverlay={false} />);
        const trigger = rendered.getByText(TRIGGER_TEXT);

        await userEvent.click(trigger);
        const overlay = rendered.getByTestId(OVERLAY_TEXT);

        await userEvent.click(overlay);

        expect(rendered.queryByText(CLOSE_TEXT)).toBeInTheDocument();
    });

    describe('ResizeHandle', () => {
        // jsdom has no layout: emulate measurement by deriving offsetWidth from the
        // inline width the hook writes, falling back to a 400px "rendered" popup.
        const originalOffsetWidth = Object.getOwnPropertyDescriptor(
            HTMLElement.prototype,
            'offsetWidth',
        )!;

        beforeEach(() => {
            Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
                configurable: true,
                get(this: HTMLElement) {
                    return parseFloat(this.style.width) || 400;
                },
            });
        });

        afterEach(() => {
            Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
        });

        it('should expose slider semantics from the popup CSS bounds', () => {
            const rendered = render(
                <ResizableSheetTest popupStyle={{ minWidth: 200, maxWidth: 500 }} />,
            );

            const handle = rendered.getByRole('slider');
            const popup = rendered.getByRole('dialog');

            // A left/right sheet resizes along x, so the slider value axis is horizontal.
            expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
            // Bounds come from the popup's computed min/max-width, not props.
            expect(handle).toHaveAttribute('aria-valuemin', '200');
            expect(handle).toHaveAttribute('aria-valuemax', '500');
            // Initial value is the measured popup size.
            expect(handle).toHaveAttribute('aria-valuenow', '400');
            expect(handle).toHaveAttribute('aria-valuetext', 'width 400 pixels');
            expect(handle).toHaveAttribute('aria-controls', popup.id);
            expect(handle).toHaveAttribute('tabindex', '0');
        });

        it('should resize with arrow keys following screen direction', async () => {
            const rendered = render(<ResizableSheetTest />);
            const handle = rendered.getByRole('slider');

            handle.focus();
            // A right-side sheet grows toward the viewport center (left).
            await userEvent.keyboard('{ArrowLeft}');
            expect(handle).toHaveAttribute('aria-valuetext', 'width 416 pixels');

            await userEvent.keyboard('{ArrowRight}');
            expect(handle).toHaveAttribute('aria-valuetext', 'width 400 pixels');
        });

        it('should jump to min/max size with Home/End and clamp within bounds', async () => {
            const rendered = render(
                <ResizableSheetTest popupStyle={{ minWidth: 300, maxWidth: 640 }} />,
            );
            const handle = rendered.getByRole('slider');

            handle.focus();
            await userEvent.keyboard('{Home}');
            expect(handle).toHaveAttribute('aria-valuenow', '300');
            expect(handle).toHaveAttribute('aria-valuetext', 'width 300 pixels');

            // Already at min — shrinking further stays clamped.
            await userEvent.keyboard('{ArrowRight}');
            expect(handle).toHaveAttribute('aria-valuenow', '300');

            await userEvent.keyboard('{End}');
            expect(handle).toHaveAttribute('aria-valuenow', '640');
        });

        it('should treat unresolved CSS bounds as unbounded — no valuemax, End is a no-op', async () => {
            // No min/max on the popup: nothing resolves to px.
            const rendered = render(<ResizableSheetTest />);
            const handle = rendered.getByRole('slider');

            expect(handle).toHaveAttribute('aria-valuemin', '0');
            expect(handle).not.toHaveAttribute('aria-valuemax');

            handle.focus();
            // End has no target when the max is unbounded — size must not change.
            await userEvent.keyboard('{End}');
            expect(handle).toHaveAttribute('aria-valuenow', '400');
        });

        it('should clamp a drag at the popup CSS bounds', () => {
            const rendered = render(
                <ResizableSheetTest popupStyle={{ minWidth: 300, maxWidth: 500 }} />,
            );
            const handle = rendered.getByRole('slider');
            const strip = handle.parentElement as HTMLElement;

            // Right-side sheet: moving left grows. 400 + 200 → capped at maxWidth 500.
            fireEvent.pointerDown(strip, { button: 0, pointerId: 1, clientX: 500 });
            fireEvent.pointerMove(window, { pointerId: 1, clientX: 300 });
            fireEvent.pointerUp(window, { pointerId: 1 });
            expect(handle).toHaveAttribute('aria-valuenow', '500');
        });

        it('should block keyboard resizing and focus when disabled', async () => {
            const rendered = render(<ResizableSheetTest disabled />);
            const handle = rendered.getByRole('slider');

            expect(handle).toHaveAttribute('aria-disabled', 'true');
            expect(handle).toHaveAttribute('tabindex', '-1');

            handle.focus();
            await userEvent.keyboard('{ArrowLeft}');
            expect(handle).toHaveAttribute('aria-valuetext', 'width 400 pixels');
        });

        it('should point aria-controls at a user-provided Popup id', () => {
            const rendered = render(<ResizableSheetTest popupId="custom-panel" />);

            const handle = rendered.getByRole('slider');
            const popup = rendered.getByRole('dialog');

            expect(popup).toHaveAttribute('id', 'custom-panel');
            expect(handle).toHaveAttribute('aria-controls', 'custom-panel');
        });

        it('should end the drag on pointercancel and stop tracking after', () => {
            const rendered = render(<ResizableSheetTest />);
            const handle = rendered.getByRole('slider');
            const strip = handle.parentElement as HTMLElement;

            // Right-side sheet grows when the pointer moves toward the viewport center (left).
            fireEvent.pointerDown(strip, { button: 0, pointerId: 1, clientX: 500 });
            fireEvent.pointerMove(window, { pointerId: 1, clientX: 460 });
            fireEvent.pointerCancel(window, { pointerId: 1 });
            expect(handle).toHaveAttribute('aria-valuenow', '440');

            // Listeners are gone: further moves must not resize.
            fireEvent.pointerMove(window, { pointerId: 1, clientX: 300 });
            fireEvent.pointerUp(window, { pointerId: 1 });
            expect(handle).toHaveAttribute('aria-valuenow', '440');
        });

        it('should ignore pointer events from other pointers mid-drag', () => {
            const rendered = render(<ResizableSheetTest />);
            const handle = rendered.getByRole('slider');
            const strip = handle.parentElement as HTMLElement;

            fireEvent.pointerDown(strip, { button: 0, pointerId: 1, clientX: 500 });
            // A second finger touching and lifting must not move or end this drag.
            fireEvent.pointerMove(window, { pointerId: 2, clientX: 300 });
            fireEvent.pointerUp(window, { pointerId: 2 });
            // The owning pointer still drives the size.
            fireEvent.pointerMove(window, { pointerId: 1, clientX: 460 });
            fireEvent.pointerUp(window, { pointerId: 1 });
            expect(handle).toHaveAttribute('aria-valuenow', '440');
        });

        it('should release window listeners when unmounted mid-drag', () => {
            const removeSpy = vi.spyOn(window, 'removeEventListener');
            const rendered = render(<ResizableSheetTest />);
            const strip = rendered.getByRole('slider').parentElement as HTMLElement;

            fireEvent.pointerDown(strip, { button: 0, pointerId: 1, clientX: 500 });
            rendered.unmount();

            expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
            expect(removeSpy).toHaveBeenCalledWith('pointercancel', expect.any(Function));
            removeSpy.mockRestore();
        });
    });

    it('should not close when provided keepMounted and closed', async () => {
        const rendered = render(
            <Sheet.Root>
                <Sheet.Trigger>{TRIGGER_TEXT}</Sheet.Trigger>

                <Sheet.Popup
                    data-testid="sheet-popup"
                    portalElement={<Sheet.PortalPrimitive keepMounted />}
                >
                    <Sheet.Title>{TITLE_TEXT}</Sheet.Title>
                    <Sheet.Description>{DESCRIPTION_TEXT}</Sheet.Description>
                </Sheet.Popup>
            </Sheet.Root>,
        );

        const popup = rendered.getByTestId('sheet-popup');

        expect(popup).toBeInTheDocument();
        expect(popup).not.toBeVisible();
    });
});

const TRIGGER_TEXT = 'Trigger';
const CLOSE_TEXT = 'Close';
const TITLE_TEXT = 'Sheet Title';
const DESCRIPTION_TEXT = 'This is a description of the Sheet.';
const OVERLAY_TEXT = 'Overlay';

const SheetTest = (props: Sheet.Root.Props) => {
    return (
        <Sheet.Root {...props}>
            <Sheet.Trigger>{TRIGGER_TEXT}</Sheet.Trigger>

            <Sheet.Popup overlayElement={<Sheet.OverlayPrimitive data-testid={OVERLAY_TEXT} />}>
                <Sheet.Header>
                    <Sheet.Title>{TITLE_TEXT}</Sheet.Title>
                </Sheet.Header>
                <Sheet.Body>
                    <Sheet.Description>{DESCRIPTION_TEXT}</Sheet.Description>
                </Sheet.Body>
                <Sheet.Footer>
                    <Sheet.Close>{CLOSE_TEXT}</Sheet.Close>
                </Sheet.Footer>
            </Sheet.Popup>
        </Sheet.Root>
    );
};

interface ResizableSheetTestProps {
    disabled?: boolean;
    popupId?: string;
    popupStyle?: React.CSSProperties;
}

const ResizableSheetTest = ({ disabled, popupId, popupStyle }: ResizableSheetTestProps) => {
    return (
        <Sheet.Root defaultOpen>
            <Sheet.Trigger>{TRIGGER_TEXT}</Sheet.Trigger>

            <Sheet.Popup id={popupId} style={popupStyle}>
                <Sheet.ResizeHandle disabled={disabled} />
                <Sheet.Header>
                    <Sheet.Title>{TITLE_TEXT}</Sheet.Title>
                </Sheet.Header>
                <Sheet.Body>
                    <Sheet.Description>{DESCRIPTION_TEXT}</Sheet.Description>
                </Sheet.Body>
            </Sheet.Popup>
        </Sheet.Root>
    );
};

const UndefinedDescriptionSheetTest = (props: Sheet.Root.Props) => {
    return (
        <Sheet.Root {...props}>
            <Sheet.Trigger>{TRIGGER_TEXT}</Sheet.Trigger>

            <Sheet.Popup aria-describedby={undefined}>
                <Sheet.Header>
                    <Sheet.Title>{TITLE_TEXT}</Sheet.Title>
                </Sheet.Header>

                <Sheet.Footer>
                    <Sheet.Close>{CLOSE_TEXT}</Sheet.Close>
                </Sheet.Footer>
            </Sheet.Popup>
        </Sheet.Root>
    );
};
