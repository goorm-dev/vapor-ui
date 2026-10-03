import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Breadcrumb } from '.';

describe('Breadcrumb', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<BreadcrumbTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    describe('ARIA attributes', () => {
        it('should have `aria-current="page"` when the item is current', () => {
            const rendered = render(<BreadcrumbTest />);
            const currentItem = rendered.getByRole('link', { name: 'Products' });

            expect(currentItem).toHaveAttribute('aria-current', 'page');
        });
    });

    describe('keyboard navigation', () => {
        it('should support keyboard navigation via Tab and Enter', async () => {
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
        });
    });

    describe('prop: current', () => {
        it('sets aria-current="page" on the active item', () => {
            const rendered = render(<BreadcrumbTest />);
            const currentItem = rendered.getByRole('link', { name: 'Products' });

            expect(currentItem).toHaveAttribute('aria-current', 'page');
        });
    });
});

const BreadcrumbTest = (props: Breadcrumb.Root.Props) => (
    <Breadcrumb.Root {...props}>
        <Breadcrumb.Item href="home">Home</Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item href="products" current>
            Products
        </Breadcrumb.Item>
    </Breadcrumb.Root>
);
