import { useEffect, useRef } from 'react';

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
    const rafRef = useRef<number | null>(null);
    const pendingRef = useRef<{ width: number; height: number } | null>(null);

    useEffect(() => {
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const flush = () => {
        rafRef.current = null;
        const pending = pendingRef.current;
        if (!pending) return;
        pendingRef.current = null;
        postToCode({ type: 'resize', width: pending.width, height: pending.height });
    };

    const queueResize = (width: number, height: number) => {
        pendingRef.current = { width, height };
        if (rafRef.current !== null) return;
        rafRef.current = requestAnimationFrame(flush);
    };

    const cancelPending = () => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        pendingRef.current = null;
    };

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
            cancelPending();
            return;
        }

        const width = Math.max(MIN_WIDTH, drag.startWidth + (event.clientX - drag.startX));
        const height = Math.max(MIN_HEIGHT, drag.startHeight + (event.clientY - drag.startY));
        queueResize(width, height);
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        const drag = dragRef.current;
        dragRef.current = null;

        if (!drag) {
            cancelPending();
            return;
        }

        cancelPending();
        const width = Math.max(MIN_WIDTH, drag.startWidth + (event.clientX - drag.startX));
        const height = Math.max(MIN_HEIGHT, drag.startHeight + (event.clientY - drag.startY));
        postToCode({ type: 'resize', width, height, commit: true });
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
