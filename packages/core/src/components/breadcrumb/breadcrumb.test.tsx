import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Breadcrumb } from '.';

const BreadcrumbTest = (props: Breadcrumb.Root.Props) => {
    return (
        <Breadcrumb.Root {...props}>
            <Breadcrumb.Item href="home">Home</Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Ellipsis />
            <Breadcrumb.Separator />
            <Breadcrumb.Item href="products" current>
                Products
            </Breadcrumb.Item>
        </Breadcrumb.Root>
    );
};

describe('Breadcrumb', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<BreadcrumbTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    it('should invoke the `onClick` handler when a link is clicked', async () => {
        const onClick = vi.fn();
        const rendered = render(
            <Breadcrumb.Root>
                <Breadcrumb.Item href="home" onClick={onClick}>
                    Home
                </Breadcrumb.Item>
            </Breadcrumb.Root>,
        );

        const link = rendered.getByRole('link', { name: 'Home' });

        await userEvent.click(link);

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(document.location.pathname).toBe('/home');
    });

    it('should support keyboard navigation', async () => {
        const onClick = vi.fn();
        render(
            <Breadcrumb.Root>
                <Breadcrumb.Item href="home">Home</Breadcrumb.Item>
                <Breadcrumb.Item href="away" onClick={onClick}>
                    Away
                </Breadcrumb.Item>
            </Breadcrumb.Root>,
        );

        await userEvent.tab();
        await userEvent.tab();
        await userEvent.keyboard('{Enter}');

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(document.location.pathname).toBe('/away');
    });

    describe('ARIA attributes', () => {
        it('should have the `aria-label` attribute on the root element', () => {
            const ARIA_LABEL = 'Breadcrumb Test';
            const rendered = render(<BreadcrumbTest aria-label={ARIA_LABEL} />);
            const root = rendered.getByRole('navigation');

            expect(root).toHaveAttribute('aria-label', ARIA_LABEL);
        });

        it('should have the `aria-current="page"` when the item is current', () => {
            const rendered = render(<BreadcrumbTest />);
            const currentItem = rendered.getByRole('link', { name: 'Products' });

            expect(currentItem).toHaveAttribute('aria-current', 'page');
        });
    });
});
