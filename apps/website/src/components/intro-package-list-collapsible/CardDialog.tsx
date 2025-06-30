import type { ReactNode } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import { Button, IconButton, Text } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

interface CardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: ReactNode;
    onPrev?: () => void;
    onNext?: () => void;
    prevTitle?: string;
    nextTitle?: string;
}

export default function CardDialog({
    open,
    onOpenChange,
    title,
    description,
    onPrev,
    onNext,
    prevTitle,
    nextTitle,
}: CardDialogProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
                <Dialog.Content className="fixed w-[800px] left-1/2 top-1/2 z-50 bg-white rounded-lg shadow-[0_16px_32px_0_rgba(0,0,0,0.2)] -translate-x-1/2 -translate-y-1/2 focus:outline-none flex flex-col items-end">
                    <Dialog.Title asChild>
                        <div className="w-full flex items-center justify-between px-[var(--vapor-size-space-300)] h-[var(--vapor-size-space-700)]">
                            <Text typography="heading5" foreground="normal">
                                {title}
                            </Text>
                            <Dialog.Close asChild>
                                <IconButton color="secondary" aria-label="닫기">
                                    <CloseOutlineIcon />
                                </IconButton>
                            </Dialog.Close>
                        </div>
                    </Dialog.Title>

                    <div className="w-full px-[var(--vapor-size-space-300)] prose max-w-none mb-4 max-h-[38.65rem] overflow-y-auto">
                        {description}
                    </div>

                    {/* Footer 영역 */}
                    {(onPrev || onNext) && (
                        <div
                            className={`w-full flex items-center px-[var(--vapor-size-space-300)] pb-4 ${
                                onPrev && onNext
                                    ? 'justify-between'
                                    : onPrev
                                      ? 'justify-start'
                                      : 'justify-end'
                            }`}
                        >
                            {onPrev && (
                                <Button onClick={onPrev} size="lg" color="secondary">
                                    이전{prevTitle ? `: ${prevTitle}` : ''}
                                </Button>
                            )}
                            {onPrev && onNext && <div className="flex-1" />}
                            {onNext && (
                                <Button size="lg" onClick={onNext} color="primary">
                                    다음{nextTitle ? `: ${nextTitle}` : ''}
                                </Button>
                            )}
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
