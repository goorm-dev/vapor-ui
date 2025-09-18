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
                            <Sheet.Header className="header">
                                <Sheet.Title>Filter</Sheet.Title>
                            </Sheet.Header>
                            <Sheet.Body className="body">
                                <Tabs.Root defaultValue={'sort'} className={'tabs'}>
                                    <Tabs.List className={'tabs-list'}>
                                        <Tabs.Trigger value="sort">Sort</Tabs.Trigger>
                                        <Tabs.Trigger value="package">Package</Tabs.Trigger>
                                        <Tabs.Trigger value="status">Status</Tabs.Trigger>
                                        <Tabs.Trigger value="tag">Tag</Tabs.Trigger>
                                        <Tabs.Indicator />
                                    </Tabs.List>
                                    <Tabs.Panel value="sort" className={'tabs-panel'}>
                                        <VStack gap="$100">
                                            {/* Sort */}
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="sheet-feedback" size="lg" />
                                                <label
                                                    htmlFor="sheet-feedback"
                                                    className="checkbox-label"
                                                >
                                                    Feedback
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="sheet-buttons" size="lg" />
                                                <label
                                                    htmlFor="sheet-buttons"
                                                    className="checkbox-label"
                                                >
                                                    Buttons
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="sheet-data-display" size="lg" />
                                                <label
                                                    htmlFor="sheet-data-display"
                                                    className="checkbox-label"
                                                >
                                                    Data Display
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="sheet-overlay" size="lg" />
                                                <label
                                                    htmlFor="sheet-overlay"
                                                    className="checkbox-label"
                                                >
                                                    Overlay
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="sheet-inputs" size="lg" />
                                                <label
                                                    htmlFor="sheet-inputs"
                                                    className="checkbox-label"
                                                >
                                                    Inputs
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="sheet-navigation" size="lg" />
                                                <label
                                                    htmlFor="sheet-navigation"
                                                    className="checkbox-label"
                                                >
                                                    Navigation
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="sheet-utils" size="lg" />
                                                <label
                                                    htmlFor="sheet-utils"
                                                    className="checkbox-label"
                                                >
                                                    Utils
                                                </label>
                                            </HStack>
                                        </VStack>
                                    </Tabs.Panel>
                                    {/* Package */}
                                    <Tabs.Panel value="package" className={'tabs-panel'}>
                                        <VStack gap="$100">
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root
                                                    id="sheet-goorm-dev/vapor-core"
                                                    size="lg"
                                                />
                                                <label
                                                    htmlFor="sheet-goorm-dev/vapor-core"
                                                    className="checkbox-label"
                                                >
                                                    goorm-dev/vapor-core
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root
                                                    id="sheet-goorm-dev/vapor-component"
                                                    size="lg"
                                                />
                                                <label
                                                    htmlFor="sheet-goorm-dev/vapor-component"
                                                    className="checkbox-label"
                                                >
                                                    goorm-dev/vapor-component
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="sheet-vapor-ui/core" size="lg" />
                                                <label
                                                    htmlFor="sheet-vapor-ui/core"
                                                    className="checkbox-label"
                                                >
                                                    vapor-ui/core
                                                </label>
                                            </HStack>
                                        </VStack>
                                    </Tabs.Panel>
                                    {/* Status */}
                                    <Tabs.Panel value="status" className={'tabs-panel'}>
                                        <VStack gap="$100">
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="sheet-active" size="lg" />
                                                <label
                                                    htmlFor="sheet-active"
                                                    className="checkbox-label"
                                                >
                                                    Active
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="sheet-inactive" size="lg" />
                                                <label
                                                    htmlFor="sheet-inactive"
                                                    className="checkbox-label"
                                                >
                                                    Inactive
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="sheet-draft" size="lg" />
                                                <label
                                                    htmlFor="sheet-draft"
                                                    className="checkbox-label"
                                                >
                                                    Draft
                                                </label>
                                            </HStack>
                                        </VStack>
                                    </Tabs.Panel>
                                    {/* Tag */}
                                    <Tabs.Panel value="tag" className={'tabs-panel'}>
                                        <VStack gap="$100">
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="sheet-ui" size="lg" />
                                                <label
                                                    htmlFor="sheet-ui"
                                                    className="checkbox-label"
                                                >
                                                    UI
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="sheet-open-source" size="lg" />
                                                <label
                                                    htmlFor="sheet-open-source"
                                                    className="checkbox-label"
                                                >
                                                    Open Source
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="sheet-performance" size="lg" />
                                                <label
                                                    htmlFor="sheet-performance"
                                                    className="checkbox-label"
                                                >
                                                    Performance
                                                </label>
                                            </HStack>
                                        </VStack>
                                    </Tabs.Panel>
                                </Tabs.Root>
                            </Sheet.Body>
                            <Sheet.Footer className="footer">
                                <Button size="lg" color="secondary" className="refresh-button">
                                    <RefreshOutlineIcon />
                                    Refresh
                                </Button>
                                <Sheet.Close render={<Button size="lg" className="apply-button" />}>
                                    Apply
                                </Sheet.Close>
                            </Sheet.Footer>
                        </Sheet.Popup>
                    </Sheet.Positioner>
                </Sheet.Portal>
            </Sheet.Root>
        </VStack>
    );
}
