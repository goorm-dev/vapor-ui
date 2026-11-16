import { cleanup, render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';

import { Meter } from '.';

const LABEL_TEXT = '저장 공간';

describe('Meter (composite)', () => {
    afterEach(cleanup);

    it('should render role="meter" with the given range', () => {
        render(<Meter type="default" label={LABEL_TEXT} value={42} min={0} max={100} />);
        const meter = screen.getByRole('meter');

        expect(meter).toHaveAttribute('aria-valuemin', '0');
        expect(meter).toHaveAttribute('aria-valuemax', '100');
        expect(meter).toHaveAttribute('aria-valuenow', '42');
    });

    it('should use the `label` slot as the accessible name', () => {
        render(<Meter type="default" label={LABEL_TEXT} value={10} />);

        expect(screen.getByRole('meter')).toHaveAccessibleName(LABEL_TEXT);
    });

    it('should let `getAriaValueText` replace the generated value text', () => {
        render(
            <Meter
                type="default"
                label={LABEL_TEXT}
                value={42}
                getAriaValueText={(formatted, raw) => `${formatted} 사용 (${raw})`}
            />,
        );

        expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '42% 사용 (42)');
    });

    it('should render `formattedValueText` from the formatted value and hide it from assistive technology', () => {
        render(
            <Meter
                type="default"
                label={LABEL_TEXT}
                value={42}
                formatValue={{
                    formattedValueText: (formattedValue) => `${formattedValue} 사용`,
                }}
            />,
        );

        const valueNode = screen.getByText('42% 사용');
        expect(valueNode).toBeInTheDocument();
        expect(valueNode).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render `valueText` and `maxValueText` with the raw value and the resolved `max`', () => {
        const VALUE = 30;
        const MAX = 150;
        const { container } = render(
            <Meter
                type="default"
                label={LABEL_TEXT}
                value={VALUE}
                max={MAX}
                formatValue={{
                    valueText: (value) => `${value}GB`,
                    maxValueText: (max) => `${max}GB`,
                }}
            />,
        );
        const valueText = container.querySelector('[data-slots*="Meter.Value"]');

        expect(valueText).toHaveTextContent(`${VALUE}GB/${MAX}GB`);
    });

    it('should render the default value text when `valueText` is not provided', () => {
        const { container } = render(<Meter type="default" label={LABEL_TEXT} value={42} />);
        const valueText = container.querySelector('[data-slots*="Meter.Value"]');

        expect(valueText).toBeInTheDocument();
        expect(valueText).toHaveTextContent('42%');
    });

    it('should have no a11y violations', async () => {
        const rendered = render(<Meter type="default" label={LABEL_TEXT} value={42} />);
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
                formatValue={{ formattedValueText: (formatted) => formatted }}
                getAriaValueText={(formatted) => `${formatted} 사용 중, 경고 범위`}
            />,
        );
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });
});
