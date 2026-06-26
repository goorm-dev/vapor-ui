import { useState } from 'react';

import { Button } from '@vapor-ui/core/button';
import { Field } from '@vapor-ui/core/field';
import { Textarea } from '@vapor-ui/core/textarea';

import type { CapturedRect } from '~/utils/data/session-store';

interface MemoBubbleProps {
    rect: CapturedRect;
    onSave: (memo: string) => void;
    onCancel: () => void;
}

const BUBBLE_WIDTH = 260;
const GAP = 8;

const position = (rect: CapturedRect) => {
    const overflowsRight = rect.left + rect.width + GAP + BUBBLE_WIDTH > window.innerWidth;
    const left = overflowsRight
        ? Math.max(GAP, rect.left - GAP - BUBBLE_WIDTH)
        : rect.left + rect.width + GAP;

    return {
        top: Math.max(GAP, Math.min(rect.top, window.innerHeight - 160)),
        left,
    };
};

export const MemoBubble = ({ rect, onSave, onCancel }: MemoBubbleProps) => {
    const [memo, setMemo] = useState('');
    const { top, left } = position(rect);

    return (
        <div
            data-vapor-qa-ui=""
            style={{
                position: 'fixed',
                top,
                left,
                width: BUBBLE_WIDTH,
                zIndex: 2147483647,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: 12,
                background: 'var(--vapor-color-background-canvas-100)',
                border: '1px solid var(--vapor-color-border-normal)',
                borderRadius: 8,
                boxShadow: 'var(--vapor-shadow-lg)',
            }}
        >
            <Field.Root>
                <Field.Label>메모</Field.Label>
                <Textarea
                    autoFocus
                    value={memo}
                    onValueChange={setMemo}
                    placeholder="이 요소에 대한 메모"
                />
            </Field.Root>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button size="sm" variant="outline" colorPalette="secondary" onClick={onCancel}>
                    취소
                </Button>
                <Button size="sm" disabled={!memo.trim()} onClick={() => onSave(memo.trim())}>
                    저장
                </Button>
            </div>
        </div>
    );
};
