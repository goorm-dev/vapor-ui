import { HStack, Text, Toggle, ToggleGroup, VStack } from '@vapor-ui/core';
import {
    AlignCenterOutlineIcon,
    AlignLeftOutlineIcon,
    AlignRightOutlineIcon,
} from '@vapor-ui/icons';

const items = [
    { value: 'left', label: '왼쪽 정렬', Icon: AlignLeftOutlineIcon },
    { value: 'center', label: '가운데 정렬', Icon: AlignCenterOutlineIcon },
    { value: 'right', label: '오른쪽 정렬', Icon: AlignRightOutlineIcon },
];

const sizes = ['sm', 'md', 'lg', 'xl'] as const;

export default function ToggleGroupSize() {
    return (
        <VStack $css={{ gap: '$150' }}>
            {sizes.map((size) => (
                <HStack key={size} $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-6" typography="body3" foreground="hint-100">
                        {size}
                    </Text>
                    <ToggleGroup size={size} aria-label={`텍스트 정렬 (${size})`}>
                        {items.map(({ value, label, Icon }) => (
                            <Toggle key={value} value={value} aria-label={label}>
                                <Icon />
                            </Toggle>
                        ))}
                    </ToggleGroup>
                </HStack>
            ))}
        </VStack>
    );
}
