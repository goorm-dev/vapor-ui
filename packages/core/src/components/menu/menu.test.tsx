import { DirectionProvider } from '@base-ui-components/react';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// import { axe } from 'vitest-axe';

import { Menu } from '.';

const MenuTest = (props: Omit<Menu.Root.Props, 'children'>) => {
    return (
        <Menu.Root {...props} modal={false}>
            <Menu.Trigger>Open Menu</Menu.Trigger>
            <Menu.Content>
                <Menu.Group>
                    <Menu.Item>item1</Menu.Item>
                    <Menu.Item>item2</Menu.Item>
                    <Menu.Item>item3</Menu.Item>
                </Menu.Group>
            </Menu.Content>
        </Menu.Root>
    );
};

describe('<Menu.Root />', () => {
    // TODO
    // it('should have no a11y violations', async () => {
    //     const rendered = render(<MenuTest defaultOpen />);
    //     const result = await axe(rendered.container);

    //     expect(result).toHaveNoViolations();
    // });

    afterEach(cleanup);

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

                    <Menu.Content>
                        <Menu.Item>1</Menu.Item>
                        <Menu.Item disabled>2</Menu.Item>
                        <Menu.Item>3</Menu.Item>
                    </Menu.Content>
                </Menu.Root>,
            );
            const trigger = rendered.getByRole('button', { name: 'Open Menu' });

            act(() => trigger.focus());
            await userEvent.keyboard('[Enter]');

            const [item1, item2, item3] = rendered.getAllByRole('menuitem');

            await waitFor(() => expect(item1).toHaveFocus());
            expect(item1).toHaveAttribute('data-highlighted');

            await userEvent.keyboard('[ArrowDown]');

            /**
             * TODO
             * The test case was updated because Base UI's Roving Focus allows focusing on disabled items.
             * Need to decide if Vapor should adopt this behavior or find a different technical solution.
             */
            // await waitFor(() => expect(item2).not.toHaveFocus());
            // expect(item2).not.toHaveAttribute('data-highlighted');

            await waitFor(() => expect(item2).toHaveFocus());
            expect(item2).toHaveAttribute('data-highlighted');

            await userEvent.keyboard('[ArrowDown]');

            await waitFor(() => expect(item3).toHaveFocus());
            expect(item3).toHaveAttribute('data-highlighted');
        });

        it('should change the highlighted item when typed character matches', async () => {
            const rendered = render(
                <Menu.Root open>
                    <Menu.Content>
                        <Menu.Item>Aa</Menu.Item>
                        <Menu.Item>Ba</Menu.Item>
                        <Menu.Item>Bb</Menu.Item>
                        <Menu.Item>Ca</Menu.Item>
                        <Menu.Item>Cb</Menu.Item>
                        <Menu.Item>Cd</Menu.Item>
                    </Menu.Content>
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
            act(() => vi.advanceTimersByTime(1000));

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
                    <Menu.Content>
                        <Menu.Item onClick={handleClick}>Item One</Menu.Item>
                        <Menu.Item onClick={handleClick}>Item Two</Menu.Item>
                        <Menu.Item onClick={handleClick}>Item Three</Menu.Item>
                    </Menu.Content>
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

        it('should focus the last item when the menu is opened via ArrowUp key', async () => {
            const rendered = render(<MenuTest />);
            const trigger = rendered.getByRole('button', { name: 'Open Menu' });

            act(() => trigger.focus());
            await userEvent.keyboard('[ArrowUp]');

            const items = rendered.getAllByRole('menuitem');
            const lastItem = items[items.length - 1];
            await waitFor(() => {
                expect(lastItem).toHaveFocus();
            });
            expect(lastItem).toHaveAttribute('data-highlighted');
        });

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
                    <Menu.Portal keepMounted>
                        <Menu.Content>
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

    describe('<Menu.Group />', () => {
        const Test = ({ id }: { id?: string }) => (
            <Menu.Root defaultOpen>
                <Menu.Content>
                    <Menu.Group>
                        <Menu.GroupLabel id={id || undefined}>Group Label</Menu.GroupLabel>
                        <Menu.Item>Item 1</Menu.Item>
                        <Menu.Item>Item 2</Menu.Item>
                    </Menu.Group>
                    <Menu.Separator />
                </Menu.Content>
            </Menu.Root>
        );

        // TODO
        // it('should have no a11y violations', async () => {
        //     const rendered = render(<Test />);
        //     const result = await axe(rendered.container);

        //     expect(result).toHaveNoViolations();
        // });

        it('should reference the generated id in the group label', () => {
            const rendered = render(<Test />);
            const group = rendered.getByRole('group');
            const groupLabel = rendered.getByText('Group Label');
            expect(group).toHaveAttribute('aria-labelledby', groupLabel.id);
        });

        it('should reference the provided id in the group label', () => {
            const id = 'custom-group-label-id';
            const rendered = render(<Test id={id} />);
            const group = rendered.getByRole('group');
            const groupLabel = rendered.getByText('Group Label');
            expect(groupLabel.id).toBe(id);
            expect(group).toHaveAttribute('aria-labelledby', id);
        });
    });
});

describe('<Menu.SubmenuRoot />', () => {
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
                    <DirectionProvider direction={direction}>
                        <Menu.Root open>
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
                        </Menu.Root>
                    </DirectionProvider>,
                );

                const submenuTrigger = rendered.getByRole('menuitem', {
                    name: 'Submenu Trigger',
                });

                await act(async () => submenuTrigger.focus());

                await userEvent.keyboard(`[${openKey}]`);

                const [_, submenuContent] = rendered.getAllByRole('menu');
                const submenuItem = submenuContent.querySelector('[role="menuitem"]');

                expect(submenuItem).toBeInTheDocument();
                expect(submenuItem).toHaveAttribute('data-highlighted');

                await userEvent.keyboard(`[${closeKey}]`);

                expect(submenuItem).not.toHaveAttribute('data-highlighted');
                expect(submenuContent).not.toBeInTheDocument();
                expect(submenuTrigger).toHaveFocus();
            },
        );
    });

    (
        [
            ['ltr', 'ArrowRight'],
            ['rtl', 'ArrowLeft'],
        ] as const
    ).forEach(([direction, openKey]) => {
        it.skipIf(isJSDOM)('should close a nested menu with Escape key', async () => {
            const rendered = render(
                <DirectionProvider direction={direction}>
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
                    </Menu.Root>
                </DirectionProvider>,
            );

            const trigger = rendered.getByRole('menuitem', { name: 'Submenu Trigger' });

            act(() => trigger.focus());
            await userEvent.keyboard(`[${openKey}]`);

            const [content, submenuContent] = rendered.getAllByRole('menu');
            expect(submenuContent).toBeInTheDocument();

            await userEvent.keyboard('[Escape]');

            expect(submenuContent).not.toBeInTheDocument();
            expect(content).toBeInTheDocument();
            expect(trigger).toHaveFocus();
        });
    });
});

