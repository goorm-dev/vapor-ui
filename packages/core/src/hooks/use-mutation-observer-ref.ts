import { useCallback, useRef } from 'react';

interface Params {
    callback: (mutations: MutationRecord[]) => void;
    options?: MutationObserverInit;
}

/**
 * A hook that returns a callback ref which sets up a MutationObserver
 * when attached to a DOM element.
 *
 * This implementation uses callback refs instead of useEffect to avoid
 * issues with stale dependencies and unnecessary observer recreation.
 * It stores the callback and options in refs to maintain stable references
 * across renders, ensuring compatibility with React 17+.
 *
 * For React 19+, the callback ref returns a cleanup function that will
 * automatically disconnect the observer when the ref changes or unmounts.
 *
 * @see https://tkdodo.eu/blog/ref-callbacks-react-19-and-the-compiler
 *
 * @example
 * const ref = useMutationObserverRef({
 *   callback: (mutations) => console.log(mutations),
 *   options: { attributes: true }
 * });
 *
 * return <div ref={ref}>Content</div>;
 */
export const useMutationObserverRef = <T extends HTMLElement>({
    callback,
    options,
}: Params) => {
    const observerRef = useRef<MutationObserver | null>(null);
    const callbackRef = useRef(callback);
    const optionsRef = useRef(options);

    // Keep refs up to date with latest values
    callbackRef.current = callback;
    optionsRef.current = options;

    const refCallback = useCallback((node: T | null) => {
        // Cleanup previous observer if it exists
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        // Set up new observer if node is present
        if (node) {
            // Use the refs to get the latest callback and options
            const observer = new MutationObserver((mutations) => {
                callbackRef.current(mutations);
            });
            observer.observe(node, optionsRef.current);
            observerRef.current = observer;

            // Return cleanup function for React 19+
            // For React 17-18, this return value is ignored
            return () => {
                observer.disconnect();
                if (observerRef.current === observer) {
                    observerRef.current = null;
                }
            };
        }
    }, []); // Empty dependency array - stable across all renders

    return refCallback;
};
