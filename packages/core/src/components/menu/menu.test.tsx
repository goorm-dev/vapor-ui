import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import type { MenuRootProps } from './menu';
import { Menu } from './menu';

const MenuTest = (props: MenuRootProps) => {
    return (
        <Menu.Root {...props} modal={false}>
            <Menu.Trigger>Open Menu</Menu.Trigger>
            <Menu.Content data-testid="menu-content">
                <Menu.Item>First</Menu.Item>
                <Menu.Item>Second</Menu.Item>
                <Menu.Item>Third</Menu.Item>
            </Menu.Content>
        </Menu.Root>
    );
};

describe('<Menu.Root />', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<MenuTest open />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    describe('keyboard navigation', () => {
        it('should open the menu on press "Enter"', async () => {
            const rendered = render(<MenuTest />);
            const trigger = rendered.getByRole('button', { name: 'Open Menu' });

            trigger.focus();
            await userEvent.keyboard('{Enter}');

            const content = rendered.queryByTestId('menu-content');
            expect(content).toBeInTheDocument();
        });

        it('should open the menu on press "Space"', async () => {
            const rendered = render(<MenuTest />);
            const trigger = rendered.getByRole('button', { name: 'Open Menu' });

            trigger.focus();
            await userEvent.keyboard('{Spacebar}');

            const content = rendered.queryByTestId('menu-content');
            expect(content).toBeInTheDocument();
        });

        it('should close the menu on press "Space"', async () => {
            const rendered = render(<MenuTest defaultOpen />);
            const trigger = rendered.getByRole('button', { name: 'Open Menu' });

            trigger.focus();
            await userEvent.keyboard('{Spacebar}');

            const content = rendered.queryByTestId('menu-content');
            expect(content).toBeInTheDocument();
        });
    });
});
