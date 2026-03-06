import { memo } from 'react';
import type { ReactNode } from 'react';

import { Badge, Box, Tabs } from '@vapor-ui/core';

import IconGrid from './icon-grid';
import {
    CATEGORY_LABELS,
    ICON_LIST,
    type IconCategory,
    type IconItem,
} from './icon-list.constants';
import { useIconTabsState } from './use-icon-tabs-state';

type IconTabsProps = {
    defaultValue?: IconCategory;
    counts: Record<IconCategory, number>;
    itemsByCategory: Record<IconCategory, IconItem[]>;
    disableEmptyTabs?: boolean;
    emptyState?: ReactNode;
};

type IconTabButtonProps = {
    iconType: IconCategory;
    count: number;
    disableEmptyTabs: boolean;
};

const IconTabButton = memo(({ iconType, count, disableEmptyTabs }: IconTabButtonProps) => {
    return (
        <Tabs.Button
            value={iconType}
            disabled={disableEmptyTabs && count === 0}
            $css={{ flexShrink: 0 }}
        >
            {CATEGORY_LABELS[iconType]}
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
});

IconTabButton.displayName = 'IconTabButton';

type IconTabPanelProps = {
    iconType: IconCategory;
    activeTab: IconCategory;
    items: IconItem[];
    emptyState?: ReactNode;
};

const IconTabPanel = memo(({ iconType, activeTab, items, emptyState }: IconTabPanelProps) => {
    const isActive = activeTab === iconType;

    return (
        <Tabs.Panel value={iconType}>
            <Box
                $css={{
                    paddingTop: '$200',
                    display: isActive ? 'block' : 'none',
                }}
            >
                {isActive ? (emptyState ?? <IconGrid items={items} />) : null}
            </Box>
        </Tabs.Panel>
    );
});

IconTabPanel.displayName = 'IconTabPanel';

const IconTabs = ({
    defaultValue = 'basic',
    counts,
    itemsByCategory,
    disableEmptyTabs = false,
    emptyState,
}: IconTabsProps) => {
    const { activeTab, setActiveTab, indicatorKey } = useIconTabsState({
        defaultValue,
        counts,
        disableEmptyTabs,
    });

    return (
        <Tabs.Root
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as IconCategory)}
            variant="line"
            size="md"
            activateOnFocus={false}
        >
            <Box
                $css={{
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    paddingBottom: '2px',
                    marginBottom: '-2px',
                }}
            >
                <Tabs.List
                    indicatorElement={<Tabs.IndicatorPrimitive key={indicatorKey} />}
                    $css={{
                        width: 'max-content',
                        minWidth: '100%',
                        flexWrap: 'nowrap',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {ICON_LIST.map((iconType) => (
                        <IconTabButton
                            key={iconType}
                            iconType={iconType}
                            count={counts[iconType]}
                            disableEmptyTabs={disableEmptyTabs}
                        />
                    ))}
                </Tabs.List>
            </Box>
            {ICON_LIST.map((iconType) => (
                <IconTabPanel
                    key={iconType}
                    iconType={iconType}
                    activeTab={activeTab}
                    items={itemsByCategory[iconType]}
                    emptyState={activeTab === iconType ? emptyState : undefined}
                />
            ))}
        </Tabs.Root>
    );
};

export default IconTabs;
