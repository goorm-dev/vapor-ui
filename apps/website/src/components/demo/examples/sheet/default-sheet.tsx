'use client';

import { Sheet, Button } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

export default function DefaultSheet() {
    return (
        <Sheet.Root>
            <Sheet.Trigger render={<Button variant="outline" />}>
                Open Sheet
            </Sheet.Trigger>
            <Sheet.Content>
                <div className="absolute top-4 right-4">
                    <Sheet.Close aria-label="Close sheet" className="flex">
                        <CloseOutlineIcon />
                    </Sheet.Close>
                </div>
                <Sheet.Header>
                    <Sheet.Title>알림</Sheet.Title>
                </Sheet.Header>
                <Sheet.Body>
                    <Sheet.Description>
                        Sheet는 화면 가장자리에서 슬라이드되어 나타나는 오버레이 컴포넌트입니다.
                        추가 정보나 작업을 위한 공간을 제공합니다.
                    </Sheet.Description>
                </Sheet.Body>
                <Sheet.Footer>
                    <Sheet.Close render={<Button variant="ghost" />}>
                        닫기
                    </Sheet.Close>
                    <Button color="primary">확인</Button>
                </Sheet.Footer>
            </Sheet.Content>
        </Sheet.Root>
    );
}
