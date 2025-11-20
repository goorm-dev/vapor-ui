'use client';

import { Button, Sheet, TextInput } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

export default function SheetKeepMounted() {
    return (
        <div className="flex gap-4">
            {/* Normal Sheet */}
            <Sheet.Root>
                <Sheet.Trigger render={<Button variant="outline" />}>일반 Sheet</Sheet.Trigger>
                <Sheet.Popup>
                    <div className="absolute top-4 right-4">
                        <Sheet.Close aria-label="Close sheet" className="flex">
                            <CloseOutlineIcon />
                        </Sheet.Close>
                    </div>
                    <Sheet.Header>
                        <Sheet.Title>일반 Sheet</Sheet.Title>
                    </Sheet.Header>
                    <Sheet.Body>
                        <Sheet.Description>
                            이 Sheet는 닫힐 때 DOM에서 제거됩니다. 다시 열 때마다 내용이 새로
                            생성됩니다.
                        </Sheet.Description>
                        <div className="mt-4">
                            <TextInput placeholder="입력해보세요..." />
                        </div>
                    </Sheet.Body>
                </Sheet.Popup>
            </Sheet.Root>

            {/* Keep Mounted Sheet */}
            <Sheet.Root>
                <Sheet.Trigger render={<Button variant="outline" colorPalette="success" />}>
                    유지 Sheet
                </Sheet.Trigger>
                <Sheet.Popup portalElement={<Sheet.PortalPrimitive keepMounted />}>
                    <div className="absolute top-4 right-4">
                        <Sheet.Close aria-label="Close sheet" className="flex">
                            <CloseOutlineIcon />
                        </Sheet.Close>
                    </div>
                    <Sheet.Header>
                        <Sheet.Title>유지되는 Sheet</Sheet.Title>
                    </Sheet.Header>
                    <Sheet.Body>
                        <Sheet.Description>
                            이 Sheet는 닫혀도 DOM에 유지됩니다. 입력한 내용이 보존되는 것을
                            확인해보세요.
                        </Sheet.Description>
                        <div className="mt-4">
                            <TextInput placeholder="상태 보존 테스트..." />
                        </div>
                    </Sheet.Body>
                </Sheet.Popup>
            </Sheet.Root>
        </div>
    );
}
