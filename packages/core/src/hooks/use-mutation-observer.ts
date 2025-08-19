import { useEffect, useRef } from 'react';

interface Params {
    callback: (mutations: MutationRecord[]) => void;
    options?: MutationObserverInit;
}

export const useMutationObserver = <T extends HTMLElement>({ callback, options }: Params) => {
    const elementRef = useRef<T>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new MutationObserver(callback);
        observer.observe(element, options);

        return () => observer.disconnect();
    }, [callback, options]);

    return elementRef;
};
