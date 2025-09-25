'use client';

import { Button, Popover } from '@vapor-ui/core';

export default function PopoverPositioning() {
    return (
        <div className="grid grid-cols-2 gap-8 p-20">
            <div className="space-y-6">
                <h3 className="text-sm font-medium text-foreground-hint">방향 설정</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Popover.Root>
                        <Popover.Trigger render={<Button variant="outline" />}>
                            상단 팝오버
                        </Popover.Trigger>
                        <Popover.Content positionerProps={{ side: 'top' }}>
                            <Popover.Title>상단 팝오버</Popover.Title>
                            <Popover.Description>
                                트리거 위쪽에 표시되는 팝오버입니다.
                            </Popover.Description>
                        </Popover.Content>
                    </Popover.Root>

                    <Popover.Root>
                        <Popover.Trigger render={<Button variant="outline" />}>
                            우측 팝오버
                        </Popover.Trigger>
                        <Popover.Content positionerProps={{ side: 'right' }}>
                            <Popover.Title>우측 팝오버</Popover.Title>
                            <Popover.Description>
                                트리거 오른쪽에 표시되는 팝오버입니다.
                            </Popover.Description>
                        </Popover.Content>
                    </Popover.Root>

                    <Popover.Root>
                        <Popover.Trigger render={<Button variant="outline" />}>
                            하단 팝오버
                        </Popover.Trigger>
                        <Popover.Content positionerProps={{ side: 'bottom' }}>
                            <Popover.Title>하단 팝오버</Popover.Title>
                            <Popover.Description>
                                트리거 아래쪽에 표시되는 팝오버입니다.
                            </Popover.Description>
                        </Popover.Content>
                    </Popover.Root>

                    <Popover.Root>
                        <Popover.Trigger render={<Button variant="outline" />}>
                            좌측 팝오버
                        </Popover.Trigger>
                        <Popover.Content positionerProps={{ side: 'left' }}>
                            <Popover.Title>좌측 팝오버</Popover.Title>
                            <Popover.Description>
                                트리거 왼쪽에 표시되는 팝오버입니다.
                            </Popover.Description>
                        </Popover.Content>
                    </Popover.Root>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-sm font-medium text-foreground-hint">정렬 설정</h3>
                <div className="space-y-4">
                    <Popover.Root>
                        <Popover.Trigger render={<Button variant="outline" />}>
                            시작점 정렬
                        </Popover.Trigger>
                        <Popover.Content positionerProps={{ align: 'start' }}>
                            <Popover.Title>시작점 정렬</Popover.Title>
                            <Popover.Description>
                                트리거의 시작점에 정렬된 팝오버입니다.
                            </Popover.Description>
                        </Popover.Content>
                    </Popover.Root>

                    <Popover.Root>
                        <Popover.Trigger render={<Button variant="outline" />}>
                            중앙 정렬
                        </Popover.Trigger>
                        <Popover.Content positionerProps={{ align: 'center' }}>
                            <Popover.Title>중앙 정렬</Popover.Title>
                            <Popover.Description>
                                트리거의 중앙에 정렬된 팝오버입니다.
                            </Popover.Description>
                        </Popover.Content>
                    </Popover.Root>

                    <Popover.Root>
                        <Popover.Trigger render={<Button variant="outline" />}>
                            끝점 정렬
                        </Popover.Trigger>
                        <Popover.Content positionerProps={{ align: 'end' }}>
                            <Popover.Title>끝점 정렬</Popover.Title>
                            <Popover.Description>
                                트리거의 끝점에 정렬된 팝오버입니다.
                            </Popover.Description>
                        </Popover.Content>
                    </Popover.Root>
                </div>
            </div>
        </div>
    );
}
