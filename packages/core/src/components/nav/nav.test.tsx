import type { NavLinkProps, NavProps } from './nav';
import { Nav } from './nav';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

const NavTest = (props: NavProps) => {
    return (
        <Nav {...props}>
            <Nav.List>
                <Nav.Item>
                    <Nav.Link href="#">Home</Nav.Link>
                </Nav.Item>
            </Nav.List>
        </Nav>
    );
};

describe('Nav', () => {
    afterEach(cleanup);

    it('should have no a11y violations', async () => {
        const rendered = render(<NavTest label="Main" />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });
});

describe('Nav.Link', () => {
    afterEach(cleanup);

    const NAV_LINK = 'nav-link';
    const NavLinkTest = (linkProps: NavLinkProps) => (
        <Nav label="Main">
            <Nav.List>
                <Nav.Item>
                    <Nav.Link data-testid={NAV_LINK} href="#" {...linkProps}>
                        Home
                    </Nav.Link>
                </Nav.Item>
            </Nav.List>
        </Nav>
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
