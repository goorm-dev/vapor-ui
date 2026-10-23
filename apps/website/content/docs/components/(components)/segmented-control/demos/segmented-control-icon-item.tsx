import { SegmentedControl, Tooltip, VStack } from '@vapor-ui/core';
import { DarkIcon, LightIcon, PcIcon } from '@vapor-ui/icons';

export default function DefaultSegmentedControl() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <SegmentedControl.Root defaultValue="light" aria-label="테마 모드 선택">
                <Tooltip.Root>
                    <Tooltip.Trigger
                        delay={150}
                        render={
                            <SegmentedControl.IconItem value="light" aria-label="라이트 모드">
                                <LightIcon />
                            </SegmentedControl.IconItem>
                        }
                    />
                    <Tooltip.Popup>라이트 모드</Tooltip.Popup>
                </Tooltip.Root>

                <Tooltip.Root>
                    <Tooltip.Trigger
                        delay={150}
                        render={
                            <SegmentedControl.IconItem value="dark" aria-label="다크 모드">
                                <DarkIcon />
                            </SegmentedControl.IconItem>
                        }
                    />
                    <Tooltip.Popup>다크 모드</Tooltip.Popup>
                </Tooltip.Root>

                <Tooltip.Root>
                    <Tooltip.Trigger
                        delay={150}
                        render={
                            <SegmentedControl.IconItem value="system" aria-label="시스템 모드">
                                <PcIcon />
                            </SegmentedControl.IconItem>
                        }
                    />
                    <Tooltip.Popup>시스템 모드</Tooltip.Popup>
                </Tooltip.Root>
            </SegmentedControl.Root>
        </VStack>
    );
}
