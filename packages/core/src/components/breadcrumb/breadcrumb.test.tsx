import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import type { BreadcrumbRootProps } from './breadcrumb';
import { Breadcrumb } from './breadcrumb';

const BreadcrumbTest = (props: BreadcrumbRootProps) => {
    return (
        <Breadcrumb.Root {...props}>
            <Breadcrumb.List>
                <Breadcrumb.Item>
                    <Breadcrumb.Link href="home">Home</Breadcrumb.Link>
                </Breadcrumb.Item>

                <Breadcrumb.Separator />

                <Breadcrumb.Item>
                    <Breadcrumb.Ellipsis />
                </Breadcrumb.Item>

                <Breadcrumb.Separator />

                <Breadcrumb.Item>
                    <Breadcrumb.Link href="products" current>
                        Products
                    </Breadcrumb.Link>
                </Breadcrumb.Item>
            </Breadcrumb.List>
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
                <Breadcrumb.List>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="home" onClick={onClick}>
                            Home
                        </Breadcrumb.Link>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
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
                <Breadcrumb.List>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="home">Home</Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="away" onClick={onClick}>
                            Away
                        </Breadcrumb.Link>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
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
