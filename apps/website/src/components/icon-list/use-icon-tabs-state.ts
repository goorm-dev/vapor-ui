import { useEffect, useMemo, useRef, useState } from 'react';

import { ICON_LIST, type IconCategory } from './icon-list.constants';

type UseIconTabsStateParams = {
    defaultValue: IconCategory;
    counts: Record<IconCategory, number>;
    disableEmptyTabs: boolean;
};

export const useIconTabsState = ({
    defaultValue,
    counts,
    disableEmptyTabs,
}: UseIconTabsStateParams) => {
    const [activeTab, setActiveTab] = useState<IconCategory>(defaultValue);
    const previousIsSearchingRef = useRef(disableEmptyTabs);
    const tabBeforeSearchRef = useRef<IconCategory | null>(null);

    const firstTabWithResults = useMemo(() => {
        return ICON_LIST.find((iconType) => counts[iconType] > 0) ?? null;
    }, [counts]);

    useEffect(() => {
        const wasSearching = previousIsSearchingRef.current;
        const isSearching = disableEmptyTabs;

        if (!wasSearching && isSearching) {
            tabBeforeSearchRef.current = activeTab;
        }

        if (wasSearching && !isSearching) {
            if (tabBeforeSearchRef.current) {
                setActiveTab(tabBeforeSearchRef.current);
            }
            tabBeforeSearchRef.current = null;
        }

        previousIsSearchingRef.current = isSearching;
    }, [activeTab, disableEmptyTabs]);

    useEffect(() => {
        if (!disableEmptyTabs || counts[activeTab] > 0) return;
        if (!firstTabWithResults) return;

        setActiveTab(firstTabWithResults);
    }, [activeTab, counts, disableEmptyTabs, firstTabWithResults]);

    return {
        activeTab,
        setActiveTab,
        indicatorKey: `${activeTab}-${counts[activeTab]}`,
    };
};
