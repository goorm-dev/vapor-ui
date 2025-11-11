import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Dialog } from '.';

describe('Dialog', () => {
    const consoleWarnMockFunction = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    const consoleErrorMockFunction = vi.spyOn(console, 'error').mockImplementation(vi.fn());

    afterEach(() => {
        cleanup();
        consoleWarnMockFunction.mockClear();
        consoleErrorMockFunction.mockClear();
    });

    it('should have no a11y violations', async () => {
        const rendered = render(<DialogTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    /**
     * TODO
     * - After migrating from Radix UI to Base UI, activate the test below and modify the internal implementation as needed
     */
    // it('should display an error in the console when no title has been provided', async () => {
    //     const rendered = render(<NoTitleDialogTest />);
    //     const trigger = rendered.getByText(TRIGGER_TEXT);

    //     await userEvent.click(trigger);

    //     expect(consoleErrorMockFunction).toHaveBeenCalled();
    // });

    // it('should warn to the console when no description has been provided', async () => {
    //     const rendered = render(<NoDescriptionDialogTest />);
    //     const trigger = rendered.getByText(TRIGGER_TEXT);

    //     await userEvent.click(trigger);

    //     expect(consoleWarnMockFunction).toHaveBeenCalledTimes(1);
    // });

    it('should not warn to the console when aria-describedby is set to undefined', async () => {
        const rendered = render(<UndefinedDescriptionDialogTest />);
        const trigger = rendered.getByText(TRIGGER_TEXT);

        await userEvent.click(trigger);

        expect(consoleWarnMockFunction).not.toHaveBeenCalled();
    });

    it('should open the content when the trigger is clicked', async () => {
        const rendered = render(<DialogTest />);
        const trigger = rendered.getByText(TRIGGER_TEXT);

        await userEvent.click(trigger);

        expect(rendered.getByText(CLOSE_TEXT)).toBeInTheDocument();
    });

    it('should focus the close button when the trigger is clicked', async () => {
        const rendered = render(<DialogTest />);
        const trigger = rendered.getByText(TRIGGER_TEXT);

        await userEvent.click(trigger);

        expect(rendered.getByText(CLOSE_TEXT)).toHaveFocus();
    });

    it('should close the content when the close button is clicked', async () => {
        const rendered = render(<DialogTest />);
        const trigger = rendered.getByText(TRIGGER_TEXT);

        await userEvent.click(trigger);
        const closeButton = rendered.getByText(CLOSE_TEXT);

        await userEvent.click(closeButton);

        expect(rendered.queryByText(CLOSE_TEXT)).not.toBeInTheDocument();
    });

    it('should close the content when the escape key is pressed', async () => {
        const rendered = render(<DialogTest />);
        const trigger = rendered.getByText(TRIGGER_TEXT);

        await userEvent.click(trigger);
        const content = rendered.getByRole('dialog');

        await userEvent.keyboard('{Escape}');

        expect(content).not.toBeInTheDocument();
    });

    it('should close the content when the overlay is clicked', async () => {
        const rendered = render(
            <Dialog.Root>
                <Dialog.Trigger>{TRIGGER_TEXT}</Dialog.Trigger>
                <Dialog.PortalPrimitive>
                    <Dialog.OverlayPrimitive data-testid={OVERLAY_TEXT} />
                    <Dialog.Popup>
                        <Dialog.Close>{CLOSE_TEXT}</Dialog.Close>
                    </Dialog.Popup>
                </Dialog.PortalPrimitive>
            </Dialog.Root>,
        );
        const trigger = rendered.getByText(TRIGGER_TEXT);

        await userEvent.click(trigger);
        const overlay = rendered.getByTestId(OVERLAY_TEXT);
        const closeButton = rendered.getByText(CLOSE_TEXT);

        await userEvent.click(overlay);

        expect(closeButton).not.toBeInTheDocument();
    });

    it('should not close the content when the overlay is clicked if closeOnClickOverlay is false', async () => {
        const rendered = render(<DialogTest closeOnClickOverlay={false} />);
        const trigger = rendered.getByText(TRIGGER_TEXT);

        await userEvent.click(trigger);
        const overlay = rendered.getByTestId(OVERLAY_TEXT);

        await userEvent.click(overlay);

        expect(rendered.queryByText(CLOSE_TEXT)).toBeInTheDocument();
    });
});

const TRIGGER_TEXT = 'Trigger';
const CLOSE_TEXT = 'Close';
const TITLE_TEXT = 'Dialog Title';
const DESCRIPTION_TEXT = 'This is a description of the dialog.';
const OVERLAY_TEXT = 'Overlay';

const DialogTest = (props: Dialog.Root.Props) => {
    return (
        <Dialog.Root {...props}>
            <Dialog.Trigger>{TRIGGER_TEXT}</Dialog.Trigger>
            <Dialog.PortalPrimitive>
                <Dialog.OverlayPrimitive data-testid={OVERLAY_TEXT} />
                <Dialog.PopupPrimitive>
                    <Dialog.Header>
                        <Dialog.Title>{TITLE_TEXT}</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <Dialog.Description>{DESCRIPTION_TEXT}</Dialog.Description>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.Close>{CLOSE_TEXT}</Dialog.Close>
                    </Dialog.Footer>
                </Dialog.PopupPrimitive>
            </Dialog.PortalPrimitive>
        </Dialog.Root>
    );
};

// const NoTitleDialogTest = (props: DialogRootProps) => {
//     return (
//         <Dialog.Root {...props}>
//             <Dialog.Trigger>{TRIGGER_TEXT}</Dialog.Trigger>
//             <Dialog.Portal>
//                 <Dialog.Overlay />
//                 <Dialog.Content>
//                     <Dialog.Body>
//                         <Dialog.Description>{DESCRIPTION_TEXT}</Dialog.Description>
//                     </Dialog.Body>
//                     <Dialog.Footer>
//                         <Dialog.Close>{CLOSE_TEXT}</Dialog.Close>
//                     </Dialog.Footer>
//                 </Dialog.Content>
//             </Dialog.Portal>
//         </Dialog.Root>
//     );
// };

// const NoDescriptionDialogTest = (props: DialogRootProps) => {
//     return (
//         <Dialog.Root {...props}>
//             <Dialog.Trigger>{TRIGGER_TEXT}</Dialog.Trigger>
//             <Dialog.Portal>
//                 <Dialog.Overlay />
//                 <Dialog.Content>
//                     <Dialog.Header>
//                         <Dialog.Title>{TITLE_TEXT}</Dialog.Title>
//                     </Dialog.Header>
//                     <Dialog.Footer>
//                         <Dialog.Close>{CLOSE_TEXT}</Dialog.Close>
//                     </Dialog.Footer>
//                 </Dialog.Content>
//             </Dialog.Portal>
//         </Dialog.Root>
//     );
// };

const UndefinedDescriptionDialogTest = (props: Dialog.Root.Props) => {
    return (
        <Dialog.Root {...props}>
            <Dialog.Trigger>{TRIGGER_TEXT}</Dialog.Trigger>
            <Dialog.PortalPrimitive>
                <Dialog.OverlayPrimitive data-testid={OVERLAY_TEXT} />
                <Dialog.PopupPrimitive aria-describedby={undefined}>
                    <Dialog.Header>
                        <Dialog.Title>{TITLE_TEXT}</Dialog.Title>
                    </Dialog.Header>

                    <Dialog.Footer>
                        <Dialog.Close>{CLOSE_TEXT}</Dialog.Close>
                    </Dialog.Footer>
                </Dialog.PopupPrimitive>
            </Dialog.PortalPrimitive>
        </Dialog.Root>
    );
};
