import { useCallback, useEffect, useState } from 'react';

export function useForcedRerendering(register: (listener: () => void) => () => void) {
    const [, setState] = useState<object>({});
    const rerender = useCallback(() => setState({}), []);

    useEffect(() => {
        return register(rerender);
    }, [register, rerender]);
}
