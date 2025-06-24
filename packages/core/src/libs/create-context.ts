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
    const Context = createReactContext<T | undefined>(defaultValue);

    Context.displayName = name;

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
