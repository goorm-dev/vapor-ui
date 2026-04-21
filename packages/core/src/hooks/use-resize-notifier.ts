import { useCallback, useEffect, useRef } from 'react';

export function useResizeNotifier(rootElement: HTMLElement | null) {
    const listenersRef = useRef(new Set<() => void>());
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const observedElementsRef = useRef(new Set<HTMLElement>());

    const notify = useCallback(() => {
        listenersRef.current.forEach((listener) => {
            listener();
        });
    }, []);

    useEffect(() => {
        if (typeof ResizeObserver === 'undefined' || !rootElement) return;

        const resizeObserver = new ResizeObserver(() => {
            if (!listenersRef.current.size) {
                return;
            }

            notify();
        });

        resizeObserverRef.current = resizeObserver;
        resizeObserver.observe(rootElement);

        observedElementsRef.current.forEach((element) => {
            resizeObserver.observe(element);
        });

        return () => {
            resizeObserver.disconnect();
            resizeObserverRef.current = null;
        };
    }, [rootElement, notify]);

    const registerListener = useCallback((listener: () => void) => {
        listenersRef.current.add(listener);
        return () => {
            listenersRef.current.delete(listener);
        };
    }, []);

    const observeElement = useCallback((element: HTMLElement) => {
        observedElementsRef.current.add(element);
        resizeObserverRef.current?.observe(element);
    }, []);

    const unobserveElement = useCallback((element: HTMLElement) => {
        observedElementsRef.current.delete(element);
        resizeObserverRef.current?.unobserve(element);
    }, []);

    return { registerListener, observeElement, unobserveElement };
}
