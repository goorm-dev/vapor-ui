import { Toggle, ToggleGroup } from '@vapor-ui/core';
import {
    AlignCenterOutlineIcon,
    AlignLeftOutlineIcon,
    AlignRightOutlineIcon,
} from '@vapor-ui/icons';

export default function DefaultToggleGroup() {
    return (
        <ToggleGroup aria-label="텍스트 정렬">
            <Toggle value="left" aria-label="왼쪽 정렬">
                <AlignLeftOutlineIcon />
            </Toggle>
            <Toggle value="center" aria-label="가운데 정렬">
                <AlignCenterOutlineIcon />
            </Toggle>
            <Toggle value="right" aria-label="오른쪽 정렬">
                <AlignRightOutlineIcon />
            </Toggle>
        </ToggleGroup>
    );
}
