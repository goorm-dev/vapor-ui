'use client';

import { InputGroup, TextInput, VStack } from '@vapor-ui/core';

export default function InputGroupStates() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <InputGroup.Root invalid>
                <InputGroup.LeadingAddon>@</InputGroup.LeadingAddon>
                <TextInput placeholder="invalid" invalid />
            </InputGroup.Root>

            <InputGroup.Root disabled>
                <InputGroup.LeadingAddon>@</InputGroup.LeadingAddon>
                <TextInput placeholder="disabled" disabled />
            </InputGroup.Root>

            <InputGroup.Root readOnly>
                <InputGroup.LeadingAddon>@</InputGroup.LeadingAddon>
                <TextInput readOnly value="read only" />
            </InputGroup.Root>
        </VStack>
    );
}
