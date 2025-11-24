import * as React from 'react';

import type { AnyProp } from '~/utils/types';

import { useIsoLayoutEffect } from './use-iso-layout-effect';

const useReactId = (React as AnyProp)[' useId '.trim().toString()] || (() => undefined);
let globalId = 0;

function useVaporId(deterministicId?: string): string {
    const [id, setId] = React.useState<string | undefined>(useReactId());
    // React versions older than 18 will have client-side ids only.
    useIsoLayoutEffect(() => {
        if (!deterministicId) setId((reactId) => reactId ?? String(globalId++));
    }, [deterministicId]);

    return deterministicId || (id ? `v-${id}` : '');
}

export { useVaporId };
