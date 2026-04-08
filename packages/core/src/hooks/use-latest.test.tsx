import { useEffect } from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useLatest } from './use-latest';

describe('useLatest', () => {
    it('returns a ref with the initial value', () => {
        const spy = vi.fn();

        const TestComponent = ({ value }: { value: number }) => {
            const ref = useLatest(value);
            spy(ref.current);
            return null;
        };

        render(<TestComponent value={42} />);
        expect(spy).toHaveBeenCalledWith(42);
    });

    it('updates ref.current when the value changes', () => {
        const spy = vi.fn();

        const TestComponent = ({ value }: { value: number }) => {
            const ref = useLatest(value);

            useEffect(() => {
                spy(ref.current);
            }, [ref, value]);

            return null;
        };

        const { rerender } = render(<TestComponent value={1} />);
        expect(spy).toHaveBeenLastCalledWith(1);

        rerender(<TestComponent value={2} />);
        expect(spy).toHaveBeenLastCalledWith(2);
    });

    it('keeps the same ref identity across re-renders', () => {
        const refs: React.RefObject<number>[] = [];

        const TestComponent = ({ value }: { value: number }) => {
            const ref = useLatest(value);
            refs.push(ref);
            return null;
        };

        const { rerender } = render(<TestComponent value={1} />);
        rerender(<TestComponent value={2} />);
        rerender(<TestComponent value={3} />);

        expect(refs).toHaveLength(3);
        expect(refs[0]).toBe(refs[1]);
        expect(refs[1]).toBe(refs[2]);
    });

    it('provides the latest value to callbacks without re-subscribing effects', () => {
        const cleanupSpy = vi.fn();
        const callbackSpy = vi.fn();

        const TestComponent = ({ handler }: { handler: () => string }) => {
            const handlerRef = useLatest(handler);

            useEffect(() => {
                const id = setInterval(() => {
                    callbackSpy(handlerRef.current());
                }, 100);
                return () => {
                    cleanupSpy();
                    clearInterval(id);
                };
                // handlerRef is stable, so this effect should not re-run
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, []);

            return null;
        };

        const { rerender } = render(<TestComponent handler={() => 'first'} />);
        rerender(<TestComponent handler={() => 'second'} />);
        rerender(<TestComponent handler={() => 'third'} />);

        // Effect should never have been cleaned up and re-run
        expect(cleanupSpy).not.toHaveBeenCalled();
    });

    it('works with object values', () => {
        const spy = vi.fn();

        const TestComponent = ({ config }: { config: { width: number; height: number } }) => {
            const ref = useLatest(config);

            useEffect(() => {
                spy(ref.current);
            }, [ref, config]);

            return null;
        };

        const { rerender } = render(<TestComponent config={{ width: 10, height: 20 }} />);
        expect(spy).toHaveBeenLastCalledWith({ width: 10, height: 20 });

        rerender(<TestComponent config={{ width: 30, height: 40 }} />);
        expect(spy).toHaveBeenLastCalledWith({ width: 30, height: 40 });
    });
});
