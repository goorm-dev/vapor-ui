import { useEffect, useState } from 'react';

import type { CapturedRect } from '~/utils/data/session-store';

import { Fab } from './fab';
import { MemoBubble } from './memo-bubble';

export interface PinTarget {
    rect: CapturedRect;
}

export interface InspectorUiHandle {
    setPin: (target: PinTarget | null) => void;
}

interface InspectorUiProps {
    onReview: () => void;
    onSaveMemo: (memo: string) => void;
    onCancelMemo: () => void;
    bind: (handle: InspectorUiHandle) => void;
}

export const InspectorUi = ({ onReview, onSaveMemo, onCancelMemo, bind }: InspectorUiProps) => {
    const [pin, setPin] = useState<PinTarget | null>(null);

    useEffect(() => {
        bind({ setPin });
    }, [bind]);

    return (
        <>
            <Fab onReview={onReview} />
            {pin ? (
                <MemoBubble
                    // 핀 타깃이 바뀌면 새 인스턴스로 갈아끼워, 이전 요소에
                    // 입력하던 메모가 다음 항목으로 딸려가지 않게 한다.
                    key={`${pin.rect.top},${pin.rect.left},${pin.rect.width},${pin.rect.height}`}
                    rect={pin.rect}
                    onSave={(memo) => {
                        onSaveMemo(memo);
                        setPin(null);
                    }}
                    onCancel={() => {
                        onCancelMemo();
                        setPin(null);
                    }}
                />
            ) : null}
        </>
    );
};