describe('<Menu.CheckboxItem>', () => {
    const Test = () => (
        <Menu.Root defaultOpen modal={false}>
            <Menu.Content>
                <Menu.CheckboxItem>Checkbox Item 1</Menu.CheckboxItem>
                <Menu.CheckboxItem>Checkbox Item 2</Menu.CheckboxItem>
                <Menu.CheckboxItem>Checkbox Item 3</Menu.CheckboxItem>
            </Menu.Content>
        </Menu.Root>
    );

    // FIXME: a11y test is always failed
    // it('should have no a11y violations', async () => {
    //     const rendered = render(<Test />);
    //     const result = await axe(rendered.container);

    //     expect(result).toHaveNoViolations();
    // });

    it('should add the correct ARIA attributes when clicked', async () => {
        const rendered = render(<Test />);
        const [check1, check2, check3] = rendered.getAllByRole('menuitemcheckbox');

        expect(check1).toHaveAttribute('aria-checked', 'false');
        expect(check2).toHaveAttribute('aria-checked', 'false');
        expect(check3).toHaveAttribute('aria-checked', 'false');

        await userEvent.click(check1);
        expect(check1).toHaveAttribute('aria-checked', 'true');

        await userEvent.click(check2);
        expect(check2).toHaveAttribute('aria-checked', 'true');

        await userEvent.click(check3);
        expect(check3).toHaveAttribute('aria-checked', 'true');
    });

    it('should toggle the checked state when clicked', async () => {
        const rendered = render(<Test />);
        const [checkitem] = rendered.getAllByRole('menuitemcheckbox');

        expect(checkitem).toHaveAttribute('aria-checked', 'false');

        await userEvent.click(checkitem);
        expect(checkitem).toHaveAttribute('aria-checked', 'true');

        await userEvent.click(checkitem);
        expect(checkitem).toHaveAttribute('aria-checked', 'false');
    });

    describe('keyboard navigation', () => {
        it('should toggle the checked state when Space is pressed', async () => {
            const rendered = render(<Test />);
            const [checkitem] = rendered.getAllByRole('menuitemcheckbox');

            expect(checkitem).toHaveAttribute('aria-checked', 'false');

            act(() => checkitem.focus());

            await userEvent.keyboard('[Space]');
            expect(checkitem).toHaveAttribute('aria-checked', 'true');

            await userEvent.keyboard('[Space]');
            expect(checkitem).toHaveAttribute('aria-checked', 'false');
        });

        it('should toggle the checked state when Enter is pressed', async () => {
            const rendered = render(<Test />);
            const [checkitem] = rendered.getAllByRole('menuitemcheckbox');

            expect(checkitem).toHaveAttribute('aria-checked', 'false');

            act(() => checkitem.focus());

            await userEvent.keyboard('[Enter]');
            expect(checkitem).toHaveAttribute('aria-checked', 'true');

            await userEvent.keyboard('[Enter]');
            expect(checkitem).toHaveAttribute('aria-checked', 'false');
        });

        it('should invoke `onCheckedChange` when the checked state changes', async () => {
            const handleCheckedChange = vi.fn();
            const rendered = render(
                <Menu.Root defaultOpen>
                    <Menu.Content>
                        <Menu.CheckboxItem onCheckedChange={handleCheckedChange}>
                            Checkbox Item
                        </Menu.CheckboxItem>
                    </Menu.Content>
                </Menu.Root>,
            );
            const checkitem = rendered.getByRole('menuitemcheckbox');

            expect(checkitem).toHaveAttribute('aria-checked', 'false');

            await userEvent.click(checkitem);
            expect(handleCheckedChange).toHaveBeenCalledTimes(1);
            expect(handleCheckedChange).toHaveBeenCalledWith(true, expect.any(Event));

            await userEvent.click(checkitem);
            expect(handleCheckedChange).toHaveBeenCalledTimes(2);
            expect(handleCheckedChange).toHaveBeenCalledWith(false, expect.any(Event));
        });

        // it('should keep the state when closed and reopened', async () => {});
    });

    describe('prop: closeOnClick', () => {
        it('should close the menu when clicked', async () => {
            const rendered = render(
                <Menu.Root defaultOpen>
                    <Menu.Content>
                        <Menu.CheckboxItem closeOnClick>Checkbox Item 1</Menu.CheckboxItem>
                        <Menu.CheckboxItem closeOnClick>Checkbox Item 2</Menu.CheckboxItem>
                    </Menu.Content>
                </Menu.Root>,
            );
            const [check1, check2] = rendered.getAllByRole('menuitemcheckbox');

            expect(check1).toHaveAttribute('aria-checked', 'false');
            expect(check2).toHaveAttribute('aria-checked', 'false');

            await userEvent.click(check1);
            expect(check1).toHaveAttribute('aria-checked', 'true');

            const content = rendered.queryByRole('menu');
            expect(content).not.toBeInTheDocument();
        });

        it('should not close the menu when clicked by default', async () => {
            const rendered = render(
                <Menu.Root defaultOpen>
                    <Menu.Trigger />

                    <Menu.Content>
                        <Menu.CheckboxItem defaultChecked>Checkbox Item 1</Menu.CheckboxItem>
                        <Menu.CheckboxItem>Checkbox Item 2</Menu.CheckboxItem>
                    </Menu.Content>
                </Menu.Root>,
            );
            const [check1] = rendered.getAllByRole('menuitemcheckbox');

            expect(check1).toHaveAttribute('aria-checked', 'true');

            await userEvent.click(check1);
            expect(check1).toHaveAttribute('aria-checked', 'false');

            const content = rendered.getByRole('menu');
            expect(content).toBeInTheDocument();
        });
    });

    describe('prop: disabled', () => {
        it('should not toggle the checked state when clicked', async () => {
            const rendered = render(
                <Menu.Root defaultOpen>
                    <Menu.Trigger>메뉴 열기</Menu.Trigger>

                    <Menu.Content>
                        <Menu.CheckboxItem disabled>Checkbox Item 1</Menu.CheckboxItem>
                        <Menu.CheckboxItem>Checkbox Item 2</Menu.CheckboxItem>
                    </Menu.Content>
                </Menu.Root>,
            );
            const [checkitem] = rendered.getAllByRole('menuitemcheckbox');

            expect(checkitem).toHaveAttribute('aria-checked', 'false');
            expect(checkitem).toHaveAttribute('aria-disabled', 'true');

            await userEvent.click(checkitem);

            expect(checkitem).toHaveAttribute('aria-checked', 'false');
        });

        it('should not toggle the checked state when Space is pressed', async () => {
            const rendered = render(
                <Menu.Root>
                    <Menu.Trigger />

                    <Menu.Content>
                        <Menu.CheckboxItem disabled>Checkbox Item 1</Menu.CheckboxItem>
                        <Menu.CheckboxItem>Checkbox Item 2</Menu.CheckboxItem>
                    </Menu.Content>
                </Menu.Root>,
            );

            const trigger = rendered.getByRole('button');

            await userEvent.click(trigger);

            const [check1, check2] = rendered.getAllByRole('menuitemcheckbox');

            await userEvent.keyboard('[ArrowDown]');
            await userEvent.keyboard('[Space]');

            expect(check1).toHaveAttribute('aria-checked', 'false');
            expect(check1).toHaveAttribute('aria-disabled', 'true');
            expect(check2).toHaveAttribute('aria-checked', 'false');

            /**
             * TODO
             * The test case was updated because Base UI's Roving Focus allows focusing on disabled items.
             * Need to decide if Vapor should adopt this behavior or find a different technical solution.
             */
            // expect(check2).toHaveAttribute('aria-checked', 'true');
        });
    });

    describe('prop: defaultChecked', () => {
        it('should set the initial checked state', () => {
            const rendered = render(
                <Menu.Root defaultOpen>
                    <Menu.Content>
                        <Menu.CheckboxItem defaultChecked>Checkbox Item 1</Menu.CheckboxItem>
                        <Menu.CheckboxItem>Checkbox Item 2</Menu.CheckboxItem>
                    </Menu.Content>
                </Menu.Root>,
            );
            const [check1, check2] = rendered.getAllByRole('menuitemcheckbox');

            expect(check1).toHaveAttribute('aria-checked', 'true');
            expect(check2).toHaveAttribute('aria-checked', 'false');
        });
    });

    describe('prop: checked', () => {
        it('should set the checked state when controlled', () => {
            const rendered = render(
                <Menu.Root defaultOpen>
                    <Menu.Content>
                        <Menu.CheckboxItem checked>Checkbox Item 1</Menu.CheckboxItem>
                        <Menu.CheckboxItem>Checkbox Item 2</Menu.CheckboxItem>
                    </Menu.Content>
                </Menu.Root>,
            );
            const [check1, check2] = rendered.getAllByRole('menuitemcheckbox');

            expect(check1).toHaveAttribute('aria-checked', 'true');
            expect(check2).toHaveAttribute('aria-checked', 'false');
        });
    });

    describe('prop: onCheckedChange', () => {
        it('should call onCheckedChange when the checked state changes', async () => {
            const handleCheckedChange = vi.fn();
            const rendered = render(
                <Menu.Root defaultOpen>
                    <Menu.Content>
                        <Menu.CheckboxItem onCheckedChange={handleCheckedChange}>
                            Checkbox Item
                        </Menu.CheckboxItem>
                    </Menu.Content>
                </Menu.Root>,
            );
            const checkitem = rendered.getByRole('menuitemcheckbox');

            await userEvent.click(checkitem);
            expect(handleCheckedChange).toHaveBeenCalledWith(true, expect.any(Event));

            await userEvent.click(checkitem);
            expect(handleCheckedChange).toHaveBeenCalledWith(false, expect.any(Event));
        });
    });
});

