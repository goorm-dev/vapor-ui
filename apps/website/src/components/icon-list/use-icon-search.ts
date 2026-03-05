'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import type { FunctionComponent } from 'react';

import type { IconProps } from '@vapor-ui/icons';
import Fuse from 'fuse.js';

import { ICON_LIST, type IconCategory, type IconItem } from './icon-list.constants';

type IconEntry = IconItem & {
    category: IconCategory;
};

type IconsByCategory = Record<IconCategory, Record<string, FunctionComponent<IconProps>>>;

const createEmptyCategoryItems = (): Record<IconCategory, IconItem[]> => {
    return ICON_LIST.reduce(
        (accumulator, category) => {
            accumulator[category] = [];
            return accumulator;
        },
        {} as Record<IconCategory, IconItem[]>,
    );
};

const createEmptyCategoryCounts = (): Record<IconCategory, number> => {
    return ICON_LIST.reduce(
        (accumulator, category) => {
            accumulator[category] = 0;
            return accumulator;
        },
        {} as Record<IconCategory, number>,
    );
};

export const useIconSearch = (icons: IconsByCategory) => {
    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);

    const { allIcons, fuse } = useMemo(() => {
        const entries: IconEntry[] = [];

        for (const category of ICON_LIST) {
            const categoryIcons = icons[category];
            for (const [name, icon] of Object.entries(categoryIcons)) {
                entries.push({ name, icon, category });
            }
        }

        const fuseInstance = new Fuse(entries, {
            keys: ['name'],
            threshold: 0.3,
            includeScore: false,
            ignoreLocation: true,
            minMatchCharLength: 1,
        });

        return { allIcons: entries, fuse: fuseInstance };
    }, [icons]);

    const filtered = useMemo(() => {
        if (!deferredSearch.trim()) return null;

        return fuse.search(deferredSearch).map(({ item }) => item);
    }, [deferredSearch, fuse]);

    const filteredItemsByCategory = useMemo(() => {
        if (!filtered) return null;

        const grouped = createEmptyCategoryItems();
        for (const { category, name, icon } of filtered) {
            grouped[category].push({ name, icon });
        }

        return grouped;
    }, [filtered]);

    const categoryCounts = useMemo(() => {
        if (!filteredItemsByCategory) return createEmptyCategoryCounts();

        return Object.fromEntries(
            ICON_LIST.map((category) => [category, filteredItemsByCategory[category].length]),
        ) as Record<IconCategory, number>;
    }, [filteredItemsByCategory]);

    return {
        search,
        setSearch,
        isSearching: !!deferredSearch.trim(),
        totalCount: allIcons.length,
        filteredCount: filtered?.length ?? 0,
        filteredItemsByCategory,
        categoryCounts,
    };
};
