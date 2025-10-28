'use client';

import { Button, Sheet } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

export default function SheetSimple() {
    return (
        <Sheet.Root>
            <Sheet.Trigger render={<Button variant="outline" />}>간단한 Sheet</Sheet.Trigger>
            <Sheet.Content>
                <div className="absolute top-4 right-4">
                    <Sheet.Close aria-label="Close sheet" className="flex">
                        <CloseOutlineIcon />
                    </Sheet.Close>
                </div>
                <Sheet.Header>
                    <Sheet.Title>간단한 Sheet</Sheet.Title>
                </Sheet.Header>
                <Sheet.Body>
                    <Sheet.Description>
                        이것은 Sheet 컴포넌트의 가장 기본적인 사용 예시입니다. 최소한의 구성으로
                        Sheet를 만들 수 있습니다.
                    </Sheet.Description>
                </Sheet.Body>
            </Sheet.Content>
        </Sheet.Root>
    );
}
