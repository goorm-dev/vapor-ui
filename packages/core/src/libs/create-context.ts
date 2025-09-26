'use client';

import { createContext as createReactContext, useContext as useReactContext } from 'react';

export type CreateContextOptions<T> = {
    strict?: boolean;
    hookName?: string;
    providerName?: string;
    errorMessage?: string;
    name?: string;
    defaultValue?: T;
};

export type CreateContextReturn<T> = [React.Provider<T>, () => T, React.Context<T>];

// Global registry to ensure context instances are reused across different bundles
// This prevents context sharing issues when splitting: false in tsup config
const globalContextRegistry = globalThis as typeof globalThis & {
    __vaporContextRegistry?: Map<string, React.Context<unknown>>;
};
if (!globalContextRegistry.__vaporContextRegistry) {
    globalContextRegistry.__vaporContextRegistry = new Map();
}

const getErrorMessage = (hook: string, provider: string) => {
    return `${hook} returned \`undefined\`. Seems you forgot to wrap component within ${provider}`;
};

export const createContext = <T>({
    name,
    strict = true,
    hookName = 'useContext',
    providerName = 'Provider',
    errorMessage,
    defaultValue,
}: CreateContextOptions<T> = {}) => {
    let Context: React.Context<T | undefined>;

    // Reuse existing context if name is provided and already exists in global registry
    if (name && globalContextRegistry.__vaporContextRegistry?.has(name)) {
        Context = globalContextRegistry.__vaporContextRegistry.get(name) as React.Context<
            T | undefined
        >;
    } else {
        Context = createReactContext<T | undefined>(defaultValue);
        Context.displayName = name;

        // Store in global registry if name is provided
        if (name && globalContextRegistry.__vaporContextRegistry) {
            globalContextRegistry.__vaporContextRegistry.set(
                name,
                Context as React.Context<unknown>,
            );
        }
    }

    function useContext() {
        const context = useReactContext(Context);

        if (!context && strict) {
            const error = new Error(errorMessage ?? getErrorMessage(hookName, providerName));
            error.name = 'ContextError';
            throw error;
        }

        return context;
    }

    return [Context.Provider, useContext, Context] as CreateContextReturn<T>;
};
