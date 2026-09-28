import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';

import { Spinner } from './spinner';

describe('Spinner', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<Spinner />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    it('should expose role="status" with the default accessible name', () => {
        render(<Spinner />);

        expect(screen.getByRole('status')).toHaveAccessibleName('Loading');
    });

    it('should allow overriding the accessible name', () => {
        render(<Spinner aria-label="검색 결과 불러오는 중" />);

        expect(screen.getByRole('status')).toHaveAccessibleName('검색 결과 불러오는 중');
    });

    it('should hide the decorative svg from assistive technology', () => {
        const { container } = render(<Spinner />);

        expect(container.querySelector('svg')).toHaveAttribute('aria-hidden');
    });
});
