'use client';

import { useState } from 'react';

import { Toggle, Toolbar } from '@vapor-ui/core';
import { BoldOutlineIcon, ItalicIcon } from '@vapor-ui/icons';

export default function ToolbarInput() {
    const [fontSize, setFontSize] = useState('');

    return (
        <Toolbar.Root aria-label="텍스트 편집">
            <Toolbar.Input
                placeholder="글자 크기 (px)"
                value={fontSize}
                onValueChange={setFontSize}
            />
            <Toolbar.Separator />
            <Toolbar.Button render={<Toggle aria-label="굵게" />}>
                <BoldOutlineIcon />
            </Toolbar.Button>
            <Toolbar.Button render={<Toggle aria-label="기울임" />}>
                <ItalicIcon />
            </Toolbar.Button>
        </Toolbar.Root>
    );
}
