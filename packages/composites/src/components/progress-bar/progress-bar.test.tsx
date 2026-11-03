import { cleanup, render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';

import { ProgressBar } from '.';

describe('<ProgressBar />', () => {
    afterEach(cleanup);

    it('should have no a11y violations', async () => {
        const { container } = render(
            <ProgressBar
                value={50}
                label="report.pdf 업로드"
                valueText={() => '150MB / 300MB'}
                description="업로드 중..."
            />,
        );

        expect(await axe(container)).toHaveNoViolations();
    });

    it('should name the progressbar with the label', () => {
        render(<ProgressBar value={42} label="report.pdf 업로드" />);

        expect(screen.getByRole('progressbar')).toHaveAccessibleName('report.pdf 업로드');
    });

    it('should expose the value and max to assistive technology', () => {
        render(<ProgressBar value={150} max={300} label="업로드" />);
        const bar = screen.getByRole('progressbar');

        expect(bar).toHaveAttribute('aria-valuenow', '150');
        expect(bar).toHaveAttribute('aria-valuemax', '300');
    });

    it('should announce the text from getAriaValueText', () => {
        render(
            <ProgressBar
                type="error"
                value={150}
                max={300}
                label="다운로드"
                getAriaValueText={() => '다운로드 실패'}
            />,
        );

        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '다운로드 실패');
    });

    it('should default max to 100', () => {
        render(<ProgressBar value={42} label="업로드" />);

        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100');
    });

    it('should become indeterminate when value is null', () => {
        render(<ProgressBar value={null} label="업로드" />);
        const bar = screen.getByRole('progressbar');

        expect(bar).not.toHaveAttribute('aria-valuenow');
        expect(bar).toHaveAttribute('data-indeterminate');
    });

    it('should show valueText as visible text hidden from assistive technology', () => {
        render(<ProgressBar value={50} label="업로드" valueText={() => '150MB / 300MB'} />);

        expect(screen.getByText('150MB / 300MB').closest('[aria-hidden="true"]')).not.toBeNull();
    });

    it('should render 0 when a valueText function returns 0', () => {
        render(<ProgressBar value={0} label="업로드" valueText={() => 0} />);

        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should call a valueText function with the formatted value and the value', () => {
        const valueText = vi.fn((formattedValue: string | null) => formattedValue);
        render(<ProgressBar value={42} label="업로드" valueText={valueText} />);

        expect(valueText).toHaveBeenCalledWith('42%', 42);
        expect(screen.getByText('42%')).toBeInTheDocument();
    });

    it('should pass "indeterminate" and null to a valueText function, as core does', () => {
        const valueText = vi.fn((formattedValue: string | null) => formattedValue);
        render(<ProgressBar value={null} label="업로드" valueText={valueText} />);

        expect(valueText).toHaveBeenCalledWith('indeterminate', null);
        expect(screen.getByText('indeterminate')).toBeInTheDocument();
    });

    it('should render nothing when a valueText function returns null', () => {
        render(
            <ProgressBar
                value={null}
                label="업로드"
                valueText={(formattedValue, value) => (value === null ? null : formattedValue)}
            />,
        );

        const bar = screen.getByRole('progressbar');

        expect(bar).not.toHaveTextContent('indeterminate');
        expect(bar.querySelector('[aria-hidden="true"]')).toBeEmptyDOMElement();
    });

    it('should render no value text when valueText is not given', () => {
        render(<ProgressBar value={42} label="업로드" />);
        const bar = screen.getByRole('progressbar');

        expect(bar.querySelector('[aria-hidden="true"]')).toBeNull();
        expect(bar).not.toHaveTextContent('42%');
    });

    it('should describe the progressbar with the description', () => {
        render(
            <ProgressBar
                value={42}
                type="error"
                label="업로드"
                description="업로드에 실패했습니다"
            />,
        );

        expect(screen.getByRole('progressbar')).toHaveAccessibleDescription(
            '업로드에 실패했습니다',
        );
    });
});
