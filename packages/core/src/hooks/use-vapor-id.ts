'use client';

import { useId } from '@base-ui-components/utils/useId';

function useVaporId(deterministicId?: string): string | undefined {
    return useId(deterministicId, 'vapor-ui');
}

export { useVaporId };
