import type { ComponentProps } from 'react';

import { cleanup, render } from '@testing-library/react';
import user from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { axe } from 'vitest-axe';

import type { IconButtonProps } from './icon-button';
import { IconButton } from './icon-button';

const ARIA_LABEL = 'Like';

const IconButtonTest = (props: IconButtonProps) => {
    return (
        <IconButton {...props}>
            <HeartIcon data-testid="icon" />
        </IconButton>
    );
};

describe('IconButton', () => {
    afterEach(cleanup);

    it('should have no a11y violations', async () => {
        const rendered = render(<IconButtonTest aria-label={ARIA_LABEL} />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    it('should be clickable', async () => {
        const handleClickMock: Mock = vi.fn();

        const rendered = render(
            <IconButtonTest aria-label={ARIA_LABEL} onClick={handleClickMock} />,
        );
        const button = rendered.getByLabelText(ARIA_LABEL);

        await user.click(button);

        expect(handleClickMock).toHaveBeenCalledTimes(1);
    });

    it('should not be clickable when disabled', async () => {
        const handleClickMock: Mock = vi.fn();

        const rendered = render(
            <IconButtonTest aria-label={ARIA_LABEL} disabled onClick={handleClickMock} />,
        );
        const button = rendered.getByLabelText(ARIA_LABEL);

        await user.click(button);

        expect(handleClickMock).not.toHaveBeenCalled();
    });

    it('should have an icon with aria-hidden', async () => {
        const rendered = render(<IconButtonTest aria-label={ARIA_LABEL} />);
        const svg = rendered.getByTestId('icon');

        expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
});

const HeartIcon = (props: ComponentProps<'svg'>) => {
    return (
        <svg
            aria-hidden
            width={16}
            height={16}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            fill={'currentColor'}
            {...props}
        >
            <path d="M8.00016 13.7833C7.84461 13.7833 7.68627 13.7556 7.52516 13.7C7.36405 13.6444 7.22239 13.5556 7.10016 13.4333L5.95016 12.3833C4.77239 11.3056 3.7085 10.2361 2.7585 9.175C1.8085 8.11389 1.3335 6.94444 1.3335 5.66667C1.3335 4.62222 1.6835 3.75 2.3835 3.05C3.0835 2.35 3.95572 2 5.00016 2C5.58905 2 6.14461 2.125 6.66683 2.375C7.18905 2.625 7.6335 2.96667 8.00016 3.4C8.36683 2.96667 8.81127 2.625 9.3335 2.375C9.85572 2.125 10.4113 2 11.0002 2C12.0446 2 12.9168 2.35 13.6168 3.05C14.3168 3.75 14.6668 4.62222 14.6668 5.66667C14.6668 6.94444 14.1946 8.11667 13.2502 9.18333C12.3057 10.25 11.2335 11.3222 10.0335 12.4L8.90016 13.4333C8.77794 13.5556 8.63627 13.6444 8.47516 13.7C8.31405 13.7556 8.15572 13.7833 8.00016 13.7833Z" />
        </svg>
    );
};
