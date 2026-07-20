import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Toggle } from '.';

const LABEL_TEXT = 'toggle';

const ToggleTest = (props: Toggle.Props) => <Toggle aria-label={LABEL_TEXT} {...props} />;

describe('<Toggle>', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<ToggleTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    describe('ARIA attributes', () => {
        it('should have `aria-pressed="false"` initially', () => {
            const rendered = render(<ToggleTest />);
            const toggle = rendered.getByRole('button', { name: LABEL_TEXT });

            expect(toggle).toHaveAttribute('aria-pressed', 'false');
        });

        it('should toggle pressed state when clicked', async () => {
            const rendered = render(<ToggleTest />);
            const toggle = rendered.getByRole('button', { name: LABEL_TEXT });

            await userEvent.click(toggle);
            expect(toggle).toHaveAttribute('aria-pressed', 'true');

            await userEvent.click(toggle);
            expect(toggle).toHaveAttribute('aria-pressed', 'false');
        });
    });

    describe('prop: defaultPressed', () => {
        it('should have `aria-pressed="true"` when defaultPressed is true', () => {
            const rendered = render(<ToggleTest defaultPressed />);
            const toggle = rendered.getByRole('button', { name: LABEL_TEXT });

            expect(toggle).toHaveAttribute('aria-pressed', 'true');
        });

        it('should toggle pressed state when clicked', async () => {
            const rendered = render(<ToggleTest defaultPressed />);
            const toggle = rendered.getByRole('button', { name: LABEL_TEXT });

            await userEvent.click(toggle);
            expect(toggle).toHaveAttribute('aria-pressed', 'false');

            await userEvent.click(toggle);
            expect(toggle).toHaveAttribute('aria-pressed', 'true');
        });
    });

    describe('prop: pressed', () => {
        it('should reflect the controlled pressed value', () => {
            const rendered = render(<ToggleTest pressed />);
            const toggle = rendered.getByRole('button', { name: LABEL_TEXT });

            expect(toggle).toHaveAttribute('aria-pressed', 'true');
        });

        it('should not change pressed state without onPressedChange update', async () => {
            const rendered = render(<ToggleTest pressed={false} />);
            const toggle = rendered.getByRole('button', { name: LABEL_TEXT });

            await userEvent.click(toggle);

            expect(toggle).toHaveAttribute('aria-pressed', 'false');
        });
    });

    describe('prop: onPressedChange', () => {
        it('should call onPressedChange with the new pressed value when clicked', async () => {
            const onPressedChange = vi.fn();
            const rendered = render(<ToggleTest onPressedChange={onPressedChange} />);
            const toggle = rendered.getByRole('button', { name: LABEL_TEXT });

            await userEvent.click(toggle);

            expect(onPressedChange).toHaveBeenCalledTimes(1);
            expect(onPressedChange).toHaveBeenCalledWith(true, expect.anything());
        });
    });

    describe('prop: disabled', () => {
        it('should be disabled', () => {
            const rendered = render(<ToggleTest disabled />);
            const toggle = rendered.getByRole('button', { name: LABEL_TEXT });

            expect(toggle).toBeDisabled();
        });

        it('should not call onPressedChange when clicked', async () => {
            const onPressedChange = vi.fn();
            const rendered = render(<ToggleTest disabled onPressedChange={onPressedChange} />);
            const toggle = rendered.getByRole('button', { name: LABEL_TEXT });

            await userEvent.click(toggle);

            expect(onPressedChange).not.toHaveBeenCalled();
        });
    });

    describe('keyboard interaction', () => {
        it('should toggle pressed state when Space key is pressed', async () => {
            const rendered = render(<ToggleTest />);
            const toggle = rendered.getByRole('button', { name: LABEL_TEXT });

            await userEvent.tab();
            await userEvent.keyboard('[Space]');

            expect(toggle).toHaveAttribute('aria-pressed', 'true');

            await userEvent.keyboard('[Space]');

            expect(toggle).toHaveAttribute('aria-pressed', 'false');
        });

        it('should toggle pressed state when Enter key is pressed', async () => {
            const rendered = render(<ToggleTest />);
            const toggle = rendered.getByRole('button', { name: LABEL_TEXT });

            await userEvent.tab();
            await userEvent.keyboard('[Enter]');

            expect(toggle).toHaveAttribute('aria-pressed', 'true');

            await userEvent.keyboard('[Enter]');

            expect(toggle).toHaveAttribute('aria-pressed', 'false');
        });
    });
});
