import { Box, IconButton, Tooltip } from '@vapor-ui/core';
import { SettingIcon } from '@vapor-ui/icons';

import surveyUrl from '~/ui/assets/survey.svg';

import { HeroPanel } from '../components/hero-panel';
import { toastManager } from '../components/toast';
import { useScan } from '../features/scan';
import { useSelection } from '../features/selection';

const toastError = (title: string) => toastManager.add({ title, colorPalette: 'danger' });

type Props = {
    onOpenSettings?: () => void;
};

export function HomePage({ onOpenSettings }: Props) {
    const { start } = useScan();
    const { selection, buildAction } = useSelection();
    const handleScan = buildAction({
        frame: (sel) => start(sel.id, sel.name),
        none: () => toastError('프레임을 1개 선택해 주세요.'),
        multi: () => toastError('프레임을 1개만 선택해 주세요.'),
        invalid: (sel) =>
            toastError(`프레임 또는 인스턴스만 선택할 수 있습니다. (현재: ${sel.nodeType})`),
    });

    return (
        <Box className="relative">
            <SettingButton onClick={onOpenSettings} />
            <HeroPanel.Root>
                <HeroPanel.Content>
                    <HeroPanel.Image src={surveyUrl} />
                    <HeroPanel.Heading>
                        <HeroPanel.Title>검수할 프레임을 선택해 주세요</HeroPanel.Title>
                        <HeroPanel.Description>
                            프레임을 선택하고 검수 하기 버튼을 누르면 <br />
                            토큰 검수가 시작됩니다.
                        </HeroPanel.Description>
                    </HeroPanel.Heading>
                </HeroPanel.Content>
                <HeroPanel.Action onClick={handleScan} disabled={selection.kind === 'none'}>
                    검수 시작하기
                </HeroPanel.Action>
            </HeroPanel.Root>
        </Box>
    );
}

const SettingButton = ({ onClick }: IconButton.Props) => (
    <Tooltip.Root>
        <Tooltip.Trigger
            render={
                <IconButton
                    aria-label="설정"
                    colorPalette="secondary"
                    variant="ghost"
                    onClick={onClick}
                    className="absolute right-3 top-3"
                >
                    <SettingIcon />
                </IconButton>
            }
        />

        <Tooltip.Popup>설정</Tooltip.Popup>
    </Tooltip.Root>
);
