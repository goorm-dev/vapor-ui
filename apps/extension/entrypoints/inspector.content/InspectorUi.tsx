import { useEffect, useState } from 'react';

import type { CapturedRect } from '../../utils/session-store';
import { Fab } from './Fab';
import { MemoBubble } from './MemoBubble';

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