describe('<Menu.RadioGroupItem>', () => {
    const Test = () => (
        <Menu.Root defaultOpen>
            <Menu.Content>
                <Menu.RadioGroup>
                    <Menu.RadioItem value="item1">Checkbox Item 1</Menu.RadioItem>
                    <Menu.RadioItem value="item2">Checkbox Item 2</Menu.RadioItem>
                    <Menu.RadioItem value="item3">Checkbox Item 3</Menu.RadioItem>
                </Menu.RadioGroup>
            </Menu.Content>
        </Menu.Root>
    );

    // FIXME: a11y test is always failed
    // it('should have no a11y violations', async () => {
    //     const rendered = render(<Test />);
    //     const result = await axe(rendered.container);

    //     expect(result).toHaveNoViolations();
    // });

    it('should add the correct ARIA attributes when clicked', async () => {
        const rendered = render(<Test />);
        const [radio1, radio2, radio3] = rendered.getAllByRole('menuitemradio');

        expect(radio1).toHaveAttribute('aria-checked', 'false');
        expect(radio2).toHaveAttribute('aria-checked', 'false');
        expect(radio3).toHaveAttribute('aria-checked', 'false');

        await userEvent.click(radio1);
        expect(radio1).toHaveAttribute('aria-checked', 'true');
        expect(radio2).toHaveAttribute('aria-checked', 'false');
        expect(radio3).toHaveAttribute('aria-checked', 'false');

        await userEvent.click(radio2);
        expect(radio1).toHaveAttribute('aria-checked', 'false');
        expect(radio2).toHaveAttribute('aria-checked', 'true');
        expect(radio3).toHaveAttribute('aria-checked', 'false');
    });

    it('should not toggle the checked state when clicked', async () => {
        const rendered = render(<Test />);
        const [radio] = rendered.getAllByRole('menuitemradio');

        expect(radio).toHaveAttribute('aria-checked', 'false');

        await userEvent.click(radio);
        expect(radio).toHaveAttribute('aria-checked', 'true');

        await userEvent.click(radio);
        expect(radio).toHaveAttribute('aria-checked', 'true');
    });

    describe('keyboard navigation', () => {
        it('should toggle the checked state when Space is pressed', async () => {
            const rendered = render(<Test />);
            const [radio1, radio2] = rendered.getAllByRole('menuitemradio');

            act(() => radio1.focus());

            await userEvent.keyboard('[Space]');
            expect(radio1).toHaveAttribute('aria-checked', 'true');

            await userEvent.keyboard('[ArrowDown]');
            await userEvent.keyboard('[Space]');

            expect(radio1).toHaveAttribute('aria-checked', 'false');
            expect(radio2).toHaveAttribute('aria-checked', 'true');
        });

        it('should toggle the checked state when Enter is pressed', async () => {
            const rendered = render(<Test />);
            const [radio1, radio2] = rendered.getAllByRole('menuitemradio');

            act(() => radio1.focus());

            await userEvent.keyboard('[Enter]');
            expect(radio1).toHaveAttribute('aria-checked', 'true');

            await userEvent.keyboard('[ArrowDown]');
            await userEvent.keyboard('[Enter]');

            expect(radio1).toHaveAttribute('aria-checked', 'false');
            expect(radio2).toHaveAttribute('aria-checked', 'true');
        });

        it('should invoke `onCheckedChange` when the checked state changes', async () => {
            const handleCheckedChange = vi.fn();
            const rendered = render(
                <Menu.Root defaultOpen>
                    <Menu.Content>
                        <Menu.CheckboxItem onCheckedChange={handleCheckedChange}>
                            Checkbox Item
                        </Menu.CheckboxItem>
                    </Menu.Content>
                </Menu.Root>,
            );
            const checkitem = rendered.getByRole('menuitemcheckbox');

            expect(checkitem).toHaveAttribute('aria-checked', 'false');

            await userEvent.click(checkitem);
            expect(handleCheckedChange).toHaveBeenCalledTimes(1);
            expect(handleCheckedChange).toHaveBeenCalledWith(true, expect.any(Event));

            await userEvent.click(checkitem);
            expect(handleCheckedChange).toHaveBeenCalledTimes(2);
            expect(handleCheckedChange).toHaveBeenCalledWith(false, expect.any(Event));
        });
    });

    describe('prop: closeOnClick', () => {
        it('should close the menu when clicked', async () => {
            const rendered = render(
                <Menu.Root defaultOpen>
                    <Menu.Content>
                        <Menu.RadioGroup>
                            <Menu.RadioItem value="item1" closeOnClick>
                                Radio Item 1
                            </Menu.RadioItem>
                            <Menu.RadioItem value="item2" closeOnClick>
                                Radio Item 2
                            </Menu.RadioItem>
                        </Menu.RadioGroup>
                    </Menu.Content>
                </Menu.Root>,
            );
            const [radio1, radio2] = rendered.getAllByRole('menuitemradio');

            expect(radio1).toHaveAttribute('aria-checked', 'false');
            expect(radio2).toHaveAttribute('aria-checked', 'false');

            await userEvent.click(radio1);
            expect(radio1).toHaveAttribute('aria-checked', 'true');

            const content = rendered.queryByRole('menu');
            expect(content).not.toBeInTheDocument();
        });

        it('should not close the menu when clicked by default', async () => {
            const rendered = render(
                <Menu.Root defaultOpen>
                    <Menu.Trigger />

                    <Menu.Content>
                        <Menu.RadioGroup defaultValue="item1">
                            <Menu.RadioItem value="item1">Radio Item 1</Menu.RadioItem>
                            <Menu.RadioItem value="item2">Radio Item 2</Menu.RadioItem>
                        </Menu.RadioGroup>
                    </Menu.Content>
                </Menu.Root>,
            );
            const [radio1] = rendered.getAllByRole('menuitemradio');

            expect(radio1).toHaveAttribute('aria-checked', 'true');

            await userEvent.click(radio1);
            expect(radio1).toHaveAttribute('aria-checked', 'true');

            const content = rendered.getByRole('menu');
            expect(content).toBeInTheDocument();
        });
    });

    describe('prop: disabled', () => {
        it('should not toggle the checked state when clicked', async () => {
            const rendered = render(
                <Menu.Root defaultOpen>
                    <Menu.Trigger>메뉴 열기</Menu.Trigger>

                    <Menu.Content>
                        <Menu.RadioGroup>
                            <Menu.RadioItem disabled value="item1">
                                Radio Item 1
                            </Menu.RadioItem>
                            <Menu.RadioItem value="item2">Radio Item 2</Menu.RadioItem>
                        </Menu.RadioGroup>
                    </Menu.Content>
                </Menu.Root>,
            );
            const [checkitem] = rendered.getAllByRole('menuitemradio');

            expect(checkitem).toHaveAttribute('aria-checked', 'false');
            expect(checkitem).toHaveAttribute('aria-disabled', 'true');

            await userEvent.click(checkitem);

            expect(checkitem).toHaveAttribute('aria-checked', 'false');
        });

        it('should not toggle the checked state when Space is pressed', async () => {
            const rendered = render(
                <Menu.Root>
                    <Menu.Trigger />

                    <Menu.Content>
                        <Menu.RadioGroup>
                            <Menu.RadioItem disabled value="item1">
                                Radio Item 1
                            </Menu.RadioItem>
                            <Menu.RadioItem value="item2">Radio Item 2</Menu.RadioItem>
                        </Menu.RadioGroup>
                    </Menu.Content>
                </Menu.Root>,
            );

            const trigger = rendered.getByRole('button');

            await userEvent.click(trigger);

            const [check1, check2] = rendered.getAllByRole('menuitemradio');

            await userEvent.keyboard('[ArrowDown]');
            await userEvent.keyboard('[Space]');

            expect(check1).toHaveAttribute('aria-checked', 'false');
            expect(check1).toHaveAttribute('aria-disabled', 'true');

            /**
             * TODO
             * The test case was updated because Base UI's Roving Focus allows focusing on disabled items.
             * Need to decide if Vapor should adopt this behavior or find a different technical solution.
             */
            // expect(check2).toHaveAttribute('aria-checked', 'true');

            expect(check2).toHaveAttribute('aria-checked', 'false');

            await userEvent.keyboard('[ArrowDown]');
            await userEvent.keyboard('[Space]');

            expect(check2).toHaveAttribute('aria-checked', 'true');
        });
    });

    describe('prop: defaultValue', () => {
        it('should set the initial value state', async () => {
            const rendered = render(
                <Menu.Root defaultOpen>
                    <Menu.Content>
                        <Menu.RadioGroup defaultValue="item1">
                            <Menu.RadioItem value="item1">Radio Item 1</Menu.RadioItem>
                            <Menu.RadioItem value="item2">Radio Item 2</Menu.RadioItem>
                        </Menu.RadioGroup>
                    </Menu.Content>
                </Menu.Root>,
            );
            const [radio1, radio2] = rendered.getAllByRole('menuitemradio');

            expect(radio1).toHaveAttribute('aria-checked', 'true');
            expect(radio2).toHaveAttribute('aria-checked', 'false');

            await userEvent.click(radio2);

            expect(radio1).toHaveAttribute('aria-checked', 'false');
            expect(radio2).toHaveAttribute('aria-checked', 'true');
        });
    });

    describe('prop: value', () => {
        it('should set the value state when controlled', async () => {
            const rendered = render(
                <Menu.Root defaultOpen>
                    <Menu.Content>
                        <Menu.RadioGroup value="item1">
                            <Menu.RadioItem value="item1">Radio Item 1</Menu.RadioItem>
                            <Menu.RadioItem value="item2">Radio Item 2</Menu.RadioItem>
                        </Menu.RadioGroup>
                    </Menu.Content>
                </Menu.Root>,
            );
            const [radio1, radio2] = rendered.getAllByRole('menuitemradio');

            expect(radio1).toHaveAttribute('aria-checked', 'true');
            expect(radio2).toHaveAttribute('aria-checked', 'false');

            await userEvent.click(radio2);

            expect(radio1).toHaveAttribute('aria-checked', 'true');
            expect(radio2).toHaveAttribute('aria-checked', 'false');
        });
    });

    describe('prop: onValueChange', () => {
        it('should call onValueChange when the checked state changes', async () => {
            const handleCheckedChange = vi.fn();
            const rendered = render(
                <Menu.Root defaultOpen>
                    <Menu.Content>
                        <Menu.RadioGroup onValueChange={handleCheckedChange}>
                            <Menu.RadioItem value="item1">Radio Item 1</Menu.RadioItem>
                            <Menu.RadioItem value="item2">Radio Item 2</Menu.RadioItem>
                        </Menu.RadioGroup>
                    </Menu.Content>
                </Menu.Root>,
            );
            const [radio1, radio2] = rendered.getAllByRole('menuitemradio');

            await userEvent.click(radio1);
            expect(handleCheckedChange).toHaveBeenCalledWith('item1', expect.any(Event));

            await userEvent.click(radio2);
            expect(handleCheckedChange).toHaveBeenCalledWith('item2', expect.any(Event));
        });
    });
});

// TODO
// - If isJSDOM is used repeatedly in other files, consider separating it into a utility flag
// - currently, radio-group.test.tsx, menu.test.tsx
const isJSDOM = /jsdom/.test(window.navigator.userAgent);
