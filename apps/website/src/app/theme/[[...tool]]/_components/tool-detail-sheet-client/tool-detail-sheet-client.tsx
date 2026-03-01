'use client';

import type { ReactNode } from 'react';

import { IconButton, Sheet, Text } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

import { CopyButton } from '~/components/copy-button';

/* -------------------------------------------------------------------------------------------------
 * ToolDetailSheetClient
 * 클라이언트 사이드 Sheet UI 컴포넌트 - children으로 서버에서 렌더링된 MDX를 받습니다.
 * -----------------------------------------------------------------------------------------------*/
export interface ToolDetailSheetClientProps {
    title: string;
    description: string;
    markdownUrl: string;
    onClose: () => void;
    children: ReactNode;
}

export const ToolDetailSheetClient = ({
    title,
    description,
    markdownUrl,
    onClose,
    children,
}: ToolDetailSheetClientProps) => {
    return (
        <Sheet.Root open onOpenChange={(open) => !open && onClose()}>
            <Sheet.Popup
                positionerElement={<Sheet.PositionerPrimitive side="right" />}
                className="w-[min(640px,100vw)]"
            >
                {/* Close Button */}
                <Sheet.Close
                    className="absolute flex"
                    style={{ top: '1rem', right: '1rem', zIndex: 10 }}
                    render={
                        <IconButton
                            size="md"
                            colorPalette="secondary"
                            variant="ghost"
                            aria-label="Close"
                        />
                    }
                >
                    <CloseOutlineIcon />
                </Sheet.Close>

                {/* Header */}
                <Sheet.Header className="pr-v-800">
                    <div className="flex flex-col gap-v-200">
                        <Sheet.Title>
                            <Text typography="heading3">{title}</Text>
                        </Sheet.Title>
                        <Sheet.Description>
                            <Text typography="body2" foreground="hint-100">
                                {description}
                            </Text>
                        </Sheet.Description>
                        <CopyButton markdownUrl={markdownUrl} />
                    </div>
                </Sheet.Header>

                {/* Body - 서버에서 렌더링된 MDX 콘텐츠 */}
                <Sheet.Body className="overflow-y-auto">{children}</Sheet.Body>
            </Sheet.Popup>
        </Sheet.Root>
    );
};
