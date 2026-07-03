import { useSyncExternalStore } from 'react';

export type Store<T> = {
    getState: () => T;
    setState: (next: T | ((prev: T) => T)) => void;
    subscribe: (listener: () => void) => () => void;
};

export function createStore<T>(initial: T): Store<T> {
    let state = initial;
    const listeners = new Set<() => void>();

    return {
        getState: () => state,
        setState: (next) => {
            const value = typeof next === 'function' ? (next as (prev: T) => T)(state) : next;

            if (Object.is(value, state)) return;

            state = value;
            listeners.forEach((fn) => {
                fn();
            });
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}

export function useStore<T>(store: Store<T>): T {
    return useSyncExternalStore(store.subscribe, store.getState);
}
