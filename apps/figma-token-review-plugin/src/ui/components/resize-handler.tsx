import { useRef } from 'react';

import { postToCode } from '~/ui/messaging';

const MIN_WIDTH = 360;
const MIN_HEIGHT = 480;

type DragState = {
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
};

export function ResizeHandle() {
    const dragRef = useRef<DragState | null>(null);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);

        dragRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            startWidth: window.innerWidth,
            startHeight: window.innerHeight,
        };
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;

        if (!drag) return;
        if (event.buttons === 0) {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
            }
            dragRef.current = null;
            return;
        }

        const width = Math.max(MIN_WIDTH, drag.startWidth + (event.clientX - drag.startX));
        const height = Math.max(MIN_HEIGHT, drag.startHeight + (event.clientY - drag.startY));
        postToCode({ type: 'resize', width, height });
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        dragRef.current = null;
    };

    return (
        <div
            role="separator"
            aria-label="크기 조절"
            aria-orientation="vertical"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="fixed right-0 bottom-0 w-4 h-4 cursor-nwse-resize touch-none z-9999"
        >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden focusable="false">
                <path
                    d="M16 6 L6 16 M16 11 L11 16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.5"
                />
            </svg>
        </div>
    );
}
