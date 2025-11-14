import * as React from 'react';

import { createContext } from '~/libs/create-context';
import type { AnyProp } from '~/utils/types';

// @reference https://github.com/adobe/react-spectrum/blob/main/packages/%2540react-aria/ssr/src/SSRProvider.tsx
const [VaporLegacyIdProvider, useVaporLegacyIdCounter] = createContext<
    React.MutableRefObject<number>
>({
    name: 'VaporLegacyIdProvider',
    strict: false,
    defaultValue: { current: 0 },
});

const componentIds = new WeakMap();

function useCounter(isDisabled = false) {
    const ctx = useVaporLegacyIdCounter();
    const ref = React.useRef<number | null>(null);
    if (ref.current === null && !isDisabled) {
        // In strict mode, React renders components twice, and the ref will be reset to null on the second render.
        // This means our id counter will be incremented twice instead of once. This is a problem because on the
        // server, components are only rendered once and so ids generated on the server won't match the client.
        // In React 18, useId was introduced to solve this, but it is not available in older versions. So to solve this
        // we need to use some React internals to access the underlying Fiber instance, which is stable between renders.
        // This is exposed as ReactCurrentOwner in development, which is all we need since StrictMode only runs in development.
        // To ensure that we only increment the global counter once, we store the starting id for this component in
        // a weak map associated with the Fiber. On the second render, we reset the global counter to this value.
        // Since React runs the second render immediately after the first, this is safe.
        // @ts-ignore
        const currentOwner = (React as AnyProp).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
            ?.ReactCurrentOwner?.current;
        if (currentOwner) {
            const prevComponentValue = componentIds.get(currentOwner);
            if (prevComponentValue == null) {
                // On the first render, and first call to useId, store the id and state in our weak map.
                componentIds.set(currentOwner, {
                    id: ctx.current,
                    state: currentOwner.memoizedState,
                });
            } else if (currentOwner.memoizedState !== prevComponentValue.state) {
                // On the second render, the memoizedState gets reset by React.
                // Reset the counter, and remove from the weak map so we don't
                // do this for subsequent useId calls.
                ctx.current = prevComponentValue.id;
                componentIds.delete(currentOwner);
            }
        }

        ref.current = ++ctx.current;
    }

    return ref.current;
}

const useReactId =
    (React as AnyProp)[' useId '.trim().toString()] ||
    ((isDisabled: boolean) => useCounter(isDisabled));

function useVaporId(deterministicId?: string): string {
    const id = useReactId(!!deterministicId);

    return deterministicId || (id ? `v-${id}` : '');
}

export { useVaporId, VaporLegacyIdProvider };
