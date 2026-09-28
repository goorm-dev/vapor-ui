import { HStack, Text, Toggle, ToggleGroup, VStack } from '@vapor-ui/core';
import { BoldOutlineIcon, ItalicIcon, UnderlineOutlineIcon } from '@vapor-ui/icons';

export default function ToggleGroupMultiple() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <VStack $css={{ gap: '$75' }}>
                <Text typography="body3" foreground="hint-100">
                    multiple={'{false}'} (기본값)
                </Text>
                <HStack $css={{ gap: '$150' }}>
                    <ToggleGroup aria-label="텍스트 스타일 (단일)">
                        <Toggle value="bold" aria-label="굵게">
                            <BoldOutlineIcon />
                        </Toggle>
                        <Toggle value="italic" aria-label="기울임">
                            <ItalicIcon />
                        </Toggle>
                        <Toggle value="underline" aria-label="밑줄">
                            <UnderlineOutlineIcon />
                        </Toggle>
                    </ToggleGroup>
                </HStack>
            </VStack>
            <VStack $css={{ gap: '$75' }}>
                <Text typography="body3" foreground="hint-100">
                    multiple={'{true}'}
                </Text>
                <HStack $css={{ gap: '$150' }}>
                    <ToggleGroup multiple aria-label="텍스트 스타일 (다중)">
                        <Toggle value="bold" aria-label="굵게">
                            <BoldOutlineIcon />
                        </Toggle>
                        <Toggle value="italic" aria-label="기울임">
                            <ItalicIcon />
                        </Toggle>
                        <Toggle value="underline" aria-label="밑줄">
                            <UnderlineOutlineIcon />
                        </Toggle>
                    </ToggleGroup>
                </HStack>
            </VStack>
        </VStack>
    );
}
