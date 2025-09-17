import './index.css';

import { Button, Checkbox, HStack, Sheet, Tabs, VStack } from '@vapor-ui/core';
import { RefreshOutlineIcon } from '@vapor-ui/icons';

export default function SheetForm() {
    return (
        <VStack
            gap="$250"
            width="400px"
            padding="$300"
            borderRadius="$300"
            border="1px solid #eee"
            className="sheet-form"
        >
            <Sheet.Root>
                <Sheet.Trigger render={<Button />}>Open Filter</Sheet.Trigger>
                <Sheet.Portal>
                    <Sheet.Overlay />
                    <Sheet.Positioner side="bottom">
                        <Sheet.Popup className={'popup'}>
                            <Tabs.Root defaultValue={'sort'} className={'tabs'}>
                                <Sheet.Header>
                                    <VStack width="100%">
                                        <Sheet.Title>Filter</Sheet.Title>

                                        <Tabs.List className={'tabs-list'}>
                                            <Tabs.Trigger value="sort">Sort</Tabs.Trigger>
                                            <Tabs.Trigger value="package">Package</Tabs.Trigger>
                                            <Tabs.Trigger value="status">Status</Tabs.Trigger>
                                            <Tabs.Trigger value="tag">Tag</Tabs.Trigger>
                                            <Tabs.Indicator />
                                        </Tabs.List>
                                    </VStack>
                                </Sheet.Header>
                                <Sheet.Body>
                                    <Tabs.Panel value="sort">
                                        <VStack gap="$100">
                                            {/* Sort */}
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="feedback" />
                                                <label
                                                    htmlFor="feedback"
                                                    className="checkbox-label"
                                                >
                                                    Feedback
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="buttons" />
                                                <label htmlFor="buttons" className="checkbox-label">
                                                    Buttons
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="data-display" />
                                                <label
                                                    htmlFor="data-display"
                                                    className="checkbox-label"
                                                >
                                                    Data Display
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="overlay" />
                                                <label htmlFor="overlay" className="checkbox-label">
                                                    Overlay
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="inputs" />
                                                <label htmlFor="inputs" className="checkbox-label">
                                                    Inputs
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="auto-login" />
                                                <label
                                                    htmlFor="auto-login"
                                                    className="checkbox-label"
                                                >
                                                    Navigation
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="utils" />
                                                <label htmlFor="utils" className="checkbox-label">
                                                    Utils
                                                </label>
                                            </HStack>
                                        </VStack>
                                    </Tabs.Panel>
                                    {/* Package */}
                                    <Tabs.Panel value="package">
                                        <VStack gap="$100">
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="goorm-dev/vapor-core" />
                                                <label
                                                    htmlFor="goorm-dev/vapor-core"
                                                    className="checkbox-label"
                                                >
                                                    goorm-dev/vapor-core
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="goorm-dev/vapor-component" />
                                                <label
                                                    htmlFor="goorm-dev/vapor-component"
                                                    className="checkbox-label"
                                                >
                                                    goorm-dev/vapor-component
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="vapor-ui/core" />
                                                <label
                                                    htmlFor="vapor-ui/core"
                                                    className="checkbox-label"
                                                >
                                                    vapor-ui/core
                                                </label>
                                            </HStack>
                                        </VStack>
                                    </Tabs.Panel>
                                    {/* Status */}
                                    <Tabs.Panel value="status">
                                        <VStack gap="$100">
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="active" />
                                                <label htmlFor="active" className="checkbox-label">
                                                    Active
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="inactive" />
                                                <label
                                                    htmlFor="inactive"
                                                    className="checkbox-label"
                                                >
                                                    Inactive
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="draft" />
                                                <label htmlFor="draft" className="checkbox-label">
                                                    Draft
                                                </label>
                                            </HStack>
                                        </VStack>
                                    </Tabs.Panel>
                                    {/* Tag */}
                                    <Tabs.Panel value="tag">
                                        <VStack gap="$100">
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="ui" />
                                                <label htmlFor="ui" className="checkbox-label">
                                                    UI
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="open-source" />
                                                <label
                                                    htmlFor="open-source"
                                                    className="checkbox-label"
                                                >
                                                    Open Source
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="performance" />
                                                <label
                                                    htmlFor="performance"
                                                    className="checkbox-label"
                                                >
                                                    Performance
                                                </label>
                                            </HStack>
                                        </VStack>
                                    </Tabs.Panel>
                                </Sheet.Body>
                                <Sheet.Footer className="footer">
                                    <Button size="lg" color="secondary" className="refresh-button">
                                        <RefreshOutlineIcon />
                                        Refresh
                                    </Button>
                                    <Sheet.Close
                                        render={<Button size="lg" className="apply-button" />}
                                    >
                                        Apply
                                    </Sheet.Close>
                                </Sheet.Footer>
                            </Tabs.Root>
                        </Sheet.Popup>
                    </Sheet.Positioner>
                </Sheet.Portal>
            </Sheet.Root>
        </VStack>
    );
}
