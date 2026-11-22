import { act, renderHook } from '@testing-library/react';

import { useInterval } from './useInterval';

describe('useInterval', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('fires the callback every interval', () => {
        const callback = vi.fn();
        renderHook(() => useInterval(callback, 1000));

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(callback).toHaveBeenCalledTimes(3);
    });

    it('does not fire the callback when delay is null', () => {
        const callback = vi.fn();
        renderHook(() => useInterval(callback, null));

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(callback).not.toHaveBeenCalled();
    });

    it('updates the interval when delay changes', () => {
        const callback = vi.fn();
        const view = renderHook(({ delay }) => useInterval(callback, delay), {
            initialProps: { delay: 1000 },
        });

        act(() => {
            vi.advanceTimersByTime(2000);
        });
        expect(callback).toHaveBeenCalledTimes(2);

        view.rerender({ delay: 500 });
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(callback).toHaveBeenCalledTimes(4);
    });

    it('clears the interval on unmount', () => {
        const callback = vi.fn();
        const view = renderHook(() => useInterval(callback, 1000));

        view.unmount();
        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(callback).not.toHaveBeenCalled();
    });

    it('always invokes the latest callback', () => {
        const first = vi.fn();
        const second = vi.fn();

        const view = renderHook(({ cb }) => useInterval(cb, 1000), {
            initialProps: { cb: first },
        });

        view.rerender({ cb: second });
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });
});
