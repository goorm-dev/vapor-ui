import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { axe } from 'vitest-axe';

import type { ButtonProps } from './button';
import { Button } from './button';

const BUTTON_LABEL = 'Click Me';

const ButtonTest = (props: ButtonProps) => {
    return <Button {...props}>{BUTTON_LABEL}</Button>;
};

describe('Button', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<ButtonTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    it('should be clickable', async () => {
        const handleClickMock: Mock = vi.fn();

        const rendered = render(<ButtonTest onClick={handleClickMock} />);
        const button = rendered.getByText(BUTTON_LABEL);

        await userEvent.click(button);

        expect(handleClickMock).toHaveBeenCalledTimes(1);
    });

    it('should not be clickable when disabled', async () => {
        const handleClickMock: Mock = vi.fn();

        const rendered = render(<ButtonTest disabled onClick={handleClickMock} />);
        const button = rendered.getByText(BUTTON_LABEL);

        await userEvent.click(button);

        expect(handleClickMock).not.toHaveBeenCalled();
    });
});
