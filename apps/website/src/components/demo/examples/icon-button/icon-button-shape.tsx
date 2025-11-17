import { IconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function IconButtonShape() {
    return (
        <div className="flex items-center gap-4">
            <IconButton shape="square" aria-label="사각형 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton shape="circle" aria-label="원형 좋아요 버튼">
                <HeartIcon />
            </IconButton>
        </div>
    );
}
