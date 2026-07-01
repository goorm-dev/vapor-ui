import confirmUrl from '~/ui/assets/confirm.svg';

import { HeroPanel } from '../components/hero-panel';
import { useScan } from '../features/scan';

export function SuccessPage() {
    const { reset } = useScan();

    return (
        <HeroPanel.Root>
            <HeroPanel.Content>
                <HeroPanel.Image src={confirmUrl} />
                <HeroPanel.Heading>
                    <HeroPanel.Title>모든 토큰이 올바르게 사용되었어요</HeroPanel.Title>
                    <HeroPanel.Description>
                        선택한 프레임의 모든 토큰이 <br />
                        올바르게 사용되었습니다.
                    </HeroPanel.Description>
                </HeroPanel.Heading>
            </HeroPanel.Content>
            <HeroPanel.Action onClick={reset}>다른 프레임 검수하기</HeroPanel.Action>
        </HeroPanel.Root>
    );
}
