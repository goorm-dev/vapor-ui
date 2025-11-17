'use client';

import { Button, Popover } from '@vapor-ui/core';

export default function DefaultPopover() {
    return (
        <div className="flex justify-center p-20">
            <Popover.Root>
                <Popover.Trigger render={<Button variant="outline" />}>팝오버 열기</Popover.Trigger>
                <Popover.Popup>
                    <Popover.Title>알림</Popover.Title>
                    <Popover.Description>
                        새로운 메시지 3개와 알림 1개가 있습니다.
                    </Popover.Description>
                </Popover.Popup>
            </Popover.Root>
        </div>
    );
}
