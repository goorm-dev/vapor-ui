import type { ComponentProps } from 'react';
import { createRef, forwardRef, useState } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { when } from '~/styles/mixins/logical-states';

import { SideNavigation } from '.';
import * as styles from './side-navigation.css';

interface SideNavigationTestProps extends SideNavigation.Root.Props {
    group?: ComponentProps<typeof SideNavigation.Group>;
}

const RouterLink = forwardRef<HTMLAnchorElement, ComponentProps<'a'>>(
    ({ children, ...props }, ref) => (
        <a ref={ref} data-router-link {...props}>
            {children}
        </a>
    ),
);

const SideNavigationTest = ({ group, ...props }: SideNavigationTestProps) => {
    return (
        <SideNavigation.Root aria-label="Service" {...props}>
            <SideNavigation.List>
                <SideNavigation.Item>
                    <SideNavigation.Link href="/overview">Overview</SideNavigation.Link>
                </SideNavigation.Item>
                <SideNavigation.Group {...group}>
                    <SideNavigation.Trigger>Usage</SideNavigation.Trigger>
                    <SideNavigation.Panel>
                        <SideNavigation.Item>
                            <SideNavigation.SubLink href="/usage/daily">
                                Daily
                            </SideNavigation.SubLink>
                        </SideNavigation.Item>
                        <SideNavigation.Item>
                            <SideNavigation.SubLink href="/usage/monthly">
                                Monthly
                            </SideNavigation.SubLink>
                        </SideNavigation.Item>
                    </SideNavigation.Panel>
                </SideNavigation.Group>
                <SideNavigation.Item>
                    <SideNavigation.Link href="/settings">Settings</SideNavigation.Link>
                </SideNavigation.Item>
            </SideNavigation.List>
        </SideNavigation.Root>
    );
};

