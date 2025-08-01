import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import type { MenuRootProps } from './menu';
import { Menu } from './menu';

const MenuTest = (props: MenuRootProps) => {
    return (
        <Menu.Root {...props} modal={false} side="bottom" sideOffset={8}>
            <Menu.Trigger>Open Menu</Menu.Trigger>
            <Menu.Portal>
                <Menu.Content>
                    <Menu.Item>item1</Menu.Item>
                    <Menu.Item>item2</Menu.Item>
                    <Menu.Item>item3</Menu.Item>
                </Menu.Content>
            </Menu.Portal>
        </Menu.Root>
    );
};

describe('<Menu.Root />', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<MenuTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    describe('keyboard navigation', () => {
        it('should open the menu when pressed "Enter"', async () => {
            const rendered = render(<MenuTest />);
            const trigger = rendered.getByRole('button', { name: 'Open Menu' });

            act(() => trigger.focus());
            await userEvent.keyboard('[Enter]');

            const content = rendered.queryByRole('menu');
            expect(content).toBeInTheDocument();
        });

        it('should open the menu when pressed "Space"', async () => {
            const rendered = render(<MenuTest />);
            const trigger = rendered.getByRole('button', { name: 'Open Menu' });

            act(() => trigger.focus());
            await userEvent.keyboard('[Space]');

            const content = rendered.queryByRole('menu');
            expect(content).toBeInTheDocument();
        });

        it('should close the menu when pressed "ESC"', async () => {
            const rendered = render(<MenuTest />);
            const trigger = rendered.getByRole('button', { name: 'Open Menu' });
            let content: HTMLElement | null;

            act(() => trigger.focus());
            await userEvent.keyboard('[Enter]');

            content = rendered.getByRole('menu');
            expect(content).toBeInTheDocument();

            await userEvent.keyboard('[Escape]');

            content = rendered.queryByRole('menu');
            expect(content).not.toBeInTheDocument();
        });

        it('changes the highlighted item using the arrow keys', async () => {
            const rendered = render(<MenuTest />);
            const trigger = rendered.getByRole('button', { name: 'Open Menu' });

            act(() => trigger.focus());
            await userEvent.keyboard('[Enter]');

            const [item1, item2, item3] = rendered.getAllByRole('menuitem');

            expect(item1).toHaveFocus();
            expect(item1).toHaveAttribute('data-highlighted');

            await userEvent.keyboard('[ArrowDown]');

            expect(item2).toHaveFocus();
            expect(item2).toHaveAttribute('data-highlighted');

            await userEvent.keyboard('[ArrowDown]');

            expect(item3).toHaveFocus();
            expect(item3).toHaveAttribute('data-highlighted');

            await userEvent.keyboard('[ArrowUp]');

            expect(item2).toHaveFocus();
            expect(item2).toHaveAttribute('data-highlighted');
        });

        it('changes the highlighted item using the Home and End keys', async () => {
            const rendered = render(<MenuTest />);
            const trigger = rendered.getByRole('button', { name: 'Open Menu' });

            act(() => trigger.focus());
            await userEvent.keyboard('[Enter]');

            const [item1, _, item3] = rendered.getAllByRole('menuitem');

            expect(item1).toHaveFocus();
            expect(item1).toHaveAttribute('data-highlighted');

            await userEvent.keyboard('[End]');

            expect(item3).toHaveFocus();
            expect(item3).toHaveAttribute('data-highlighted');

            await userEvent.keyboard('[Home]');

            expect(item1).toHaveFocus();
            expect(item1).toHaveAttribute('data-highlighted');
        });

        it('should not include disabled items during keyboard navigation', async () => {
            const rendered = render(
                <Menu.Root>
                    <Menu.Trigger>Open Menu</Menu.Trigger>
                    <Menu.Portal>
                        <Menu.Content>
                            <Menu.Item>1</Menu.Item>
                            <Menu.Item disabled>2</Menu.Item>
                            <Menu.Item>3</Menu.Item>
                        </Menu.Content>
                    </Menu.Portal>
                </Menu.Root>,
            );
            const trigger = rendered.getByRole('button', { name: 'Open Menu' });

            act(() => trigger.focus());
            await userEvent.keyboard('[Enter]');

            const [item1, item2, item3] = rendered.getAllByRole('menuitem');

            expect(item1).toHaveFocus();
            expect(item1).toHaveAttribute('data-highlighted');

            await userEvent.keyboard('[ArrowDown]');

            expect(item2).not.toHaveFocus();
            expect(item2).not.toHaveAttribute('data-highlighted');
            expect(item3).toHaveFocus();
            expect(item3).toHaveAttribute('data-highlighted');
        });

        it('should change the highlighted item when typed character matches', async () => {
            const rendered = render(
                <Menu.Root open>
                    <Menu.Portal>
                        <Menu.Content>
                            <Menu.Item>Aa</Menu.Item>
                            <Menu.Item>Ba</Menu.Item>
                            <Menu.Item>Bb</Menu.Item>
                            <Menu.Item>Ca</Menu.Item>
                            <Menu.Item>Cb</Menu.Item>
                            <Menu.Item>Cd</Menu.Item>
                        </Menu.Content>
                    </Menu.Portal>
                </Menu.Root>,
            );

            vi.useFakeTimers({ shouldAdvanceTime: true });
            userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });

            await userEvent.keyboard('[ArrowDown]');
            await userEvent.keyboard('c');

            const Ca = rendered.getByText('Ca');
            expect(Ca).toHaveFocus();
            expect(Ca).toHaveAttribute('data-highlighted');

            await userEvent.keyboard('d');

            const Cd = rendered.getByText('Cd');
            expect(Cd).toHaveFocus();
            expect(Cd).toHaveAttribute('data-highlighted');

            // This ensures that only the typing search timer runs for 1000ms, making it more predictable.
            await act(() => vi.advanceTimersByTime(1000));

            await userEvent.keyboard('b');

            const Ba = rendered.getByText('Ba');
            expect(Ba).toHaveFocus();
            expect(Ba).toHaveAttribute('data-highlighted');
            expect(Ba).toHaveAttribute('tabindex', '0');

            vi.runOnlyPendingTimers();
            vi.useRealTimers();
        });

        it('does not trigger the onClick event when Space is pressed during text navigation', async () => {
            const handleClick = vi.fn();
            const rendered = render(
                <Menu.Root open>
                    <Menu.Portal>
                        <Menu.Content>
                            <Menu.Item onClick={handleClick}>Item One</Menu.Item>
                            <Menu.Item onClick={handleClick}>Item Two</Menu.Item>
                            <Menu.Item onClick={handleClick}>Item Three</Menu.Item>
                        </Menu.Content>
                    </Menu.Portal>
                </Menu.Root>,
            );

            await userEvent.keyboard('[ArrowDown]');
            await userEvent.keyboard('Item T');

            const itemTwo = rendered.getByText('Item Two');
            expect(itemTwo).toHaveFocus();
            expect(itemTwo).toHaveAttribute('data-highlighted');

            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    describe('focus management', () => {
        it('should focus the first item when the menu is opened via keyboard', async () => {
            const rendered = render(<MenuTest />);
            const trigger = rendered.getByRole('button', { name: 'Open Menu' });

            act(() => trigger.focus());
            await userEvent.keyboard('[Enter]');

            const firstItem = rendered.getAllByRole('menuitem')[0];
            expect(firstItem).toHaveFocus();
            expect(firstItem).toHaveAttribute('data-highlighted');
        });

        it('should focus the first item when the menu is opened via ArrowDown key', async () => {
            const rendered = render(<MenuTest />);
            const trigger = rendered.getByRole('button', { name: 'Open Menu' });

            act(() => trigger.focus());
            await userEvent.keyboard('[ArrowDown]');

            const firstItem = rendered.getAllByRole('menuitem')[0];
            expect(firstItem).toHaveFocus();
            expect(firstItem).toHaveAttribute('data-highlighted');
        });

        /**
         * NOTE
         * - This test case currently does not work due to a bug in Radix UI.
         * - Once the bug in Radix UI is fixed, this test case can be reactivated.
         * - Issue link: https://github.com/radix-ui/primitives/issues/3640
         */
        // it('should focus the last item when the menu is opened via ArrowUp key', async () => {
        //     const rendered = render(<MenuTest />);
        //     const trigger = rendered.getByRole('button', { name: 'Open Menu' });

        //     act(() => trigger.focus());
        //     await userEvent.keyboard('[ArrowUp]');

        //     const items = rendered.getAllByRole('menuitem');
        //     const lastItem = items[items.length - 1];
        //     expect(lastItem).toHaveFocus();
        //     expect(lastItem).toHaveAttribute('data-highlighted');
        // });

        it('should focus the trigger when the menu is closed', async () => {
            const rendered = render(<MenuTest />);
            const trigger = rendered.getByRole('button', { name: 'Open Menu' });

            act(() => trigger.focus());
            await userEvent.keyboard('[Enter]');

            const content = rendered.getByRole('menu');
            expect(content).toBeInTheDocument();

            await userEvent.keyboard('[Escape]');

            expect(trigger).toHaveFocus();
        });

        it('should focus the trigger when the menu is closed but not unmounted', async () => {
            const rendered = render(
                <Menu.Root>
                    <Menu.Trigger>Open Menu</Menu.Trigger>
                    <Menu.Portal>
                        <Menu.Content forceMount>
                            <Menu.Item>A a</Menu.Item>
                            <Menu.Item>B a</Menu.Item>
                            <Menu.Item>B b</Menu.Item>
                        </Menu.Content>
                    </Menu.Portal>
                </Menu.Root>,
            );
            const trigger = rendered.getByRole('button', { name: 'Open Menu' });

            await userEvent.click(trigger);

            const item = rendered.getByRole('menuitem', { name: 'A a' });
            await userEvent.click(item);

            expect(trigger).toHaveFocus();
        });
    });

    describe('nested menus', () => {
        (
            [
                ['ltr', 'ArrowRight', 'ArrowLeft'],
                ['rtl', 'ArrowLeft', 'ArrowRight'],
            ] as const
        ).forEach(([direction, openKey, closeKey]) => {
            it.skipIf(isJSDOM)(
                `should open a nested menu of a ${direction.toUpperCase()} menu with ${openKey} key and close it with ${closeKey}`,
                async () => {
                    const rendered = render(
                        <Menu.Root dir={direction} open>
                            <Menu.Content>
                                <Menu.SubmenuRoot>
                                    <Menu.SubmenuTriggerItem>
                                        Submenu Trigger
                                    </Menu.SubmenuTriggerItem>
                                    <Menu.SubmenuContent>
                                        <Menu.Item>Item 1</Menu.Item>
                                        <Menu.Item>Item 1</Menu.Item>
                                    </Menu.SubmenuContent>
                                </Menu.SubmenuRoot>
                            </Menu.Content>
                        </Menu.Root>,
                    );

                    const trigger = rendered.getByRole('menuitem', {
                        name: 'Submenu Trigger',
                    });

                    act(() => trigger.focus());

                    await userEvent.keyboard(`[${openKey}]`);

                    const [_, submenuContent] = rendered.getAllByRole('menu');
                    const submenuItem = submenuContent.querySelector('[role="menuitem"]');

                    expect(submenuItem).toBeInTheDocument();
                    expect(submenuItem).toHaveAttribute('data-highlighted');

                    await userEvent.keyboard(`[${closeKey}]`);

                    expect(submenuItem).not.toHaveAttribute('data-highlighted');
                    expect(submenuContent).not.toBeInTheDocument();
                    expect(trigger).toHaveFocus();
                },
            );
        });

        it.skipIf(isJSDOM)('should close a nested menu with Escape key', async () => {
            const rendered = render(
                <Menu.Root defaultOpen>
                    <Menu.Content>
                        <Menu.SubmenuRoot defaultOpen>
                            <Menu.SubmenuTriggerItem>Submenu Trigger</Menu.SubmenuTriggerItem>
                            <Menu.SubmenuContent>
                                <Menu.Item>Item 1</Menu.Item>
                                <Menu.Item>Item 2</Menu.Item>
                            </Menu.SubmenuContent>
                        </Menu.SubmenuRoot>
                    </Menu.Content>
                </Menu.Root>,
            );

            const trigger = rendered.getByRole('menuitem', { name: 'Submenu Trigger' });

            act(() => trigger.focus());
            await userEvent.keyboard('[ArrowRight]');

            const [content, submenuContent] = rendered.getAllByRole('menu');
            expect(submenuContent).toBeInTheDocument();

            await userEvent.keyboard('[Escape]');

            expect(submenuContent).not.toBeInTheDocument();
            expect(content).toBeInTheDocument();
            expect(trigger).toHaveFocus();
        });

        it('should invoke onEscapeKeyDown when Escape key is pressed', async () => {
            const onEscapeKeyDown = vi.fn();
            const rendered = render(
                <Menu.Root defaultOpen>
                    <Menu.Content>
                        <Menu.SubmenuRoot>
                            <Menu.SubmenuTriggerItem>Submenu Trigger</Menu.SubmenuTriggerItem>
                            <Menu.SubmenuContent onEscapeKeyDown={onEscapeKeyDown}>
                                <Menu.Item>Item 1</Menu.Item>
                                <Menu.Item>Item 2</Menu.Item>
                            </Menu.SubmenuContent>
                        </Menu.SubmenuRoot>
                    </Menu.Content>
                </Menu.Root>,
            );

            const trigger = rendered.getByRole('menuitem', { name: 'Submenu Trigger' });

            act(() => trigger.focus());
            await userEvent.keyboard('[ArrowRight]');

            const [_, submenuContent] = rendered.getAllByRole('menu');
            expect(submenuContent).toBeInTheDocument();

            await userEvent.keyboard('[Escape]');

            expect(submenuContent).not.toBeInTheDocument();
            expect(trigger).toHaveFocus();
            expect(onEscapeKeyDown).toHaveBeenCalledOnce();
        });
    });
});

// TODO
// - If isJSDOM is used repeatedly in other files, consider separating it into a utility flag
// - currently, radio-group.test.tsx, menu.test.tsx
const isJSDOM = /jsdom/.test(window.navigator.userAgent);
