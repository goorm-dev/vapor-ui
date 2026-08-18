import { Toggle, ToggleGroup, Toolbar } from '@vapor-ui/core';
import {
    AlignCenterOutlineIcon,
    AlignLeftOutlineIcon,
    AlignRightOutlineIcon,
    BoldOutlineIcon,
    ItalicIcon,
    UnderlineOutlineIcon,
} from '@vapor-ui/icons';

export default function ToolbarSeparator() {
    return (
        <Toolbar.Root aria-label="텍스트 서식">
            <Toolbar.Button render={<Toggle aria-label="굵게" />}>
                <BoldOutlineIcon />
            </Toolbar.Button>
            <Toolbar.Button render={<Toggle aria-label="기울임" />}>
                <ItalicIcon />
            </Toolbar.Button>
            <Toolbar.Button render={<Toggle aria-label="밑줄" />}>
                <UnderlineOutlineIcon />
            </Toolbar.Button>

            <Toolbar.Separator />

            <Toolbar.Group render={<ToggleGroup />}>
                <Toolbar.Button render={<Toggle aria-label="왼쪽 정렬" />}>
                    <AlignLeftOutlineIcon />
                </Toolbar.Button>
                <Toolbar.Button render={<Toggle aria-label="가운데 정렬" />}>
                    <AlignCenterOutlineIcon />
                </Toolbar.Button>
                <Toolbar.Button render={<Toggle aria-label="오른쪽 정렬" />}>
                    <AlignRightOutlineIcon />
                </Toolbar.Button>
            </Toolbar.Group>
        </Toolbar.Root>
    );
}
