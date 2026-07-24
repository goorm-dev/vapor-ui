import { HStack, IconButton, InputGroup, Text, VStack } from '@vapor-ui/core';
import { CloseOutlineIcon, SearchOutlineIcon } from '@vapor-ui/icons';

const SIZES = ['sm', 'md', 'lg', 'xl'] as const;

export default function InputGroupSize() {
    return (
        <VStack $css={{ gap: '$150' }}>
            {SIZES.map((size) => (
                <HStack key={size} $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-6" typography="body3" foreground="hint-100">
                        {size}
                    </Text>
                    <InputGroup.Root size={size}>
                        <InputGroup.LeadingAddon>
                            <SearchOutlineIcon />
                        </InputGroup.LeadingAddon>
                        <InputGroup.Input placeholder={size} />
                        <InputGroup.TrailingAddon>
                            <InputGroup.Button
                                aria-label="clear"
                                render={<IconButton variant="ghost" colorPalette="contrast" />}
                            >
                                <CloseOutlineIcon />
                            </InputGroup.Button>
                        </InputGroup.TrailingAddon>
                    </InputGroup.Root>
                </HStack>
            ))}
        </VStack>
    );
}
