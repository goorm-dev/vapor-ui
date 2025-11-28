'use client';

import { Button, Sheet } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

export default function SheetSide() {
    return (
        <div className="flex flex-wrap gap-4">
            {/* Right Side (Default) */}
            <Sheet.Root>
                <Sheet.Trigger render={<Button variant="outline" />}>Right</Sheet.Trigger>
                <Sheet.Popup positionerElement={<Sheet.PositionerPrimitive side="right" />}>
                    <div className="absolute top-4 right-4">
                        <Sheet.Close aria-label="Close sheet" className="flex">
                            <CloseOutlineIcon />
                        </Sheet.Close>
                    </div>
                    <Sheet.Header>
                        <Sheet.Title>우측 Sheet</Sheet.Title>
                    </Sheet.Header>
                    <Sheet.Body>
                        <Sheet.Description>
                            화면 우측에서 슬라이드됩니다. (기본값)
                        </Sheet.Description>
                    </Sheet.Body>
                </Sheet.Popup>
            </Sheet.Root>

            {/* Left Side */}
            <Sheet.Root>
                <Sheet.Trigger render={<Button variant="outline" />}>Left</Sheet.Trigger>
                <Sheet.Popup positionerElement={<Sheet.PositionerPrimitive side="left" />}>
                    <div className="absolute top-4 right-4">
                        <Sheet.Close aria-label="Close sheet" className="flex">
                            <CloseOutlineIcon />
                        </Sheet.Close>
                    </div>
                    <Sheet.Header>
                        <Sheet.Title>좌측 Sheet</Sheet.Title>
                    </Sheet.Header>
                    <Sheet.Body>
                        <Sheet.Description>화면 좌측에서 슬라이드됩니다.</Sheet.Description>
                    </Sheet.Body>
                </Sheet.Popup>
            </Sheet.Root>

            {/* Top Side */}
            <Sheet.Root>
                <Sheet.Trigger render={<Button variant="outline" />}>Top</Sheet.Trigger>
                <Sheet.Popup positionerElement={<Sheet.PositionerPrimitive side="top" />}>
                    <div className="absolute top-4 right-4">
                        <Sheet.Close aria-label="Close sheet" className="flex">
                            <CloseOutlineIcon />
                        </Sheet.Close>
                    </div>
                    <Sheet.Header>
                        <Sheet.Title>상단 Sheet</Sheet.Title>
                    </Sheet.Header>
                    <Sheet.Body>
                        <Sheet.Description>화면 상단에서 슬라이드됩니다.</Sheet.Description>
                    </Sheet.Body>
                </Sheet.Popup>
            </Sheet.Root>

            {/* Bottom Side */}
            <Sheet.Root>
                <Sheet.Trigger render={<Button variant="outline" />}>Bottom</Sheet.Trigger>
                <Sheet.Popup positionerElement={<Sheet.PositionerPrimitive side="bottom" />}>
                    <div className="absolute top-4 right-4">
                        <Sheet.Close aria-label="Close sheet" className="flex">
                            <CloseOutlineIcon />
                        </Sheet.Close>
                    </div>
                    <Sheet.Header>
                        <Sheet.Title>하단 Sheet</Sheet.Title>
                    </Sheet.Header>
                    <Sheet.Body>
                        <Sheet.Description>화면 하단에서 슬라이드됩니다.</Sheet.Description>
                    </Sheet.Body>
                </Sheet.Popup>
            </Sheet.Root>
        </div>
    );
}
