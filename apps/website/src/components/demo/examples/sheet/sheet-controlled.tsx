'use client';

import { useEffect, useState } from 'react';

import { Button, Sheet, Text } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

export default function SheetControlled() {
    const [isOpen, setIsOpen] = useState(false);
    const [count, setCount] = useState(3);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOpen && count > 0) {
            timer = setTimeout(() => {
                setCount((prev) => prev - 1);
            }, 1000);
        } else if (isOpen && count === 0) {
            setIsOpen(false);
            setCount(3); // 초기화
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [count, isOpen]);

    return (
        <div className="space-y-4">
            <Button onClick={() => setIsOpen(true)} colorPalette="primary">
                Sheet 열기
            </Button>

            <p className="text-sm text-gray-600">
                현재 상태: <strong>{isOpen ? '열림' : '닫힘'}</strong>
            </p>

            <Sheet.Root open={isOpen} onOpenChange={setIsOpen} closeOnClickOverlay={false}>
                <Sheet.Popup>
                    <div className="absolute top-4 right-4">
                        <Sheet.Close aria-label="Close sheet" className="flex">
                            <CloseOutlineIcon />
                        </Sheet.Close>
                    </div>
                    <Sheet.Header>
                        <Sheet.Title>제어된 Sheet</Sheet.Title>
                    </Sheet.Header>
                    <Sheet.Body>
                        <Sheet.Description>
                            외부에 의해{' '}
                            <Text typography="subtitle1" foreground="danger-100">
                                {count}
                            </Text>
                            초 후 상태가 제어됩니다. <br />
                            프로그래밍 방식으로 열림/닫힘을 관리할 수 있습니다.
                        </Sheet.Description>
                    </Sheet.Body>
                    <Sheet.Footer>
                        <Sheet.Close render={<Button variant="ghost" />}>닫기</Sheet.Close>
                    </Sheet.Footer>
                </Sheet.Popup>
            </Sheet.Root>
        </div>
    );
}
