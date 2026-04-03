import { useRef } from 'react';

import { useIsoLayoutEffect } from '~/hooks/use-iso-layout-effect';

export const useLatest = <T>(value: T) => {
    const ref = useRef(value);

    useIsoLayoutEffect(() => {
        ref.current = value;
    }, [value]);

    return ref;
};
