'use client';

import { Button, Sheet } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

export default function Flexible() {
    return (
        <Sheet.Root>
            <Sheet.Trigger render={<Button variant="outline" />}>유연한 Sheet</Sheet.Trigger>
            <Sheet.PortalPrimitive>
                <Sheet.OverlayPrimitive />
                <Sheet.PositionerPrimitive>
                    <Sheet.PopupPrimitive>
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
                                이 Sheet는 Vapor UI의 Primitive 컴포넌트를 사용하여 유연하게
                                구성되었습니다.
                            </Sheet.Description>
                        </Sheet.Body>
                    </Sheet.PopupPrimitive>
                </Sheet.PositionerPrimitive>
            </Sheet.PortalPrimitive>
        </Sheet.Root>
    );
}
