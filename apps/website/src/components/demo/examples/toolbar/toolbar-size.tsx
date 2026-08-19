import { HStack, Text, Toggle, Toolbar, VStack } from '@vapor-ui/core';
import { BoldOutlineIcon, ItalicIcon, UnderlineOutlineIcon } from '@vapor-ui/icons';

const sizes = ['sm', 'md', 'lg', 'xl'] as const;

export default function ToolbarSize() {
    return (
        <VStack $css={{ gap: '$150' }}>
            {sizes.map((size) => (
                <HStack key={size} $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-6" typography="body3" foreground="hint-100">
                        {size}
                    </Text>
                    <Toolbar.Root size={size} aria-label={`텍스트 서식 (${size})`}>
                        <Toolbar.Button render={<Toggle aria-label="굵게" />}>
                            <BoldOutlineIcon />
                        </Toolbar.Button>
                        <Toolbar.Button render={<Toggle aria-label="기울임" />}>
                            <ItalicIcon />
                        </Toolbar.Button>
                        <Toolbar.Button render={<Toggle aria-label="밑줄" />}>
                            <UnderlineOutlineIcon />
                        </Toolbar.Button>
                    </Toolbar.Root>
                </HStack>
            ))}
        </VStack>
    );
}
