import { useEffect, useState } from 'react';

import { getItems, watchItems } from '~/utils/data/session-store';
import type { QaItem } from '~/utils/data/session-store';

export const useQaItems = (): QaItem[] => {
    const [items, setItems] = useState<QaItem[]>([]);

    useEffect(() => {
        void getItems().then(setItems);
        const unwatch = watchItems((next) => setItems(next ?? []));
        return unwatch;
    }, []);

    return items;
};
