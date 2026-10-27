import { HStack, Text, Toggle, Toolbar, VStack } from '@vapor-ui/core';
import { BoldOutlineIcon, ItalicIcon, UnderlineOutlineIcon } from '@vapor-ui/icons';

const variants = ['outline', 'ghost'] as const;

export default function ToolbarVariant() {
    return (
        <VStack $css={{ gap: '$150' }}>
            {variants.map((variant) => (
                <HStack key={variant} $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        {variant}
                    </Text>
                    <Toolbar.Root variant={variant} aria-label={`텍스트 서식 (${variant})`}>
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
