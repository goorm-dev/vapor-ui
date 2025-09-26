import { act, cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import type { CollapsibleRootProps } from './collapsible';
import { Collapsible } from './collapsible';

const CollapsibleTest = (props: CollapsibleRootProps) => {
    return (
        <Collapsible.Root {...props}>
            <Collapsible.Trigger>Toggle</Collapsible.Trigger>
            <Collapsible.Panel>Panel</Collapsible.Panel>
        </Collapsible.Root>
    );
};

describe('<Collapsible />', () => {
    afterEach(cleanup);

    it('should have no a11y violations', async () => {
        const { container } = render(<CollapsibleTest defaultOpen />);
        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it('should invoke onOpenChange when trigger clicked', async () => {
        const onOpenChange = vi.fn();
        const rendered = render(<CollapsibleTest onOpenChange={onOpenChange} />);
        const trigger = rendered.getByRole('button', { name: 'Toggle' });

        await userEvent.click(trigger);

        expect(onOpenChange).toHaveBeenCalled();
        expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    describe('keyboard navigation', () => {
        it('should open and close the panel when pressed "Space"', async () => {
            const rendered = render(<CollapsibleTest />);
            const trigger = rendered.getByRole('button', { name: 'Toggle' });

            act(() => trigger.focus());
            await userEvent.keyboard('[Space]');

            const panel = rendered.queryByText('Panel');
            expect(panel).toBeInTheDocument();

            await userEvent.keyboard('[Space]');
            expect(panel).not.toBeInTheDocument();
        });

        it('should open and close the panel when pressed "Enter"', async () => {
            const rendered = render(<CollapsibleTest />);
            const trigger = rendered.getByRole('button', { name: 'Toggle' });

            act(() => trigger.focus());
            await userEvent.keyboard('[Enter]');

            const panel = rendered.queryByText('Panel');
            expect(panel).toBeInTheDocument();

            await userEvent.keyboard('[Enter]');
            expect(panel).not.toBeInTheDocument();
        });

        it('should not open the panel when provided disabled and pressed "Enter"', async () => {
            const rendered = render(<CollapsibleTest disabled />);
            const trigger = rendered.getByRole('button', { name: 'Toggle' });

            act(() => trigger.focus());
            await userEvent.keyboard('[Enter]');

            const panel = rendered.queryByText('Panel');
            expect(panel).not.toBeInTheDocument();
        });

        it('should not invoke onOpenChange when provided disabled and pressed "Enter"', async () => {
            const onOpenChange = vi.fn();
            const rendered = render(<CollapsibleTest disabled onOpenChange={onOpenChange} />);
            const trigger = rendered.getByRole('button', { name: 'Toggle' });

            act(() => trigger.focus());
            await userEvent.keyboard('[Enter]');

            expect(onOpenChange).not.toHaveBeenCalled();
        });
    });

    describe('prop: disabled', () => {
        it('should not open when disabled', async () => {
            const rendered = render(<CollapsibleTest disabled />);
            const trigger = rendered.getByRole('button', { name: 'Toggle' });
            const panel = rendered.queryByText('Panel');

            await userEvent.click(trigger);

            expect(trigger).toHaveAttribute('aria-expanded', 'false');
            expect(panel).not.toBeInTheDocument();
        });

        it('should not invoke onOpenChange when disabled', async () => {
            const onOpenChange = vi.fn();
            const rendered = render(<CollapsibleTest disabled onOpenChange={onOpenChange} />);
            const trigger = rendered.getByRole('button', { name: 'Toggle' });

            await userEvent.click(trigger);

            expect(onOpenChange).not.toHaveBeenCalled();
        });
    });

    describe('prop: keepMounted', () => {
        it('should keep the panel in DOM but hidden when closed', async () => {
            const rendered = render(
                <Collapsible.Root>
                    <Collapsible.Trigger>Toggle</Collapsible.Trigger>
                    <Collapsible.Panel keepMounted>Panel</Collapsible.Panel>
                </Collapsible.Root>,
            );
            const trigger = rendered.getByRole('button', { name: 'Toggle' });

            expect(trigger).toHaveAttribute('aria-expanded', 'false');

            const panel = rendered.getByText('Panel');

            expect(panel).toBeInTheDocument();
            expect(panel).not.toBeVisible();
            expect(panel).toHaveAttribute('hidden');
        });
    });
});
