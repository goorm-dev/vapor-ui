import type { SelectionState } from '~/shared/schema';
import surveyUrl from '~/ui/assets/survey.svg';

import { HeroPanel } from '../components/hero-panel';
import { toastManager } from '../components/toast';

type Props = {
    selection: SelectionState;
    onScan: (frameId: string) => void;
};

export function HomePage({ selection, onScan }: Props) {
    const disabled = selection.kind === 'none';

    const handleClick = () => {
        switch (selection.kind) {
            case 'frame':
                onScan(selection.id);
                return;
            case 'none':
                toastManager.add({
                    title: '프레임을 1개 선택해 주세요.',
                    colorPalette: 'danger',
                });
                return;
            case 'multi':
                toastManager.add({
                    title: '프레임 1개만 선택해 주세요.',
                    colorPalette: 'danger',
                });
                return;
            case 'invalid':
                toastManager.add({
                    title: `프레임 노드만 선택할 수 있습니다. (현재: ${selection.nodeType})`,
                    colorPalette: 'danger',
                });
                return;
        }
    };

    return (
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
            <HeroPanel.Action onClick={handleClick} disabled={disabled}>
                검수 시작하기
            </HeroPanel.Action>
        </HeroPanel.Root>
    );
}
