import { Box, Button, Text } from '@vapor-ui/core';

type Tab = 'color' | 'typography';

type Props = {
    active: Tab;
    colorCount: number;
    typographyCount: number;
    onChange: (tab: Tab) => void;
};

const LABEL: Record<Tab, string> = { color: '색상', typography: '타이포' };

export function TabHeader({ active, colorCount, typographyCount, onChange }: Props) {
    const counts: Record<Tab, number> = { color: colorCount, typography: typographyCount };
    return (
        <Box className="flex border-b border-v-gray-200 bg-white">
            {(['color', 'typography'] as Tab[]).map((tab) => (
                <Button
                    key={tab}
                    variant={active === tab ? 'fill' : 'ghost'}
                    colorPalette="primary"
                    size="md"
                    className="flex-1 rounded-none"
                    onClick={() => onChange(tab)}
                >
                    <Text typography="body2">
                        {LABEL[tab]} ({counts[tab]})
                    </Text>
                </Button>
            ))}
        </Box>
    );
}
