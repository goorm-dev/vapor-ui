import { act } from 'react';

import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import type { TooltipRootProps } from './tooltip';
import { Tooltip } from './tooltip';

const OPEN_DELAY = 1000;
const CLOSE_DELAY = 100;

const TooltipTest = (props: TooltipRootProps) => {
    return (
        <Tooltip.Root {...props}>
            <Tooltip.Trigger>Hover me</Tooltip.Trigger>
            <Tooltip.Content>Tooltip content</Tooltip.Content>
        </Tooltip.Root>
    );
};

describe('<Tooltip.Root />', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
    });

    afterEach(cleanup);

    it('should have no a11y violations', async () => {
        await act(async () => {
            const rendered = render(<TooltipTest open />);
            const results = await axe(rendered.container);

            expect(results).toHaveNoViolations();
        });
    });

    it('should open when trigger is hovered', async () => {
        const rendered = render(<TooltipTest delay={OPEN_DELAY} />);
        const trigger = rendered.getByRole('button', { name: 'Hover me' });

        await userEvent.hover(trigger);

        act(() => vi.advanceTimersByTime(OPEN_DELAY));
        expect(rendered.getByText('Tooltip content')).not.toBeNull();
    });

    it('should close when the trigger is unhovered', async () => {
        const rendered = render(<TooltipTest delay={OPEN_DELAY} closeDelay={CLOSE_DELAY} />);
        const trigger = rendered.getByRole('button', { name: 'Hover me' });

        await userEvent.hover(trigger);

        act(() => vi.advanceTimersByTime(OPEN_DELAY));
        expect(rendered.getByText('Tooltip content')).not.toBeNull();

        await userEvent.unhover(trigger);

        act(() => vi.advanceTimersByTime(CLOSE_DELAY));
        expect(rendered.queryByText('Tooltip content')).toBeNull();
    });

    it('should open when the trigger is focused', async () => {
        const rendered = render(<TooltipTest delay={OPEN_DELAY} />);
        const trigger = rendered.getByRole('button', { name: 'Hover me' });

        act(() => trigger.focus());
        expect(rendered.getByText('Tooltip content')).not.toBeNull();
    });

    it('should close when the trigger is unfocused', async () => {
        const rendered = render(<TooltipTest delay={OPEN_DELAY} closeDelay={CLOSE_DELAY} />);
        const trigger = rendered.getByRole('button', { name: 'Hover me' });

        act(() => trigger.focus());
        act(() => vi.advanceTimersByTime(OPEN_DELAY));

        expect(rendered.getByText('Tooltip content')).not.toBeNull();

        act(() => trigger.blur());

        act(() => vi.advanceTimersByTime(CLOSE_DELAY));

        expect(rendered.queryByText('Tooltip content')).toBeNull();
    });

    describe('prop: keepMounted', () => {
        beforeEach(() => {
            vi.useFakeTimers({ shouldAdvanceTime: true });
            userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
        });

        it('should not close when provided keepMounted and closed', async () => {
            const rendered = render(
                <Tooltip.Root delay={0}>
                    <Tooltip.Trigger>Hover me</Tooltip.Trigger>
                    <Tooltip.Portal keepMounted>
                        <Tooltip.Positioner>
                            <Tooltip.Popup>Tooltip content</Tooltip.Popup>
                        </Tooltip.Positioner>
                    </Tooltip.Portal>
                </Tooltip.Root>,
            );

            const trigger = rendered.getByRole('button', { name: 'Hover me' });

            await userEvent.hover(trigger);

            act(() => vi.advanceTimersByTime(OPEN_DELAY));
            expect(rendered.getByText('Tooltip content')).not.toBeNull();

            await userEvent.unhover(trigger);

            expect(rendered.getByText('Tooltip content')).not.toBeNull();
        });
    });

    describe('prop: delay', () => {
        it('should open after delay', async () => {
            const rendered = render(<TooltipTest delay={OPEN_DELAY} />);
            const trigger = rendered.getByRole('button', { name: 'Hover me' });

            vi.useFakeTimers({ shouldAdvanceTime: true });
            userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });

            await userEvent.hover(trigger);

            act(() => vi.advanceTimersByTime(OPEN_DELAY));
            expect(rendered.getByText('Tooltip content')).not.toBeNull();
        });
    });

    describe('prop: closeDelay', () => {
        it('should close after closeDelay', async () => {
            const rendered = render(<TooltipTest delay={OPEN_DELAY} closeDelay={CLOSE_DELAY} />);
            const trigger = rendered.getByRole('button', { name: 'Hover me' });

            await userEvent.hover(trigger);

            act(() => vi.advanceTimersByTime(OPEN_DELAY));
            expect(rendered.getByText('Tooltip content')).not.toBeNull();

            await userEvent.unhover(trigger);

            act(() => vi.advanceTimersByTime(CLOSE_DELAY));
            expect(rendered.queryByText('Tooltip content')).toBeNull();
        });
    });

    describe('disabled', () => {
        it('should not open when disabled', async () => {
            const rendered = render(<TooltipTest delay={0} disabled />);
            const trigger = rendered.getByRole('button', { name: 'Hover me' });

            await userEvent.hover(trigger);

            expect(rendered.queryByText('Tooltip content')).toBeNull();
        });
    });

    describe('prop: hoverable', () => {
        it('should apply pointer-events: none to positioner when hoverable is false', async () => {
            const rendered = render(
                <Tooltip.Root delay={0} hoverable={false}>
                    <Tooltip.Trigger>Hover me</Tooltip.Trigger>
                    <Tooltip.Portal>
                        <Tooltip.Positioner data-testid="tooltip-positioner">
                            <Tooltip.Popup>Tooltip content</Tooltip.Popup>
                        </Tooltip.Positioner>
                    </Tooltip.Portal>
                </Tooltip.Root>,
            );
            const trigger = rendered.getByRole('button', { name: 'Hover me' });

            await userEvent.hover(trigger);

            const positioner = rendered.getByTestId('tooltip-positioner');

            expect(positioner).toHaveStyle({ pointerEvents: 'none' });
        });

        it('should not apply pointer-events to positioner when hoverable is true', async () => {
            const rendered = render(
                <Tooltip.Root delay={0} hoverable>
                    <Tooltip.Trigger>Hover me</Tooltip.Trigger>
                    <Tooltip.Portal>
                        <Tooltip.Positioner data-testid="tooltip-positioner">
                            <Tooltip.Popup>Tooltip content</Tooltip.Popup>
                        </Tooltip.Positioner>
                    </Tooltip.Portal>
                </Tooltip.Root>,
            );
            const trigger = rendered.getByRole('button', { name: 'Hover me' });

            await userEvent.hover(trigger);

            const positioner = rendered.getByTestId('tooltip-positioner');

            expect(positioner).not.toHaveStyle({ pointerEvents: 'none' });
        });
    });
});
