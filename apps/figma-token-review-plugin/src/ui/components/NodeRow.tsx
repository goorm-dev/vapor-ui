import { Button, Text } from '@vapor-ui/core';

type Props = {
    nodeId: string;
    index: number;
    onClick: () => void;
};

export function NodeRow({ nodeId, index, onClick }: Props) {
    return (
        <button
            type="button"
            className="flex w-full items-center justify-between border-b border-v-gray-100 px-v-200 py-v-100 text-left hover:bg-v-gray-50"
            onClick={onClick}
        >
            <Text typography="body4">#{index + 1}</Text>
            <Text typography="body4" className="font-mono text-v-gray-500">
                {nodeId}
            </Text>
            <Button size="sm" variant="ghost" colorPalette="primary">
                포커스
            </Button>
        </button>
    );
}
