import { act } from 'react';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { SegmentedControl } from '.';

const SegmentedControlTest = (props: SegmentedControl.Root.Props) => (
    <SegmentedControl.Root {...props}>
        <SegmentedControl.Item value="a">A</SegmentedControl.Item>
        <SegmentedControl.Item value="b">B</SegmentedControl.Item>
        <SegmentedControl.Item value="c">C</SegmentedControl.Item>
    </SegmentedControl.Root>
);

const DisabledItemTest = (props: SegmentedControl.Root.Props) => (
    <SegmentedControl.Root defaultValue="a" {...props}>
        <SegmentedControl.Item value="a">A</SegmentedControl.Item>
        <SegmentedControl.Item value="b" disabled>
            B
        </SegmentedControl.Item>
        <SegmentedControl.Item value="c">C</SegmentedControl.Item>
    </SegmentedControl.Root>
);

describe('SegmentedControl', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<SegmentedControlTest defaultValue="a" />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    describe('ARIA roles', () => {
        it('should render root as radiogroup', () => {
            const rendered = render(<SegmentedControlTest defaultValue="a" />);
            const radioGroup = rendered.getByRole('radiogroup');

            expect(radioGroup).toBeInTheDocument();
        });

        it('should render each item as radio', () => {
            const rendered = render(<SegmentedControlTest defaultValue="a" />);
            const items = rendered.getAllByRole('radio');

            expect(items).toHaveLength(3);
        });
    });

    describe('prop: defaultValue', () => {
        it('should mark the matching item as checked', () => {
            const rendered = render(<SegmentedControlTest defaultValue="b" />);
            const [itemA, itemB, itemC] = rendered.getAllByRole('radio');

            expect(itemA).not.toBeChecked();
            expect(itemB).toBeChecked();
            expect(itemC).not.toBeChecked();
        });

        it('should auto-select the first item when no value or defaultValue is provided', () => {
            const rendered = render(<SegmentedControlTest />);
            const [itemA, itemB, itemC] = rendered.getAllByRole('radio');

            expect(itemA).toBeChecked();
            expect(itemB).not.toBeChecked();
            expect(itemC).not.toBeChecked();
        });
    });

    describe('prop: value', () => {
        it('should mark the matching item as checked', () => {
            const rendered = render(<SegmentedControlTest value="c" onValueChange={() => {}} />);
            const [itemA, itemB, itemC] = rendered.getAllByRole('radio');

            expect(itemA).not.toBeChecked();
            expect(itemB).not.toBeChecked();
            expect(itemC).toBeChecked();
        });
    });

    describe('prop: onValueChange', () => {
        it('should call onValueChange with the selected value when an item is clicked', async () => {
            const onValueChange = vi.fn();
            const rendered = render(
                <SegmentedControlTest defaultValue="a" onValueChange={onValueChange} />,
            );
            const [, itemB] = rendered.getAllByRole('radio');

            await userEvent.click(itemB);

            expect(onValueChange).toHaveBeenCalledOnce();
            expect(onValueChange).toHaveBeenCalledWith(
                'b',
                expect.objectContaining({
                    reason: expect.any(String),
                    event: expect.any(Event),
                }),
            );
        });

        it('should not call onValueChange when the already-selected item is clicked', async () => {
            const onValueChange = vi.fn();
            const rendered = render(
                <SegmentedControlTest defaultValue="a" onValueChange={onValueChange} />,
            );
            const [itemA] = rendered.getAllByRole('radio');

            await userEvent.click(itemA);

            expect(onValueChange).not.toHaveBeenCalled();
        });
    });

    describe('keyboard navigation', () => {
        it('should move to the next item and select it on ArrowRight', async () => {
            const rendered = render(<SegmentedControlTest defaultValue="a" />);
            const [itemA, itemB] = rendered.getAllByRole('radio');

            act(() => itemA.focus());
            await userEvent.keyboard('[ArrowRight]');

            expect(itemB).toHaveFocus();
            expect(itemB).toBeChecked();
        });

        it('should move to the next item and select it on ArrowDown', async () => {
            const rendered = render(<SegmentedControlTest defaultValue="a" />);
            const [itemA, itemB] = rendered.getAllByRole('radio');

            act(() => itemA.focus());
            await userEvent.keyboard('[ArrowDown]');

            expect(itemB).toHaveFocus();
            expect(itemB).toBeChecked();
        });

        it('should move to the previous item and select it on ArrowLeft', async () => {
            const rendered = render(<SegmentedControlTest defaultValue="b" />);
            const [itemA, itemB] = rendered.getAllByRole('radio');

            act(() => itemB.focus());
            await userEvent.keyboard('[ArrowLeft]');

            expect(itemA).toHaveFocus();
            expect(itemA).toBeChecked();
        });

        it('should move to the previous item and select it on ArrowUp', async () => {
            const rendered = render(<SegmentedControlTest defaultValue="b" />);
            const [itemA, itemB] = rendered.getAllByRole('radio');

            act(() => itemB.focus());
            await userEvent.keyboard('[ArrowUp]');

            expect(itemA).toHaveFocus();
            expect(itemA).toBeChecked();
        });

        it('should wrap from last to first on ArrowRight', async () => {
            const rendered = render(<SegmentedControlTest defaultValue="c" />);
            const [itemA, , itemC] = rendered.getAllByRole('radio');

            act(() => itemC.focus());
            await userEvent.keyboard('[ArrowRight]');

            expect(itemA).toHaveFocus();
            expect(itemA).toBeChecked();
        });

        it('should wrap from first to last on ArrowLeft', async () => {
            const rendered = render(<SegmentedControlTest defaultValue="a" />);
            const [itemA, , itemC] = rendered.getAllByRole('radio');

            act(() => itemA.focus());
            await userEvent.keyboard('[ArrowLeft]');

            expect(itemC).toHaveFocus();
            expect(itemC).toBeChecked();
        });
    });

    describe('prop: disabled on item', () => {
        it('should have aria-disabled on the disabled item', () => {
            const rendered = render(<DisabledItemTest />);
            const [itemA, itemB, itemC] = rendered.getAllByRole('radio');

            expect(itemA).not.toBeDisabled();
            expect(itemB).toBeDisabled();
            expect(itemC).not.toBeDisabled();
        });

        it('should not call onValueChange when a disabled item is clicked', async () => {
            const onValueChange = vi.fn();
            const rendered = render(<DisabledItemTest onValueChange={onValueChange} />);
            const [, itemB] = rendered.getAllByRole('radio');

            await userEvent.click(itemB);

            expect(onValueChange).not.toHaveBeenCalled();
        });

        it('should skip the disabled item when navigating forward', async () => {
            const rendered = render(<DisabledItemTest />);
            const [itemA, , itemC] = rendered.getAllByRole('radio');

            act(() => itemA.focus());
            await userEvent.keyboard('[ArrowRight]');

            expect(itemC).toHaveFocus();
            expect(itemC).toBeChecked();
        });

        it('should skip the disabled item when navigating backward', async () => {
            const rendered = render(<DisabledItemTest defaultValue="c" />);
            const [itemA, , itemC] = rendered.getAllByRole('radio');

            act(() => itemC.focus());
            await userEvent.keyboard('[ArrowLeft]');

            expect(itemA).toHaveFocus();
            expect(itemA).toBeChecked();
        });
    });

    describe('prop: disabled on root', () => {
        it('should have aria-disabled on all items', () => {
            const rendered = render(<SegmentedControlTest defaultValue="a" disabled />);
            const items = rendered.getAllByRole('radio');

            items.forEach((item) => {
                expect(item).toBeDisabled();
            });
        });

        it('should have aria-disabled on the radiogroup', () => {
            const rendered = render(<SegmentedControlTest defaultValue="a" disabled />);
            const radioGroup = rendered.getByRole('radiogroup');

            expect(radioGroup).toHaveAttribute('aria-disabled', 'true');
        });

        it('should not call onValueChange when disabled root is clicked', async () => {
            const onValueChange = vi.fn();
            const rendered = render(
                <SegmentedControlTest defaultValue="a" disabled onValueChange={onValueChange} />,
            );
            const [, itemB] = rendered.getAllByRole('radio');

            await userEvent.click(itemB);

            expect(onValueChange).not.toHaveBeenCalled();
        });
    });
});
