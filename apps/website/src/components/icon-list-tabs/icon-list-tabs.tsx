'use client';

import {
    type KeyboardEvent,
    type ReactNode,
    memo,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';

import { Badge, Box, Flex, Grid, IconButton, Tabs, Text, TextInput, VStack } from '@vapor-ui/core';
import { CloseOutlineIcon, SearchOutlineIcon } from '@vapor-ui/icons';

import IconListItem from '~/components/icon-list-item';

import { ICON_LIST, VAPOR_ICONS } from './icon-list-tabs.constants';
import { useIconSearch } from './use-icon-search';

const CATEGORY_LABELS: Record<string, string> = {
    basic: 'Basic',
    outline: 'Outline',
    symbol: 'Symbol',
    'symbol-black': 'Symbol Black',
} as const;

// 아이콘 키 사전 계산 (rerender 시 Object.keys 호출 방지)
const ICON_KEYS = Object.fromEntries(
    ICON_LIST.map((type) => [type, Object.keys(VAPOR_ICONS[type])]),
) as Record<(typeof ICON_LIST)[number], string[]>;

const ICON_COUNTS = Object.fromEntries(
    ICON_LIST.map((type) => [type, ICON_KEYS[type].length]),
) as Record<(typeof ICON_LIST)[number], number>;

const IconList = () => {
    const { search, setSearch, filtered, isSearching, totalCount, getCategoryCount } =
        useIconSearch(VAPOR_ICONS);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // 검색 결과를 카테고리별로 그룹화
    const groupedResults = useMemo(() => {
        if (!filtered) return null;

        const groups: Record<string, typeof filtered> = {};
        for (const item of filtered) {
            if (!groups[item.category]) {
                groups[item.category] = [];
            }
            groups[item.category].push(item);
        }
        return groups;
    }, [filtered]);

    // 검색 결과가 있는 첫 번째 카테고리
    const firstCategoryWithResults = useMemo(() => {
        return ICON_LIST.find((category) => groupedResults?.[category]?.length) ?? null;
    }, [groupedResults]);

    const [defaultTab, setDefaultTab] = useState('basic');
    const [searchTab, setSearchTab] = useState('basic');

    const activeSearchTab = isSearching
        ? groupedResults?.[searchTab]?.length
            ? searchTab
            : firstCategoryWithResults
        : searchTab;

    const handleClearSearch = useCallback(() => {
        setSearch('');
        searchInputRef.current?.focus();
    }, [setSearch]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape' && search) {
                handleClearSearch();
            }
        },
        [search, handleClearSearch],
    );

    return (
        <VStack $css={{ gap: '$250' }}>
            {/* Search area */}
            <Box
                $css={{
                    position: 'relative',
                    paddingBlock: '$150',
                    backgroundColor: '$bg-canvas-100',
                }}
            >
                <Box $css={{ position: 'relative' }}>
                    <TextInput
                        ref={searchInputRef}
                        placeholder={`${totalCount.toLocaleString()}개의 아이콘 검색...`}
                        value={search}
                        onValueChange={setSearch}
                        onKeyDown={handleKeyDown}
                        size="lg"
                        aria-label="아이콘 검색"
                        $css={{ width: '100%', paddingLeft: '$500' }}
                    />
                    <Flex
                        $css={{
                            position: 'absolute',
                            left: '$175',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '$fg-success-200',
                            pointerEvents: 'none',
                        }}
                    >
                        <SearchOutlineIcon size="18" aria-hidden="true" />
                    </Flex>
                    {search && (
                        <Box
                            $css={{
                                position: 'absolute',
                                right: '$150',
                                top: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <IconButton
                                variant="ghost"
                                size="sm"
                                onClick={handleClearSearch}
                                aria-label="검색어 지우기"
                            >
                                <CloseOutlineIcon size="16" />
                            </IconButton>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Search results count announcement (for screen readers) */}
            <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                {isSearching && filtered && filtered.length > 0
                    ? `"${search}" 검색 결과 ${filtered.length.toLocaleString()}개`
                    : ''}
            </span>

            {/* Search results */}
            {isSearching ? (
                filtered?.length === 0 ? (
                    <EmptyState search={search} />
                ) : (
                    <Tabs.Root
                        value={activeSearchTab}
                        onValueChange={setSearchTab}
                        variant="line"
                        size="md"
                        activateOnFocus={false}
                    >
                        <Tabs.List>
                            {ICON_LIST.map((iconType) => {
                                const count = getCategoryCount(iconType);
                                return (
                                    <Tabs.Button
                                        key={iconType}
                                        value={iconType}
                                        disabled={count === 0}
                                    >
                                        {CATEGORY_LABELS[iconType] ?? iconType}
                                        <Badge
                                            colorPalette="hint"
                                            size="sm"
                                            $css={{
                                                marginLeft: '$100',
                                                fontVariantNumeric: 'tabular-nums',
                                            }}
                                        >
                                            {count}
                                        </Badge>
                                    </Tabs.Button>
                                );
                            })}
                        </Tabs.List>

                        {ICON_LIST.map((iconType) => {
                            const icons = groupedResults?.[iconType] ?? [];
                            return (
                                <Tabs.Panel key={iconType} value={iconType} keepMounted>
                                    <Box $css={{ paddingTop: '$200' }}>
                                        <IconGrid>
                                            {icons.map(({ name, icon }) => (
                                                <Box key={name} role="listitem">
                                                    <IconListItem icon={icon} iconName={name} />
                                                </Box>
                                            ))}
                                        </IconGrid>
                                    </Box>
                                </Tabs.Panel>
                            );
                        })}
                    </Tabs.Root>
                )
            ) : (
                /* Default tab content */
                <Tabs.Root
                    value={defaultTab}
                    onValueChange={setDefaultTab}
                    variant="line"
                    size="md"
                    activateOnFocus={false}
                >
                    <Tabs.List>
                        {ICON_LIST.map((iconType) => (
                            <Tabs.Button key={iconType} value={iconType}>
                                {CATEGORY_LABELS[iconType] ?? iconType}
                                <Badge
                                    colorPalette="hint"
                                    size="sm"
                                    $css={{
                                        marginLeft: '$100',
                                        fontVariantNumeric: 'tabular-nums',
                                    }}
                                >
                                    {ICON_COUNTS[iconType]}
                                </Badge>
                            </Tabs.Button>
                        ))}
                    </Tabs.List>

                    {ICON_LIST.map((iconType) => {
                        return (
                            <Tabs.Panel key={iconType} value={iconType} keepMounted>
                                <Box $css={{ paddingTop: '$200' }}>
                                    <IconGrid>
                                        {ICON_KEYS[iconType].map((iconKey) => (
                                            <Box key={iconKey} role="listitem">
                                                <IconListItem
                                                    icon={VAPOR_ICONS[iconType][iconKey]}
                                                    iconName={iconKey}
                                                />
                                            </Box>
                                        ))}
                                    </IconGrid>
                                </Box>
                            </Tabs.Panel>
                        );
                    })}
                </Tabs.Root>
            )}
        </VStack>
    );
};

const IconGrid = memo(function IconGrid({ children }: { children: ReactNode }) {
    return (
        <Box
            $css={{
                maxHeight: '32rem',
                overflowY: 'auto',
                padding: '$100',
                borderRadius: '$400',
                backgroundColor: '$bg-secondary-100',
                border: '1px solid $border-normal',
            }}
        >
            <Grid.Root
                role="list"
                aria-label="아이콘 목록"
                templateColumns="repeat(auto-fill, minmax(8.5rem, 1fr))"
                $css={{
                    gap: '$150',
                    padding: '$200',
                }}
            >
                {children}
            </Grid.Root>
        </Box>
    );
});

/* 빈 상태 */
const EmptyState = memo(function EmptyState({ search }: { search: string }) {
    return (
        <VStack
            role="status"
            aria-live="polite"
            $css={{
                alignItems: 'center',
                justifyContent: 'center',
                gap: '$200',
                minHeight: '16rem',
                padding: '$400',
                borderRadius: '$400',
                backgroundColor: '$bg-secondary-100',
                border: '1px solid',
                borderColor: '$border-normal',
            }}
        >
            <Flex
                aria-hidden="true"
                $css={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '3.5rem',
                    height: '3.5rem',
                    borderRadius: '$400',
                    backgroundColor: '$bg-secondary-200',
                    color: '$text-secondary-200',
                }}
            >
                <SearchOutlineIcon size="28" />
            </Flex>
            <VStack $css={{ alignItems: 'center', gap: '$050', textAlign: 'center' }}>
                <Text typography="body2" foreground="secondary-200">
                    &quot;{search}&quot; 검색 결과가 없습니다
                </Text>
                <Text typography="body2" foreground="secondary-200">
                    다른 키워드로 검색해 보세요
                </Text>
            </VStack>
        </VStack>
    );
});

export default IconList;
