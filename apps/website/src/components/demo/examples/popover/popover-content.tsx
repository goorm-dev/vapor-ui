'use client';

import { Button, Popover } from '@vapor-ui/core';

export default function PopoverPopup() {
    return (
        <div className="flex flex-wrap gap-4 p-20">
            <Popover.Root>
                <Popover.Trigger render={<Button variant="outline" />}>
                    간단한 텍스트
                </Popover.Trigger>
                <Popover.Popup>간단한 팝오버 메시지입니다.</Popover.Popup>
            </Popover.Root>

            <Popover.Root>
                <Popover.Trigger render={<Button variant="outline" />}>제목과 설명</Popover.Trigger>
                <Popover.Popup>
                    <Popover.Title>알림</Popover.Title>
                    <Popover.Description>
                        새로운 업데이트가 있습니다. 확인해보세요.
                    </Popover.Description>
                </Popover.Popup>
            </Popover.Root>

            <Popover.Root>
                <Popover.Trigger render={<Button variant="outline" />}>
                    상호작용 콘텐츠
                </Popover.Trigger>
                <Popover.Popup>
                    <Popover.Title>설정</Popover.Title>
                    <Popover.Description>원하는 설정을 선택하세요.</Popover.Description>
                    <div className="mt-4 space-y-2">
                        <Popover.Close
                            render={
                                <Button size="sm" className="w-full">
                                    옵션 1
                                </Button>
                            }
                        />

                        <Popover.Close
                            render={
                                <Button size="sm" variant="outline" className="w-full">
                                    옵션 2
                                </Button>
                            }
                        />
                    </div>
                </Popover.Popup>
            </Popover.Root>
        </div>
    );
}
