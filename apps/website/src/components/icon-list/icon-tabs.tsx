import { Badge, Box, Tabs } from '@vapor-ui/core';

import IconGrid from './icon-grid';
import IconListItem from './icon-list-item';
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

const IconTabs = ({
    value,
    onValueChange,
    counts,
    itemsByCategory,
    disableEmptyTabs = false,
}: IconTabsProps) => {
    return (
        <Tabs.Root
            value={value}
            onValueChange={onValueChange}
            variant="line"
            size="md"
            activateOnFocus={false}
        >
            <Tabs.List>
                {ICON_LIST.map((iconType) => (
                    <Tabs.Button
                        key={iconType}
                        value={iconType}
                        disabled={disableEmptyTabs && counts[iconType] === 0}
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
                            {counts[iconType]}
                        </Badge>
                    </Tabs.Button>
                ))}
            </Tabs.List>

            {ICON_LIST.map((iconType) => (
                <Tabs.Panel key={iconType} value={iconType} keepMounted>
                    <Box $css={{ paddingTop: '$200' }}>
                        <IconGrid>
                            {itemsByCategory[iconType].map(({ name, icon }) => (
                                <Box key={name} role="listitem">
                                    <IconListItem icon={icon} iconName={name} />
                                </Box>
                            ))}
                        </IconGrid>
                    </Box>
                </Tabs.Panel>
            ))}
        </Tabs.Root>
    );
};

export default IconTabs;
