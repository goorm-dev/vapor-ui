import { Toggle, Toolbar } from '@vapor-ui/core';
import { BoldOutlineIcon, ItalicIcon, UnderlineOutlineIcon } from '@vapor-ui/icons';

export default function ToolbarDisabled() {
    return (
        <Toolbar.Root disabled aria-label="텍스트 서식 (비활성)">
            <Toolbar.Button render={<Toggle aria-label="굵게" />}>
                <BoldOutlineIcon />
            </Toolbar.Button>
            <Toolbar.Button render={<Toggle aria-label="기울임" />}>
                <ItalicIcon />
            </Toolbar.Button>
            <Toolbar.Button render={<Toggle aria-label="밑줄" />}>
                <UnderlineOutlineIcon />
            </Toolbar.Button>
        </Toolbar.Root>
    );
}
