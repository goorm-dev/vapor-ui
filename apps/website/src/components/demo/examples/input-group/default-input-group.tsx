'use client';

import { IconButton, InputGroup, TextInput, VStack } from '@vapor-ui/core';

export default function DefaultInputGroup() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <InputGroup.Root>
                <InputGroup.LeadingAddon>@</InputGroup.LeadingAddon>
                <TextInput placeholder="username" />
                <InputGroup.TrailingAddon>
                    <IconButton aria-label="clear" variant="ghost" size="sm">
                        ×
                    </IconButton>
                </InputGroup.TrailingAddon>
            </InputGroup.Root>
        </VStack>
    );
}
