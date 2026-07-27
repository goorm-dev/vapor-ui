'use client';

import { InputGroup, VStack } from '@vapor-ui/core';

export default function InputGroupStates() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <InputGroup.Root>
                <InputGroup.LeadingAddon>@</InputGroup.LeadingAddon>
                <InputGroup.Input placeholder="invalid" invalid />
            </InputGroup.Root>

            <InputGroup.Root disabled>
                <InputGroup.LeadingAddon>@</InputGroup.LeadingAddon>
                <InputGroup.Input placeholder="disabled" />
            </InputGroup.Root>

            <InputGroup.Root>
                <InputGroup.LeadingAddon>@</InputGroup.LeadingAddon>
                <InputGroup.Input value="read only" readOnly />
            </InputGroup.Root>
        </VStack>
    );
}
