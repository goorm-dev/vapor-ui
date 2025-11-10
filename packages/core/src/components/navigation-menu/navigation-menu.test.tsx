import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NavigationMenu } from '.';

const TRIGGER_1 = 'trigger-1';
const TRIGGER_2 = 'trigger-2';
const PANEL_LINK_1 = 'Link 1';
const PANEL_LINK_2 = 'Link 2';
const PANEL_LINK_3 = 'Link 3';
const PANEL_LINK_4 = 'Link 4';

const NavigationMenuTest = (props: NavigationMenu.Root.Props) => {
    return (
        <NavigationMenu.Root {...props}>
            <NavigationMenu.List>
                <NavigationMenu.Item>
                    <NavigationMenu.Link href="#">Link</NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item value={TRIGGER_1}>
                    <NavigationMenu.Trigger>{TRIGGER_1}</NavigationMenu.Trigger>
                    <NavigationMenu.Panel>
                        <ul>
                            <NavigationMenu.Link href="#">{PANEL_LINK_1}</NavigationMenu.Link>
                            <NavigationMenu.Link href="#">{PANEL_LINK_2}</NavigationMenu.Link>
                        </ul>
                    </NavigationMenu.Panel>
                </NavigationMenu.Item>
                <NavigationMenu.Item value={TRIGGER_2}>
                    <NavigationMenu.Trigger>{TRIGGER_2}</NavigationMenu.Trigger>
                    <NavigationMenu.Panel>
                        <ul>
                            <NavigationMenu.Link href="#">{PANEL_LINK_3}</NavigationMenu.Link>
                            <NavigationMenu.Link href="#">{PANEL_LINK_4}</NavigationMenu.Link>
                        </ul>
                    </NavigationMenu.Panel>
                </NavigationMenu.Item>
            </NavigationMenu.List>

            <NavigationMenu.Portal>
                <NavigationMenu.Positioner>
                    <NavigationMenu.Popup>
                        <NavigationMenu.Viewport />
                    </NavigationMenu.Popup>
                </NavigationMenu.Positioner>
            </NavigationMenu.Portal>
        </NavigationMenu.Root>
    );
};

