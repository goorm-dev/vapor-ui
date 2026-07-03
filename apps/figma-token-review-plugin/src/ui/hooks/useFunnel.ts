import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { useCallback, useState } from 'react';

type Variant = { kind: string };

type Handlers<T extends Variant> = {
    [K in T['kind']]: (state: Extract<T, { kind: K }>) => ReactNode;
};

type Funnel<T extends Variant> = {
    state: T;
    setState: Dispatch<SetStateAction<T>>;
    match: (handlers: Handlers<T>) => ReactNode;
};

export function useFunnel<T extends Variant>(initial: T): Funnel<T> {
    const [state, setState] = useState<T>(initial);

    const match = useCallback(
        (handlers: Handlers<T>): ReactNode => {
            const handler = handlers[state.kind as T['kind']] as (
                state: Extract<T, { kind: T['kind'] }>,
            ) => ReactNode;
            return handler(state as Extract<T, { kind: T['kind'] }>);
        },
        [state],
    );

    return { state, setState, match };
}
