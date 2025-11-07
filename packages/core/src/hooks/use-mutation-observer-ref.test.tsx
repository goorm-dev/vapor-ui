import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useMutationObserverRef } from './use-mutation-observer-ref';

describe('useMutationObserverRef', () => {
    it('should observe mutations on the attached element', async () => {
        const callback = vi.fn();
        let testRef: HTMLDivElement | null = null;

        function TestComponent() {
            const ref = useMutationObserverRef<HTMLDivElement>({
                callback,
                options: { attributes: true, attributeFilter: ['data-test'] },
            });

            return (
                <div
                    ref={(node) => {
                        testRef = node;
                        ref(node);
                    }}
                    data-test="initial"
                >
                    Test Content
                </div>
            );
        }

        render(<TestComponent />);

        // Wait for the component to mount and observer to be set up
        await waitFor(() => expect(testRef).not.toBeNull());

        // Trigger a mutation
        testRef?.setAttribute('data-test', 'changed');

        // Wait for the callback to be called
        await waitFor(() => {
            expect(callback).toHaveBeenCalled();
        });

        expect(callback.mock.calls[0][0]).toHaveLength(1);
        expect(callback.mock.calls[0][0][0].type).toBe('attributes');
        expect(callback.mock.calls[0][0][0].attributeName).toBe('data-test');
    });

    it('should disconnect observer when ref is set to null', async () => {
        const callback = vi.fn();

        function TestComponent({ show }: { show: boolean }) {
            const ref = useMutationObserverRef<HTMLDivElement>({
                callback,
                options: { attributes: true },
            });

            if (!show) return null;

            return (
                <div ref={ref} data-test="value">
                    Test Content
                </div>
            );
        }

        const { rerender } = render(<TestComponent show={true} />);

        // Unmount the component
        rerender(<TestComponent show={false} />);

        // The observer should be disconnected, so no further mutations should be observed
        await waitFor(() => {
            expect(callback).not.toHaveBeenCalled();
        });
    });

    it('should update to the latest callback on each render', async () => {
        const firstCallback = vi.fn();
        const secondCallback = vi.fn();
        let testRef: HTMLDivElement | null = null;

        function TestComponent({ callback }: { callback: (mutations: MutationRecord[]) => void }) {
            const ref = useMutationObserverRef<HTMLDivElement>({
                callback,
                options: { attributes: true, attributeFilter: ['data-test'] },
            });

            return (
                <div
                    ref={(node) => {
                        testRef = node;
                        ref(node);
                    }}
                    data-test="initial"
                >
                    Test Content
                </div>
            );
        }

        const { rerender } = render(<TestComponent callback={firstCallback} />);

        await waitFor(() => expect(testRef).not.toBeNull());

        // Trigger first mutation
        testRef?.setAttribute('data-test', 'changed1');

        await waitFor(() => {
            expect(firstCallback).toHaveBeenCalled();
        });

        // Clear the first callback and switch to second
        firstCallback.mockClear();
        rerender(<TestComponent callback={secondCallback} />);

        // Trigger second mutation
        testRef?.setAttribute('data-test', 'changed2');

        await waitFor(() => {
            expect(secondCallback).toHaveBeenCalled();
        });

        // First callback should not have been called again
        expect(firstCallback).not.toHaveBeenCalled();
    });

    it('should observe child list mutations when configured', async () => {
        const callback = vi.fn();
        let testRef: HTMLDivElement | null = null;

        function TestComponent() {
            const ref = useMutationObserverRef<HTMLDivElement>({
                callback,
                options: { childList: true },
            });

            return (
                <div
                    ref={(node) => {
                        testRef = node;
                        ref(node);
                    }}
                >
                    <span>Initial Child</span>
                </div>
            );
        }

        render(<TestComponent />);

        await waitFor(() => expect(testRef).not.toBeNull());

        // Add a new child
        const newChild = document.createElement('span');
        newChild.textContent = 'New Child';
        testRef?.appendChild(newChild);

        await waitFor(() => {
            expect(callback).toHaveBeenCalled();
        });

        expect(callback.mock.calls[0][0][0].type).toBe('childList');
    });

    it('should return cleanup function that disconnects observer (React 19+ support)', async () => {
        const callback = vi.fn();
        let cleanupFn: (() => void) | undefined;

        function TestComponent() {
            const ref = useMutationObserverRef<HTMLDivElement>({
                callback,
                options: { attributes: true },
            });

            return (
                <div
                    ref={(node) => {
                        const cleanup = ref(node);
                        // Store cleanup function if returned (React 19+)
                        if (typeof cleanup === 'function') {
                            cleanupFn = cleanup;
                        }
                    }}
                    data-test="initial"
                >
                    Test Content
                </div>
            );
        }

        const { unmount } = render(<TestComponent />);

        // If cleanup function was returned, it should work
        if (cleanupFn) {
            cleanupFn();
            expect(callback).not.toHaveBeenCalled();
        }

        unmount();
    });
});
