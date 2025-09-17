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
                        <Sheet.Popup style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                            <Tabs.Root
                                defaultValue={'sort'}
                                className={'tabs'}
                                style={{ height: '100%' }}
                            >
                                <Sheet.Header>
                                    <VStack width="100%">
                                        <Sheet.Title>Filter</Sheet.Title>

                                        <Tabs.List style={{ paddingInline: 0 }}>
                                            <Tabs.Trigger value="sort">Sort</Tabs.Trigger>
                                            <Tabs.Trigger value="package">Package</Tabs.Trigger>
                                            <Tabs.Trigger value="status">Status</Tabs.Trigger>
                                            <Tabs.Trigger value="tag">Tag</Tabs.Trigger>
                                            <Tabs.Indicator />
                                        </Tabs.List>
                                    </VStack>
                                </Sheet.Header>
                                <Sheet.Body style={{ paddingBlock: 16 }}>
                                    <Tabs.Panel value="sort">
                                        <VStack gap="$100">
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="mentor" size="lg" />
                                                <label htmlFor="mentor" className="checkbox-label">
                                                    멘토님 강연 능력
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="topic" size="lg" />
                                                <label htmlFor="topic" className="checkbox-label">
                                                    주제(협업 및 커뮤니케이션 스킬)
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="seminar" size="lg" />
                                                <label htmlFor="seminar" className="checkbox-label">
                                                    세미나 자료
                                                </label>
                                            </HStack>
                                            <HStack alignItems="center" gap="$100">
                                                <Checkbox.Root id="etc" size="lg" />
                                                <label htmlFor="etc" className="checkbox-label">
                                                    기타
                                                </label>
                                            </HStack>
                                        </VStack>
                                    </Tabs.Panel>
                                </Sheet.Body>
                                <Sheet.Footer style={{ gap: 8, paddingTop: 8 }}>
                                    <Button size="lg" color="secondary" style={{ flexShrink: 0 }}>
                                        <RefreshOutlineIcon />
                                        Refresh
                                    </Button>
                                    <Sheet.Close
                                        render={<Button size="lg" style={{ width: '100%' }} />}
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
