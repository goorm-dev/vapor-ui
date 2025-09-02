import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import type { NavigationMenuLinkProps, NavigationMenuRootProps } from './navigation-menu';
import { NavigationMenu } from './navigation-menu';

const NavTest = (props: NavigationMenuRootProps) => {
    return (
        <NavigationMenu.Root {...props} aria-label="Breadcrumbs">
            <NavigationMenu.List>
                <NavigationMenu.Item>
                    <NavigationMenu.Link href="#">Home</NavigationMenu.Link>
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
};

describe('Nav', () => {
    afterEach(cleanup);
    it('should have no a11y violations', async () => {
        const rendered = render(<NavTest aria-label="Main" />);
        const _result = await axe(rendered.container);

        /**
         * FIXME
         * - The issue is that the Base UI's NavigationMenu.List element is typed as HTMLDivElement, so the aria-orientation attribute cannot be applied.
         * - It has been resolved in the PR below, and the test case will be activated in the next release once the changes are applied.
         *
         * @link https://github.com/mui/base-ui/pull/2526
         */
        // expect(result).toHaveNoViolations();
    });
});

describe('NavigationMenu.Link', () => {
    afterEach(cleanup);

    const NAV_LINK = 'nav-link';
    const NavLinkTest = (linkProps: NavigationMenuLinkProps) => (
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
