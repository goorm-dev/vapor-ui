import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { ToggleGroup } from '.';
import { Toggle } from '../toggle';

const ToggleGroupTest = (props: ToggleGroup.Root.Props) => (
    <ToggleGroup.Root {...props}>
        <Toggle value="a" aria-label="a" />
        <Toggle value="b" aria-label="b" />
        <ToggleGroup.Separator />
        <Toggle value="c" aria-label="c" />
    </ToggleGroup.Root>
);

describe('<ToggleGroup.Root>', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<ToggleGroupTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    it('should press a toggle when clicked', async () => {
        const rendered = render(<ToggleGroupTest />);
        const toggleA = rendered.getByRole('button', { name: 'a' });

        await userEvent.click(toggleA);

        expect(toggleA).toHaveAttribute('aria-pressed', 'true');
    });

    it('should unpress the previously pressed toggle when another is clicked', async () => {
        const rendered = render(<ToggleGroupTest />);
        const toggleA = rendered.getByRole('button', { name: 'a' });
        const toggleB = rendered.getByRole('button', { name: 'b' });

        await userEvent.click(toggleA);
        await userEvent.click(toggleB);

        expect(toggleA).toHaveAttribute('aria-pressed', 'false');
        expect(toggleB).toHaveAttribute('aria-pressed', 'true');
    });

    describe('prop: defaultValue', () => {
        it('should mark the matching toggle as pressed', () => {
            const rendered = render(<ToggleGroupTest defaultValue={['b']} />);
            const toggleA = rendered.getByRole('button', { name: 'a' });
            const toggleB = rendered.getByRole('button', { name: 'b' });

            expect(toggleA).toHaveAttribute('aria-pressed', 'false');
            expect(toggleB).toHaveAttribute('aria-pressed', 'true');
        });
    });

    describe('prop: value', () => {
        it('should reflect the controlled value', () => {
            const rendered = render(<ToggleGroupTest value={['c']} />);
            const toggleA = rendered.getByRole('button', { name: 'a' });
            const toggleC = rendered.getByRole('button', { name: 'c' });

            expect(toggleA).toHaveAttribute('aria-pressed', 'false');
            expect(toggleC).toHaveAttribute('aria-pressed', 'true');
        });

        it('should not change pressed state without onValueChange update', async () => {
            const rendered = render(<ToggleGroupTest value={[]} />);
            const toggleA = rendered.getByRole('button', { name: 'a' });

            await userEvent.click(toggleA);

            expect(toggleA).toHaveAttribute('aria-pressed', 'false');
        });
    });

    describe('prop: onValueChange', () => {
        it('should call onValueChange with the new value array when clicked', async () => {
            const onValueChange = vi.fn();
            const rendered = render(<ToggleGroupTest onValueChange={onValueChange} />);
            const toggleA = rendered.getByRole('button', { name: 'a' });

            await userEvent.click(toggleA);

            expect(onValueChange).toHaveBeenCalledTimes(1);
            expect(onValueChange).toHaveBeenCalledWith(['a'], expect.anything());
        });

        it('should call onValueChange with an empty array when the pressed toggle is clicked again', async () => {
            const onValueChange = vi.fn();
            const rendered = render(
                <ToggleGroupTest defaultValue={['a']} onValueChange={onValueChange} />,
            );
            const toggleA = rendered.getByRole('button', { name: 'a' });

            await userEvent.click(toggleA);

            expect(toggleA).toHaveAttribute('aria-pressed', 'false');
            expect(onValueChange).toHaveBeenCalledTimes(1);
            expect(onValueChange).toHaveBeenCalledWith([], expect.anything());
        });
    });

    describe('prop: multiple', () => {
        it('should allow multiple toggles to be pressed at the same time', async () => {
            const rendered = render(<ToggleGroupTest multiple />);
            const toggleA = rendered.getByRole('button', { name: 'a' });
            const toggleB = rendered.getByRole('button', { name: 'b' });

            await userEvent.click(toggleA);
            await userEvent.click(toggleB);

            expect(toggleA).toHaveAttribute('aria-pressed', 'true');
            expect(toggleB).toHaveAttribute('aria-pressed', 'true');
        });

        it('should call onValueChange with the new value array when multiple toggles are pressed', async () => {
            const onValueChange = vi.fn();
            const rendered = render(<ToggleGroupTest multiple onValueChange={onValueChange} />);
            const toggleA = rendered.getByRole('button', { name: 'a' });
            const toggleB = rendered.getByRole('button', { name: 'b' });

            await userEvent.click(toggleA);
            await userEvent.click(toggleB);

            expect(onValueChange).toHaveBeenCalledTimes(2);
            expect(onValueChange).toHaveBeenNthCalledWith(1, ['a'], expect.anything());
            expect(onValueChange).toHaveBeenNthCalledWith(2, ['a', 'b'], expect.anything());
        });
    });

    describe('prop: disabled', () => {
        it('should disable all toggles', () => {
            const rendered = render(<ToggleGroupTest disabled />);
            const toggles = rendered.getAllByRole('button');

            toggles.forEach((toggle) => {
                expect(toggle).toBeDisabled();
            });
        });

        it('should not call onValueChange when a toggle is clicked', async () => {
            const onValueChange = vi.fn();
            const rendered = render(<ToggleGroupTest disabled onValueChange={onValueChange} />);
            const toggleA = rendered.getByRole('button', { name: 'a' });

            await userEvent.click(toggleA);

            expect(onValueChange).not.toHaveBeenCalled();
        });
    });

    describe('keyboard navigation', () => {
        it('should focus the next toggle when pressing ArrowRight', async () => {
            const rendered = render(<ToggleGroupTest />);
            const toggleA = rendered.getByRole('button', { name: 'a' });
            const toggleB = rendered.getByRole('button', { name: 'b' });

            toggleA.focus();
            await userEvent.keyboard('[ArrowRight]');

            expect(toggleB).toHaveFocus();
        });

        it('should focus the previous toggle when pressing ArrowLeft', async () => {
            const rendered = render(<ToggleGroupTest />);
            const toggleA = rendered.getByRole('button', { name: 'a' });
            const toggleB = rendered.getByRole('button', { name: 'b' });

            toggleB.focus();
            await userEvent.keyboard('[ArrowLeft]');

            expect(toggleA).toHaveFocus();
        });

        it('should focus multiple toggles when pressing ArrowRight multiple times', async () => {
            const onValueChange = vi.fn();
            const rendered = render(<ToggleGroupTest multiple onValueChange={onValueChange} />);
            const toggleA = rendered.getByRole('button', { name: 'a' });
            const toggleB = rendered.getByRole('button', { name: 'b' });
            const toggleC = rendered.getByRole('button', { name: 'c' });

            toggleA.focus();
            await userEvent.keyboard('[ArrowRight]');
            await userEvent.keyboard('[Space]');
            await userEvent.keyboard('[ArrowRight]');
            await userEvent.keyboard('[Space]');

            expect(toggleB).toHaveAttribute('aria-pressed', 'true');
            expect(toggleC).toHaveAttribute('aria-pressed', 'true');
            expect(onValueChange).toHaveBeenCalledTimes(2);
            expect(onValueChange).toHaveBeenNthCalledWith(1, ['b'], expect.anything());
            expect(onValueChange).toHaveBeenNthCalledWith(2, ['b', 'c'], expect.anything());
        });
    });
});
