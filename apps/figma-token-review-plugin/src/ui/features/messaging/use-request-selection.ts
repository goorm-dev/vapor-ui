import { useEffect } from 'react';

import { postToCode } from '~/common/messages';

export const useRequestSelection = () => {
    useEffect(() => {
        postToCode({ type: 'request-selection' });
    }, []);
};
