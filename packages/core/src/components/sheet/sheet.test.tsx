import { cleanup, render } from '@testing-library/react';
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
