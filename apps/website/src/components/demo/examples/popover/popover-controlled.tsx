'use client';

import { useState } from 'react';

import { Button, Popover } from '@vapor-ui/core';

export default function PopoverControlled() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-col items-center gap-4 p-20">
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsOpen(true)}>
                    팝오버 열기
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                    팝오버 닫기
                </Button>
            </div>

            <p className="text-sm text-foreground-hint">현재 상태: {isOpen ? '열림' : '닫힘'}</p>

            <Popover.Root open={isOpen} onOpenChange={(open) => console.log(open)}>
                <Popover.Trigger render={<Button />}>제어되는 팝오버</Popover.Trigger>
                <Popover.Popup>
                    <Popover.Title>제어되는 팝오버</Popover.Title>
                    <Popover.Description>
                        이 팝오버는 외부 상태에 의해 제어됩니다. 위의 버튼으로 열고 닫을 수
                        있습니다.
                    </Popover.Description>
                    <div className="mt-4 flex gap-2">
                        <Popover.Close
                            render={<Button size="sm" onClick={() => setIsOpen(false)} />}
                        >
                            닫기
                        </Popover.Close>
                    </div>
                </Popover.Popup>
            </Popover.Root>
        </div>
    );
}
