import { cleanup, render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';

import { Meter } from '.';

const LABEL_TEXT = '저장 공간';

describe('Meter (composite)', () => {
    afterEach(cleanup);

    it('should render role="meter" with the given range', () => {
        render(<Meter label={LABEL_TEXT} value={42} min={0} max={100} />);
        const meter = screen.getByRole('meter');

        expect(meter).toHaveAttribute('aria-valuemin', '0');
        expect(meter).toHaveAttribute('aria-valuemax', '100');
        expect(meter).toHaveAttribute('aria-valuenow', '42');
    });

    it('should use the `label` slot as the accessible name', () => {
        render(<Meter label={LABEL_TEXT} value={10} />);

        expect(screen.getByRole('meter')).toHaveAccessibleName(LABEL_TEXT);
    });

    it('should let `getAriaValueText` replace the generated value text', () => {
        render(
            <Meter
                label={LABEL_TEXT}
                value={42}
                getAriaValueText={(formatted, raw) => `${formatted} 사용 (${raw})`}
            />,
        );

        expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '42% 사용 (42)');
    });

    it('should render `valueText` from `(formattedValue, value)` and hide it from assistive technology', () => {
        render(
            <Meter
                label={LABEL_TEXT}
                value={42}
                valueText={(formattedValue, value) => `${formattedValue} 사용 (${value})`}
            />,
        );

        const valueNode = screen.getByText('42% 사용 (42)');
        expect(valueNode).toBeInTheDocument();
        expect(valueNode).toHaveAttribute('aria-hidden', 'true');
    });

    it('should expose the resolved `max` as the third argument of `valueText`', () => {
        const VALUE = 30;
        const MAX = 150;
        render(
            <Meter
                label={LABEL_TEXT}
                value={VALUE}
                max={MAX}
                valueText={(_, value, max) => `${value} / ${max}`}
            />,
        );

        expect(screen.getByText(`${VALUE} / ${MAX}`)).toBeInTheDocument();
    });

    it('should render the default value text when `valueText` is not provided', () => {
        const { container } = render(<Meter label={LABEL_TEXT} value={42} />);
        const valueText = container.querySelector('[data-slots*="Meter.Value"]');

        expect(valueText).toBeInTheDocument();
        expect(valueText).toHaveTextContent('42%');
    });

    it('should have no a11y violations', async () => {
        const rendered = render(<Meter label={LABEL_TEXT} value={42} />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    it('should have no a11y violations with all slots and warning state', async () => {
        const rendered = render(
            <Meter
                label={LABEL_TEXT}
                value={92}
                type="warning"
                size="lg"
                valueText={(formatted) => formatted}
                getAriaValueText={(formatted) => `${formatted} 사용 중, 경고 범위`}
            />,
        );
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });
});
