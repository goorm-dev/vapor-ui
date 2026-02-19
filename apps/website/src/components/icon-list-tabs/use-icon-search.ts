'use client';

import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import type { FunctionComponent } from 'react';

import type { IconProps } from '@vapor-ui/icons';
import Fuse from 'fuse.js';

type IconEntry = {
    name: string;
    icon: FunctionComponent<IconProps>;
    category: string;
};

type IconsByCategory = {
    [key: string]: { [key: string]: FunctionComponent<IconProps> };
};

export const useIconSearch = (icons: IconsByCategory) => {
    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);

    const { allIcons, fuse } = useMemo(() => {
        const entries: IconEntry[] = [];

        for (const [category, categoryIcons] of Object.entries(icons)) {
            for (const [name, icon] of Object.entries(categoryIcons)) {
                entries.push({ name, icon, category });
            }
        }

        const fuseInstance = new Fuse(entries, {
            keys: ['name'],
            threshold: 0.3,
            includeScore: true,
            ignoreLocation: true,
            minMatchCharLength: 1,
        });

        return { allIcons: entries, fuse: fuseInstance };
    }, [icons]);

    const filtered = useMemo(() => {
        if (!deferredSearch.trim()) return null;

        return fuse.search(deferredSearch).map(({ item }) => item);
    }, [deferredSearch, fuse]);

    const getCategoryCount = useCallback(
        (category: string): number => {
            if (!filtered) return 0;
            return filtered.filter((item) => item.category === category).length;
        },
        [filtered]
    );

    return {
        search,
        setSearch,
        filtered,
        isSearching: !!deferredSearch.trim(),
        totalCount: allIcons.length,
        getCategoryCount,
    };
};