describe('<NavigationMenu.Root />', () => {
    afterEach(cleanup);

    /**
     * FIXME
     * This is failing due to an issue with AXE core and not our implementation.
     * We will need to revisit this when we upgrade or replace AXE core.
     * @link https://github.com/dequelabs/axe-core/issues/4832
     */
    // it('should have no a11y violations', async () => {
    //     const rendered = render(<NavigationMenuTest aria-label="Main" defaultValue={TRIGGER_1} />);
    //     const result = await axe(rendered.container);

    //     expect(result).toHaveNoViolations();
    // });

    it('should open the panel when the trigger is clicked', async () => {
        const user = userEvent.setup();
        const rendered = render(<NavigationMenuTest aria-label="Main" />);
        const trigger = rendered.getByRole('button', { name: TRIGGER_1 });

        expect(screen.queryByText(PANEL_LINK_1)).not.toBeInTheDocument();

        await user.click(trigger);

        expect(screen.getByText(PANEL_LINK_1)).toBeInTheDocument();
    });

    describe('prop: defaultValue', () => {
        it('should open the panel when defaultValue is set', () => {
            const rendered = render(
                <NavigationMenuTest aria-label="Main" defaultValue={TRIGGER_1} />,
            );
            const link1 = rendered.getByText(PANEL_LINK_1);

            expect(link1).toBeInTheDocument();
        });
    });

    describe('prop: value', () => {
        it('should open the panel when value is set', () => {
            const rendered = render(<NavigationMenuTest aria-label="Main" value={TRIGGER_1} />);
            const link1 = rendered.getByText(PANEL_LINK_1);

            expect(link1).toBeInTheDocument();
        });

        it('should not close the panel when the trigger is clicked and value is set', async () => {
            const rendered = render(<NavigationMenuTest aria-label="Main" value={TRIGGER_1} />);
            const trigger1 = rendered.getByRole('button', { name: TRIGGER_1 });
            const trigger2 = rendered.getByRole('button', { name: TRIGGER_2 });
            const link1 = rendered.getByText(PANEL_LINK_1);
            const link3 = screen.queryByText(PANEL_LINK_3);

            expect(link1).toBeInTheDocument();

            await userEvent.click(trigger1);
            expect(link1).toBeInTheDocument();

            await userEvent.click(trigger2);
            expect(link1).toBeInTheDocument();
            expect(link3).not.toBeInTheDocument();
        });

        it('should not close the panel when clicking outside and value is set', async () => {
            const rendered = render(<NavigationMenuTest aria-label="Main" value={TRIGGER_1} />);
            const link1 = rendered.getByText(PANEL_LINK_1);

            expect(link1).toBeInTheDocument();

            await userEvent.click(document.body);
            expect(link1).toBeInTheDocument();
        });
    });

    describe('prop: onValueChange', () => {
        it('should call onValueChange when the value changes', async () => {
            const handleValueChange = vi.fn();
            const rendered = render(
                <NavigationMenuTest aria-label="Main" onValueChange={handleValueChange} />,
            );
            const trigger1 = rendered.getByRole('button', { name: TRIGGER_1 });
            const trigger2 = rendered.getByRole('button', { name: TRIGGER_2 });

            act(() => trigger1.focus());
            await userEvent.keyboard('[Enter]');

            expect(handleValueChange).toHaveBeenCalled();
            expect(handleValueChange).toHaveBeenCalledWith(TRIGGER_1, expect.any(Object));

            act(() => trigger2.focus());
            await userEvent.keyboard('[Enter]');

            expect(handleValueChange).toHaveBeenCalledWith(TRIGGER_2, expect.any(Object));
        });
    });

    describe('keyboard navigation', () => {
        it('should open the panel when the trigger is focused and Enter is pressed', async () => {
            const rendered = render(<NavigationMenuTest aria-label="Main" />);
            const trigger = rendered.getByRole('button', { name: TRIGGER_1 });

            expect(screen.queryByText(PANEL_LINK_1)).not.toBeInTheDocument();

            act(() => trigger.focus());

            await userEvent.keyboard('[Enter]');

            expect(screen.getByText(PANEL_LINK_1)).toBeInTheDocument();
        });

        it('should open the panel when the trigger is focused and Space is pressed', async () => {
            const rendered = render(<NavigationMenuTest aria-label="Main" />);
            const trigger = rendered.getByRole('button', { name: TRIGGER_1 });

            expect(screen.queryByText(PANEL_LINK_1)).not.toBeInTheDocument();

            act(() => trigger.focus());

            await userEvent.keyboard('[Space]');

            expect(screen.getByText(PANEL_LINK_1)).toBeInTheDocument();
        });

        it('should focus the first item when the menu is opened via ArrowDown key', async () => {
            const rendered = render(<NavigationMenuTest aria-label="Main" />);
            const trigger = rendered.getByRole('button', { name: TRIGGER_1 });

            expect(screen.queryByText(PANEL_LINK_1)).not.toBeInTheDocument();

            act(() => trigger.focus());

            await userEvent.keyboard('[ArrowDown]');

            expect(screen.getByText(PANEL_LINK_1)).toBeInTheDocument();
            expect(screen.getByText(PANEL_LINK_1)).toHaveFocus();
        });

        it('should loop focus within the panel when using ArrowDown and ArrowUp keys', async () => {
            const rendered = render(
                <NavigationMenuTest aria-label="Main" defaultValue={TRIGGER_1} />,
            );

            const link1 = rendered.getByText(PANEL_LINK_1);
            const link2 = rendered.getByText(PANEL_LINK_2);

            expect(link1).toBeInTheDocument();

            act(() => link1.focus());

            await userEvent.keyboard('[ArrowDown]');
            expect(link2).toHaveFocus();

            await userEvent.keyboard('[ArrowDown]');
            expect(link1).toHaveFocus();

            await userEvent.keyboard('[ArrowUp]');
            expect(link2).toHaveFocus();

            await userEvent.keyboard('[ArrowUp]');
            expect(link1).toHaveFocus();
        });

        it('should move focus to the next trigger when pressed tab on the last item in the panel', async () => {
            const rendered = render(
                <NavigationMenuTest aria-label="Main" defaultValue={TRIGGER_1} />,
            );
            const trigger2 = rendered.getByRole('button', { name: TRIGGER_2 });
            const link2 = rendered.getByText(PANEL_LINK_2);

            expect(link2).toBeInTheDocument();

            act(() => link2.focus());
            await userEvent.keyboard('[Tab]');

            expect(trigger2).toHaveFocus();
        });

        it('should close panel when Escape is pressed', async () => {
            const rendered = render(
                <NavigationMenuTest aria-label="Main" defaultValue={TRIGGER_1} />,
            );
            const link2 = rendered.getByText(PANEL_LINK_2);

            expect(link2).toBeInTheDocument();

            await userEvent.keyboard('[Escape]');

            expect(link2).not.toBeInTheDocument();
        });
    });
});

describe('<NavigationMenu.Link />', () => {
    afterEach(cleanup);

    const NAV_LINK = 'nav-link';
    const NavLinkTest = (linkProps: NavigationMenu.Link.Props) => (
        <NavigationMenu.Root aria-label="Main">
            <NavigationMenu.List>
                <NavigationMenu.Item>
                    <NavigationMenu.Link data-testid={NAV_LINK} href="#" {...linkProps}>
                        Home
                    </NavigationMenu.Link>
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );

    it('should render with aria-current="page" when given selected', () => {
        const rendered = render(<NavLinkTest selected />);
        const link = rendered.getByTestId(NAV_LINK);

        expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('should render with aria-current="page" when clicked', async () => {
        let link;

        const rendered = render(<NavLinkTest selected />);
        link = rendered.getByTestId(NAV_LINK);

        await userEvent.click(link);

        link = screen.getByTestId(NAV_LINK);
        expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('should not clickable when disabled', async () => {
        const rendered = render(<NavLinkTest disabled />);
        const link = rendered.getByTestId(NAV_LINK);

        expect(link).toHaveAttribute('aria-disabled', 'true');

        await userEvent.click(link);

        expect(link).not.toHaveAttribute('aria-current', 'page');
    });
});
