import { createRef } from 'react';
import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Menu } from '.';

describe('Menu composite — DOM API', () => {
    afterEach(cleanup);

    const renderOpen = async (
        extraProps: Partial<React.ComponentProps<typeof Menu.Root>> = {},
        children?: React.ReactNode,
    ) => {
        const rendered = render(
            <Menu.Root trigger={<button type="button">열기</button>} {...extraProps}>
                {children ?? <Menu.Item label="사본" onClick={() => {}} />}
            </Menu.Root>,
        );

        await userEvent.click(rendered.getByText('열기'));

        return rendered;
    };

    it('forwards ref to the Popup DOM node', async () => {
        const ref = createRef<HTMLDivElement>();
        const rendered = await renderOpen({ ref });

        const menu = rendered.getByRole('menu');
        expect(ref.current).toBe(menu);
    });

    it('applies id to the Popup DOM node', async () => {
        const rendered = await renderOpen({ id: 'my-menu' });
        expect(rendered.getByRole('menu').id).toBe('my-menu');
    });

    it('merges className onto the Popup DOM node', async () => {
        const rendered = await renderOpen({ className: 'custom-menu' });
        const menu = rendered.getByRole('menu');

        expect(menu).toHaveClass('custom-menu');
        expect(menu.className.split(/\s+/).length).toBeGreaterThan(1);
    });

    it('forwards ref/id/className on Menu.Item', async () => {
        const ref = createRef<HTMLDivElement>();
        const rendered = await renderOpen(
            {},
            <Menu.Item
                ref={ref}
                id="item-copy"
                className="item-custom"
                label="사본"
                onClick={() => {}}
            />,
        );

        const item = rendered.getByRole('menuitem');
        expect(ref.current).toBe(item);
        expect(item.id).toBe('item-copy');
        expect(item.className).toContain('item-custom');
    });

    it('forwards id/className on Menu.Group', async () => {
        const rendered = await renderOpen(
            {},
            <Menu.Group label="그룹" id="g1" className="group-custom">
                <Menu.Item label="A" onClick={() => {}} />
            </Menu.Group>,
        );

        const group = rendered.getByRole('group');
        expect(group.id).toBe('g1');
        expect(group.className).toContain('group-custom');
    });
});
