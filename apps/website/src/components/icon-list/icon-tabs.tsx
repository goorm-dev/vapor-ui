import { memo } from 'react';

import { Badge, Box, Tabs } from '@vapor-ui/core';

import IconGrid from './icon-grid';
import {
    CATEGORY_LABELS,
    ICON_LIST,
    type IconCategory,
    type IconItem,
} from './icon-list.constants';

type IconTabsProps = {
    value: IconCategory;
    onValueChange: (value: string) => void;
    counts: Record<IconCategory, number>;
    itemsByCategory: Record<IconCategory, IconItem[]>;
    disableEmptyTabs?: boolean;
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
    items: IconItem[];
};

const IconTabPanel = memo(({ iconType, items }: IconTabPanelProps) => {
    return (
        <Tabs.Panel value={iconType}>
            <Box $css={{ paddingTop: '$200' }}>
                <IconGrid items={items} />
            </Box>
        </Tabs.Panel>
    );
});

IconTabPanel.displayName = 'IconTabPanel';

const IconTabs = ({
    value,
    onValueChange,
    counts,
    itemsByCategory,
    disableEmptyTabs = false,
}: IconTabsProps) => {
    const activeItems = itemsByCategory[value];

    return (
        <Tabs.Root
            value={value}
            onValueChange={onValueChange}
            variant="line"
            size="md"
            activateOnFocus={false}
        >
            <Box
                $css={{
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                    paddingBottom: '2px',
                    marginBottom: '-2px',
                }}
            >
                <Tabs.List
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
            <IconTabPanel key={value} iconType={value} items={activeItems} />
        </Tabs.Root>
    );
};

export default IconTabs;
