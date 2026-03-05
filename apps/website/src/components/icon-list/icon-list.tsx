'use client';

import { useMemo, useRef, useState } from 'react';

import { VStack } from '@vapor-ui/core';

import IconEmptyState from './icon-empty-state';
import {
    ICON_COUNTS,
    ICON_ITEMS,
    ICON_LIST,
    type IconCategory,
    VAPOR_ICONS,
} from './icon-list.constants';
import IconSearchBar from './icon-search-bar';
import IconTabs from './icon-tabs';
import { useIconSearch } from './use-icon-search';

const IconList = () => {
    const {
        search,
        setSearch,
        isSearching,
        totalCount,
        filteredCount,
        filteredItemsByCategory,
        categoryCounts,
    } = useIconSearch(VAPOR_ICONS);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [defaultTab, setDefaultTab] = useState<IconCategory>('basic');
    const [searchTab, setSearchTab] = useState<IconCategory>('basic');

    const firstCategoryWithResults = useMemo(() => {
        return ICON_LIST.find((category) => categoryCounts[category] > 0) ?? null;
    }, [categoryCounts]);

    const activeSearchTab =
        categoryCounts[searchTab] > 0 ? searchTab : (firstCategoryWithResults ?? searchTab);

    return (
        <VStack className="not-prose" $css={{ gap: '$250' }}>
            <IconSearchBar
                search={search}
                totalCount={totalCount}
                inputRef={searchInputRef}
                setSearch={setSearch}
            />

            <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                {isSearching && filteredCount > 0
                    ? `"${search}" 검색 결과 ${filteredCount.toLocaleString()}개`
                    : ''}
            </span>

            {isSearching ? (
                filteredCount === 0 || !filteredItemsByCategory ? (
                    <IconEmptyState search={search} />
                ) : (
                    <IconTabs
                        value={activeSearchTab}
                        onValueChange={(value) => setSearchTab(value as IconCategory)}
                        counts={categoryCounts}
                        itemsByCategory={filteredItemsByCategory}
                        disableEmptyTabs
                    />
                )
            ) : (
                <IconTabs
                    value={defaultTab}
                    onValueChange={(value) => setDefaultTab(value as IconCategory)}
                    counts={ICON_COUNTS}
                    itemsByCategory={ICON_ITEMS}
                />
            )}
        </VStack>
    );
};

export default IconList;
