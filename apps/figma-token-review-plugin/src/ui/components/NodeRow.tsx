import { Box, Button, Text } from '@vapor-ui/core';

type Props = {
    nodeId: string;
    index: number;
    onClick: () => void;
};

export function NodeRow({ nodeId, index, onClick }: Props) {
    return (
        <Box className="flex items-center justify-between border-t border-v-gray-200 px-v-100 py-v-050">
            <Text typography="body4" className="font-mono text-v-gray-700">
                #{index + 1} {nodeId}
            </Text>
            <Button size="sm" variant="ghost" colorPalette="primary" onClick={onClick}>
                포커스
            </Button>
        </Box>
    );
}
