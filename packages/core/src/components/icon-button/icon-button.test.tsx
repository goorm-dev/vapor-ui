import { cleanup, render } from '@testing-library/react';
import user from '@testing-library/user-event';
import { HeartIcon } from '@vapor-ui/icons';
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
        const rendered = render(<IconButtonTest label={ARIA_LABEL} />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    it('should be clickable', async () => {
        const handleClickMock: Mock = vi.fn();

        const rendered = render(<IconButtonTest label={ARIA_LABEL} onClick={handleClickMock} />);
        const button = rendered.getByLabelText(ARIA_LABEL);

        await user.click(button);

        expect(handleClickMock).toHaveBeenCalledTimes(1);
    });

    it('should not be clickable when disabled', async () => {
        const handleClickMock: Mock = vi.fn();

        const rendered = render(
            <IconButtonTest label={ARIA_LABEL} disabled onClick={handleClickMock} />,
        );
        const button = rendered.getByLabelText(ARIA_LABEL);

        await user.click(button);

        expect(handleClickMock).not.toHaveBeenCalled();
    });

    it('should have an icon with aria-hidden', async () => {
        const rendered = render(<IconButtonTest label={ARIA_LABEL} />);
        const svg = rendered.getByTestId('icon');

        expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
});
