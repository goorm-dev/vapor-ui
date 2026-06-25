import { useEffect, useState } from 'react';

import type { CapturedRect } from '../../utils/data/session-store';
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
