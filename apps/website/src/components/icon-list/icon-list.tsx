'use client';

import { VStack } from '@vapor-ui/core';

import IconEmptyState from './icon-empty-state';
import { ICON_COUNTS, ICON_ITEMS, VAPOR_ICONS } from './icon-list.constants';
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

    return (
        <VStack className="not-prose" $css={{ gap: '$250' }}>
            <IconSearchBar search={search} totalCount={totalCount} setSearch={setSearch} />

            <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                {isSearching && filteredCount > 0
                    ? `"${search}" 검색 결과 ${filteredCount.toLocaleString()}개`
                    : ''}
            </span>

            <IconTabs
                defaultValue="basic"
                counts={isSearching ? categoryCounts : ICON_COUNTS}
                itemsByCategory={isSearching ? filteredItemsByCategory : ICON_ITEMS}
                disableEmptyTabs={isSearching}
                emptyState={
                    isSearching && filteredCount === 0 ? (
                        <IconEmptyState search={search} />
                    ) : undefined
                }
            />
        </VStack>
    );
};

export default IconList;
