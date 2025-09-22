'use client';

import { useState } from 'react';
import { Sheet, Button } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

export default function SheetControlled() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Button 
                    onClick={() => setIsOpen(true)}
                    color="primary"
                >
                    Sheet 열기
                </Button>
                <Button 
                    onClick={() => setIsOpen(false)}
                    color="danger"
                    variant="outline"
                >
                    Sheet 닫기
                </Button>
            </div>

            <p className="text-sm text-gray-600">
                현재 상태: <strong>{isOpen ? '열림' : '닫힘'}</strong>
            </p>

            <Sheet.Root open={isOpen} onOpenChange={setIsOpen}>
                <Sheet.Content>
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
                            이 Sheet는 외부 버튼으로 상태가 제어됩니다.
                            프로그래밍 방식으로 열림/닫힘을 관리할 수 있습니다.
                        </Sheet.Description>
                    </Sheet.Body>
                    <Sheet.Footer>
                        <Sheet.Close render={<Button variant="ghost" />}>
                            닫기
                        </Sheet.Close>
                    </Sheet.Footer>
                </Sheet.Content>
            </Sheet.Root>
        </div>
    );
}
