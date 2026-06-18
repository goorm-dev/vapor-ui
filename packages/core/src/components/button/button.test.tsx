import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { axe } from 'vitest-axe';

import { Button } from './button';

const BUTTON_LABEL = 'Click Me';

const ButtonTest = (props: Button.Props) => {
    return <Button {...props}>{BUTTON_LABEL}</Button>;
};

describe('Button', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<ButtonTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    describe('prop: disabled', () => {
        it('should not be clickable when disabled', async () => {
            const handleClickMock: Mock = vi.fn();

            render(<ButtonTest disabled onClick={handleClickMock} />);
            await userEvent.click(screen.getByRole('button', { name: BUTTON_LABEL }));

            expect(handleClickMock).not.toHaveBeenCalled();
        });

        it('should not be focusable when disabled', async () => {
            render(<ButtonTest disabled />);
            await userEvent.tab();

            expect(screen.getByRole('button', { name: BUTTON_LABEL })).not.toHaveFocus();
        });
    });

    describe('pointer interaction', () => {
        it('should be clickable', async () => {
            const handleClickMock: Mock = vi.fn();

            render(<ButtonTest onClick={handleClickMock} />);
            await userEvent.click(screen.getByRole('button', { name: BUTTON_LABEL }));

            expect(handleClickMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('keyboard interaction', () => {
        it('should be triggered by Enter key', async () => {
            const handleClickMock: Mock = vi.fn();

            render(<ButtonTest onClick={handleClickMock} />);
            screen.getByRole('button', { name: BUTTON_LABEL }).focus();
            await userEvent.keyboard('{Enter}');

            expect(handleClickMock).toHaveBeenCalledTimes(1);
        });

        it('should be triggered by Space key', async () => {
            const handleClickMock: Mock = vi.fn();

            render(<ButtonTest onClick={handleClickMock} />);
            screen.getByRole('button', { name: BUTTON_LABEL }).focus();
            await userEvent.keyboard(' ');

            expect(handleClickMock).toHaveBeenCalledTimes(1);
        });

        it('should be focusable by Tab key', async () => {
            render(<ButtonTest />);
            await userEvent.tab();

            expect(screen.getByRole('button', { name: BUTTON_LABEL })).toHaveFocus();
        });
    });
});
