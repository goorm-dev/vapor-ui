import { InputGroup, VStack } from '@vapor-ui/core';
import { CopyOutlineIcon, SearchOutlineIcon } from '@vapor-ui/icons';

export default function InputGroupAddon() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <InputGroup.Root>
                <InputGroup.LeadingAddon>https://</InputGroup.LeadingAddon>
                <InputGroup.Input placeholder="example.com" />
            </InputGroup.Root>

            <InputGroup.Root>
                <InputGroup.LeadingAddon>
                    <SearchOutlineIcon />
                </InputGroup.LeadingAddon>
                <InputGroup.Input placeholder="Search..." />
            </InputGroup.Root>

            <InputGroup.Root>
                <InputGroup.Input placeholder="username" />
                <InputGroup.TrailingAddon>@gmail.com</InputGroup.TrailingAddon>
            </InputGroup.Root>

            <InputGroup.Root>
                <InputGroup.LeadingAddon>$</InputGroup.LeadingAddon>
                <InputGroup.Input placeholder="0.00" />
                <InputGroup.TrailingAddon>USD</InputGroup.TrailingAddon>
            </InputGroup.Root>

            <InputGroup.Root>
                <InputGroup.Input defaultValue="https://vapor-ui.dev" />
                <InputGroup.TrailingAddon>
                    <InputGroup.IconButton
                        aria-label="Copy link"
                        variant="ghost"
                        colorPalette="contrast"
                    >
                        <CopyOutlineIcon />
                    </InputGroup.IconButton>
                </InputGroup.TrailingAddon>
            </InputGroup.Root>
        </VStack>
    );
}