describe('<SideNavigation />', () => {
    afterEach(cleanup);

    it('should have no a11y violations', async () => {
        const { container } = render(<SideNavigationTest group={{ defaultOpen: true }} />);

        expect(await axe(container)).toHaveNoViolations();
    });

    it('should have no a11y violations with the current page and disabled parts', async () => {
        const { container } = render(
            <SideNavigation.Root aria-label="Service">
                <SideNavigation.List>
                    <SideNavigation.Item>
                        <SideNavigation.Link href="/overview" current>
                            Overview
                        </SideNavigation.Link>
                    </SideNavigation.Item>
                    <SideNavigation.Group defaultOpen>
                        <SideNavigation.Trigger disabled>Usage</SideNavigation.Trigger>
                        <SideNavigation.Panel>
                            <SideNavigation.Item>
                                <SideNavigation.SubLink href="/usage/daily" current disabled>
                                    Daily
                                </SideNavigation.SubLink>
                            </SideNavigation.Item>
                        </SideNavigation.Panel>
                    </SideNavigation.Group>
                </SideNavigation.List>
            </SideNavigation.Root>,
        );

        expect(await axe(container)).toHaveNoViolations();
    });

    it('should render the parts as a nested list inside a navigation landmark', () => {
        render(<SideNavigationTest group={{ defaultOpen: true }} />);

        const nav = screen.getByRole('navigation', { name: 'Service' });
        const [list, panel] = screen.getAllByRole('list');

        expect(nav).toContainElement(list);
        expect(list.tagName).toBe('UL');
        expect(panel.tagName).toBe('UL');
        expect(list).toContainElement(panel);
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
        expect(screen.getByRole('button', { name: 'Usage' }).tagName).toBe('BUTTON');
        expect(screen.getByRole('link', { name: 'Overview' }).tagName).toBe('A');
    });

    it('should forward refs to the rendered elements', () => {
        const rootRef = createRef<HTMLElement>();
        const linkRef = createRef<HTMLAnchorElement>();
        const groupRef = createRef<HTMLLIElement>();
        const panelRef = createRef<HTMLUListElement>();

        render(
            <SideNavigation.Root ref={rootRef} aria-label="Service">
                <SideNavigation.List>
                    <SideNavigation.Item>
                        <SideNavigation.Link ref={linkRef} href="#">
                            Link
                        </SideNavigation.Link>
                    </SideNavigation.Item>
                    <SideNavigation.Group ref={groupRef} defaultOpen>
                        <SideNavigation.Trigger>Group</SideNavigation.Trigger>
                        <SideNavigation.Panel ref={panelRef}>
                            <SideNavigation.Item>
                                <SideNavigation.SubLink href="#">Sub</SideNavigation.SubLink>
                            </SideNavigation.Item>
                        </SideNavigation.Panel>
                    </SideNavigation.Group>
                </SideNavigation.List>
            </SideNavigation.Root>,
        );

        expect(rootRef.current?.tagName).toBe('NAV');
        expect(linkRef.current?.tagName).toBe('A');
        expect(groupRef.current?.tagName).toBe('LI');
        expect(panelRef.current?.tagName).toBe('UL');
    });

    describe('keyboard navigation', () => {
        it('should move focus through links and the trigger in DOM order with Tab', async () => {
            const user = userEvent.setup();
            render(<SideNavigationTest group={{ defaultOpen: true }} />);

            await user.tab();
            expect(screen.getByRole('link', { name: 'Overview' })).toHaveFocus();

            await user.tab();
            expect(screen.getByRole('button', { name: 'Usage' })).toHaveFocus();

            await user.tab();
            expect(screen.getByRole('link', { name: 'Daily' })).toHaveFocus();

            await user.tab();
            expect(screen.getByRole('link', { name: 'Monthly' })).toHaveFocus();

            await user.tab();
            expect(screen.getByRole('link', { name: 'Settings' })).toHaveFocus();

            await user.tab({ shift: true });
            expect(screen.getByRole('link', { name: 'Monthly' })).toHaveFocus();
        });

        it('should skip the sub links of a closed group with Tab', async () => {
            const user = userEvent.setup();
            render(<SideNavigationTest />);

            await user.tab();
            await user.tab();
            expect(screen.getByRole('button', { name: 'Usage' })).toHaveFocus();

            await user.tab();
            expect(screen.getByRole('link', { name: 'Settings' })).toHaveFocus();
        });

        it('should not move focus with the arrow keys', async () => {
            const user = userEvent.setup();
            render(<SideNavigationTest group={{ defaultOpen: true }} />);

            const trigger = screen.getByRole('button', { name: 'Usage' });
            trigger.focus();

            await user.keyboard('{ArrowDown}');
            expect(trigger).toHaveFocus();

            await user.keyboard('{ArrowUp}');
            expect(trigger).toHaveFocus();
        });

        it.each(['{Enter}', ' '])(
            'should toggle the group when the trigger gets %j',
            async (key) => {
                const user = userEvent.setup();
                render(<SideNavigationTest />);

                const trigger = screen.getByRole('button', { name: 'Usage' });
                trigger.focus();

                await user.keyboard(key);
                expect(screen.getByRole('link', { name: 'Daily' })).toBeInTheDocument();
                expect(trigger).toHaveAttribute('aria-expanded', 'true');

                await user.keyboard(key);
                expect(screen.queryByRole('link', { name: 'Daily' })).not.toBeInTheDocument();
                expect(trigger).toHaveAttribute('aria-expanded', 'false');
            },
        );
    });

    describe('pointer interaction', () => {
        it('should open and close the group when the trigger is clicked', async () => {
            const user = userEvent.setup();
            render(<SideNavigationTest />);

            const trigger = screen.getByRole('button', { name: 'Usage' });
            expect(screen.queryByRole('link', { name: 'Daily' })).not.toBeInTheDocument();

            await user.click(trigger);
            expect(screen.getByRole('link', { name: 'Daily' })).toBeInTheDocument();

            await user.click(trigger);
            expect(screen.queryByRole('link', { name: 'Daily' })).not.toBeInTheDocument();
        });

        it('should keep focus on the trigger after it toggles the group', async () => {
            const user = userEvent.setup();
            render(<SideNavigationTest />);

            const trigger = screen.getByRole('button', { name: 'Usage' });
            await user.click(trigger);

            expect(trigger).toHaveFocus();
        });

        it('should open the groups independently of each other', async () => {
            const user = userEvent.setup();
            render(
                <SideNavigation.Root aria-label="Service">
                    <SideNavigation.List>
                        {['A', 'B'].map((name) => (
                            <SideNavigation.Group key={name}>
                                <SideNavigation.Trigger>{`Group ${name}`}</SideNavigation.Trigger>
                                <SideNavigation.Panel>
                                    <SideNavigation.Item>
                                        <SideNavigation.SubLink href="#">
                                            {`Sub ${name}`}
                                        </SideNavigation.SubLink>
                                    </SideNavigation.Item>
                                </SideNavigation.Panel>
                            </SideNavigation.Group>
                        ))}
                    </SideNavigation.List>
                </SideNavigation.Root>,
            );

            await user.click(screen.getByRole('button', { name: 'Group A' }));
            await user.click(screen.getByRole('button', { name: 'Group B' }));

            expect(screen.getByRole('link', { name: 'Sub A' })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'Sub B' })).toBeInTheDocument();
        });

        it('should call onClick when a link is clicked', async () => {
            const user = userEvent.setup();
            const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
            render(
                <SideNavigation.Root aria-label="Service">
                    <SideNavigation.List>
                        <SideNavigation.Item>
                            <SideNavigation.Link href="/overview" onClick={onClick}>
                                Overview
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                    </SideNavigation.List>
                </SideNavigation.Root>,
            );

            await user.click(screen.getByRole('link', { name: 'Overview' }));

            expect(onClick).toHaveBeenCalledOnce();
        });

        it('should render the element given to render in place of the link', () => {
            render(
                <SideNavigation.Root aria-label="Service">
                    <SideNavigation.List>
                        <SideNavigation.Item>
                            <SideNavigation.Link href="/overview" current render={<RouterLink />}>
                                Overview
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                    </SideNavigation.List>
                </SideNavigation.Root>,
            );

            const link = screen.getByRole('link', { name: 'Overview' });

            expect(link).toHaveAttribute('data-router-link');
            expect(link).toHaveAttribute('href', '/overview');
            expect(link).toHaveAttribute('aria-current', 'page');
        });
    });

    describe('prop: open', () => {
        it('should start closed when defaultOpen is not set', () => {
            render(<SideNavigationTest />);

            expect(screen.getByRole('button', { name: 'Usage' })).toHaveAttribute(
                'aria-expanded',
                'false',
            );
            expect(screen.queryByRole('link', { name: 'Daily' })).not.toBeInTheDocument();
        });

        it('should start open when defaultOpen is set', () => {
            render(<SideNavigationTest group={{ defaultOpen: true }} />);

            expect(screen.getByRole('button', { name: 'Usage' })).toHaveAttribute(
                'aria-expanded',
                'true',
            );
            expect(screen.getByRole('link', { name: 'Daily' })).toBeInTheDocument();
        });

        it('should call onOpenChange with the next open state in uncontrolled mode', async () => {
            const user = userEvent.setup();
            const onOpenChange = vi.fn();
            render(<SideNavigationTest group={{ onOpenChange }} />);

            await user.click(screen.getByRole('button', { name: 'Usage' }));
            expect(onOpenChange).toHaveBeenLastCalledWith(true, expect.anything());

            await user.click(screen.getByRole('button', { name: 'Usage' }));
            expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything());
        });

        it('should follow the open prop and ignore the trigger when it is controlled', async () => {
            const user = userEvent.setup();
            const onOpenChange = vi.fn();
            const { rerender } = render(
                <SideNavigationTest group={{ open: false, onOpenChange }} />,
            );

            await user.click(screen.getByRole('button', { name: 'Usage' }));
            expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
            expect(screen.queryByRole('link', { name: 'Daily' })).not.toBeInTheDocument();

            rerender(<SideNavigationTest group={{ open: true, onOpenChange }} />);
            expect(screen.getByRole('link', { name: 'Daily' })).toBeInTheDocument();

            await user.click(screen.getByRole('button', { name: 'Usage' }));
            expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything());
            expect(screen.getByRole('link', { name: 'Daily' })).toBeInTheDocument();
        });

        it('should toggle when the parent updates the open state from onOpenChange', async () => {
            const user = userEvent.setup();
            const ControlledTest = () => {
                const [open, setOpen] = useState(false);

                return <SideNavigationTest group={{ open, onOpenChange: setOpen }} />;
            };
            render(<ControlledTest />);

            await user.click(screen.getByRole('button', { name: 'Usage' }));
            expect(screen.getByRole('link', { name: 'Daily' })).toBeInTheDocument();

            await user.click(screen.getByRole('button', { name: 'Usage' }));
            expect(screen.queryByRole('link', { name: 'Daily' })).not.toBeInTheDocument();
        });

        it('should not open a group because it holds the current page', () => {
            render(
                <SideNavigation.Root aria-label="Service">
                    <SideNavigation.List>
                        <SideNavigation.Group>
                            <SideNavigation.Trigger>Usage</SideNavigation.Trigger>
                            <SideNavigation.Panel>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="/usage/daily" current>
                                        Daily
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                            </SideNavigation.Panel>
                        </SideNavigation.Group>
                    </SideNavigation.List>
                </SideNavigation.Root>,
            );

            expect(screen.getByRole('button', { name: 'Usage' })).toHaveAttribute(
                'aria-expanded',
                'false',
            );
            expect(screen.queryByRole('link', { name: 'Daily' })).not.toBeInTheDocument();
        });
    });

    describe('prop: current', () => {
        it('should mark a link and a sub link as the current page', () => {
            render(
                <SideNavigation.Root aria-label="Service">
                    <SideNavigation.List>
                        <SideNavigation.Item>
                            <SideNavigation.Link href="/overview" current>
                                Overview
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                        <SideNavigation.Group defaultOpen>
                            <SideNavigation.Trigger>Usage</SideNavigation.Trigger>
                            <SideNavigation.Panel>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="/usage/daily" current>
                                        Daily
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                            </SideNavigation.Panel>
                        </SideNavigation.Group>
                    </SideNavigation.List>
                </SideNavigation.Root>,
            );

            for (const name of ['Overview', 'Daily']) {
                const link = screen.getByRole('link', { name });

                expect(link).toHaveAttribute('aria-current', 'page');
                expect(link).toHaveAttribute('data-current');
            }
        });

        it('should not mark a link as the current page by default', () => {
            render(<SideNavigationTest group={{ defaultOpen: true }} />);

            for (const link of screen.getAllByRole('link')) {
                expect(link).not.toHaveAttribute('aria-current');
                expect(link).not.toHaveAttribute('data-current');
            }
        });

        it('should not mark the group trigger when a sub link inside it is current', () => {
            render(
                <SideNavigation.Root aria-label="Service">
                    <SideNavigation.List>
                        <SideNavigation.Group defaultOpen>
                            <SideNavigation.Trigger>Usage</SideNavigation.Trigger>
                            <SideNavigation.Panel>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="/usage/daily" current>
                                        Daily
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                            </SideNavigation.Panel>
                        </SideNavigation.Group>
                    </SideNavigation.List>
                </SideNavigation.Root>,
            );

            const trigger = screen.getByRole('button', { name: 'Usage' });

            expect(trigger).not.toHaveAttribute('aria-current');
            expect(trigger).not.toHaveAttribute('data-current');
        });

        it('should pass the current state to a className function', () => {
            render(
                <SideNavigation.Root aria-label="Service">
                    <SideNavigation.List>
                        <SideNavigation.Item>
                            <SideNavigation.Link
                                href="/overview"
                                current
                                className={(state) => (state.current ? 'is-current' : 'is-idle')}
                            >
                                Overview
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                        <SideNavigation.Item>
                            <SideNavigation.Link
                                href="/settings"
                                className={(state) => (state.current ? 'is-current' : 'is-idle')}
                            >
                                Settings
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                    </SideNavigation.List>
                </SideNavigation.Root>,
            );

            expect(screen.getByRole('link', { name: 'Overview' })).toHaveClass('is-current');
            expect(screen.getByRole('link', { name: 'Settings' })).toHaveClass('is-idle');
        });
    });

    describe('prop: disabled', () => {
        it('should disable every link, sub link, and trigger when Root is disabled', () => {
            render(<SideNavigationTest disabled group={{ defaultOpen: true }} />);

            expect(screen.queryAllByRole('link')).toHaveLength(0);

            for (const name of ['Overview', 'Daily', 'Monthly', 'Settings']) {
                const link = screen.getByText(name);

                expect(link).not.toHaveAttribute('href');
                expect(link).toHaveAttribute('aria-disabled', 'true');
                expect(link).toHaveAttribute('data-disabled');
            }
            expect(screen.getByRole('button', { name: 'Usage' })).toHaveAttribute('data-disabled');
        });

        it('should not disable anything by default', () => {
            render(<SideNavigationTest group={{ defaultOpen: true }} />);

            for (const link of screen.getAllByRole('link')) {
                expect(link).toHaveAttribute('href');
                expect(link).not.toHaveAttribute('aria-disabled');
                expect(link).not.toHaveAttribute('data-disabled');
            }
            expect(screen.getByRole('button', { name: 'Usage' })).not.toHaveAttribute(
                'data-disabled',
            );
        });

        it('should drop the href and take the link out of the tab order when disabled', async () => {
            const user = userEvent.setup();
            render(
                <SideNavigation.Root aria-label="Service">
                    <SideNavigation.List>
                        <SideNavigation.Item>
                            <SideNavigation.Link href="/overview" disabled>
                                Overview
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                        <SideNavigation.Item>
                            <SideNavigation.Link href="/settings">Settings</SideNavigation.Link>
                        </SideNavigation.Item>
                    </SideNavigation.List>
                </SideNavigation.Root>,
            );

            const link = screen.getByText('Overview');
            expect(link).not.toHaveAttribute('href');
            expect(link).toHaveAttribute('aria-disabled', 'true');

            await user.tab();
            expect(screen.getByRole('link', { name: 'Settings' })).toHaveFocus();
        });

        it('should keep a disabled trigger from toggling its group', async () => {
            const user = userEvent.setup();
            const onOpenChange = vi.fn();
            render(<SideNavigationTest group={{ onOpenChange }} disabled />);

            const trigger = screen.getByRole('button', { name: 'Usage' });
            await user.click(trigger);
            trigger.focus();
            await user.keyboard('{Enter}');
            await user.keyboard(' ');

            expect(onOpenChange).not.toHaveBeenCalled();
            expect(screen.queryByRole('link', { name: 'Daily' })).not.toBeInTheDocument();
        });

        it('should let a part set disabled to false when Root is disabled', () => {
            render(
                <SideNavigation.Root aria-label="Service" disabled>
                    <SideNavigation.List>
                        <SideNavigation.Item>
                            <SideNavigation.Link href="/overview" disabled={false}>
                                Overview
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                        <SideNavigation.Item>
                            <SideNavigation.Link href="/settings">Settings</SideNavigation.Link>
                        </SideNavigation.Item>
                        <SideNavigation.Group defaultOpen>
                            <SideNavigation.Trigger disabled={false}>Usage</SideNavigation.Trigger>
                            <SideNavigation.Panel>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="/usage/daily" disabled={false}>
                                        Daily
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                            </SideNavigation.Panel>
                        </SideNavigation.Group>
                    </SideNavigation.List>
                </SideNavigation.Root>,
            );

            expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href');
            expect(screen.getByRole('link', { name: 'Daily' })).toHaveAttribute('href');
            expect(screen.getByRole('button', { name: 'Usage' })).not.toHaveAttribute(
                'data-disabled',
            );
            expect(screen.getByText('Settings')).not.toHaveAttribute('href');
        });

        it('should let a part set disabled to true when Root is not disabled', () => {
            render(
                <SideNavigation.Root aria-label="Service" disabled={false}>
                    <SideNavigation.List>
                        <SideNavigation.Item>
                            <SideNavigation.Link href="/overview" disabled>
                                Overview
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                        <SideNavigation.Item>
                            <SideNavigation.Link href="/settings">Settings</SideNavigation.Link>
                        </SideNavigation.Item>
                    </SideNavigation.List>
                </SideNavigation.Root>,
            );

            expect(screen.getByText('Overview')).toHaveAttribute('aria-disabled', 'true');
            expect(screen.getByRole('link', { name: 'Settings' })).not.toHaveAttribute(
                'aria-disabled',
            );
        });

        it('should keep the current page marked but not styled as current when disabled', () => {
            render(
                <SideNavigation.Root aria-label="Service">
                    <SideNavigation.List>
                        <SideNavigation.Item>
                            <SideNavigation.Link href="/overview" current disabled>
                                Disabled current
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                        <SideNavigation.Item>
                            <SideNavigation.Link href="/settings" current>
                                Enabled current
                            </SideNavigation.Link>
                        </SideNavigation.Item>
                    </SideNavigation.List>
                </SideNavigation.Root>,
            );

            const currentSelector = when.current().replace('&', '');
            const disabledCurrent = screen.getByText('Disabled current');
            const enabledCurrent = screen.getByText('Enabled current');

            expect(disabledCurrent).toHaveAttribute('aria-current', 'page');
            expect(disabledCurrent).toHaveAttribute('data-disabled');
            expect(disabledCurrent.matches(currentSelector)).toBe(false);
            expect(enabledCurrent.matches(currentSelector)).toBe(true);
        });

        it('should give a disabled current sub link the label weight of a non-current one', () => {
            render(
                <SideNavigation.Root aria-label="Service">
                    <SideNavigation.List>
                        <SideNavigation.Group defaultOpen>
                            <SideNavigation.Trigger>Usage</SideNavigation.Trigger>
                            <SideNavigation.Panel>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="/usage/daily" current disabled>
                                        Disabled current
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="/usage/monthly" current>
                                        Enabled current
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                            </SideNavigation.Panel>
                        </SideNavigation.Group>
                    </SideNavigation.List>
                </SideNavigation.Root>,
            );

            const disabledCurrent = screen.getByText('Disabled current');
            const enabledCurrent = screen.getByText('Enabled current');

            expect(disabledCurrent).toHaveAttribute('aria-current', 'page');
            expect(disabledCurrent).toHaveClass(styles.subLink({ current: false }));
            expect(disabledCurrent).not.toHaveClass(styles.subLink({ current: true }));
            expect(enabledCurrent).toHaveClass(styles.subLink({ current: true }));
        });

        it('should give a current sub link the non-current weight when Root is disabled', () => {
            render(
                <SideNavigation.Root aria-label="Service" disabled>
                    <SideNavigation.List>
                        <SideNavigation.Group defaultOpen>
                            <SideNavigation.Trigger>Usage</SideNavigation.Trigger>
                            <SideNavigation.Panel>
                                <SideNavigation.Item>
                                    <SideNavigation.SubLink href="/usage/daily" current>
                                        Daily
                                    </SideNavigation.SubLink>
                                </SideNavigation.Item>
                            </SideNavigation.Panel>
                        </SideNavigation.Group>
                    </SideNavigation.List>
                </SideNavigation.Root>,
            );

            expect(screen.getByText('Daily')).toHaveClass(styles.subLink({ current: false }));
        });
    });
});
