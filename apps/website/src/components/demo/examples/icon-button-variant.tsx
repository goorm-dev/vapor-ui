import { IconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function IconButtonVariant() {
    return (
        <div className="flex items-center gap-4">
            <IconButton variant="fill" aria-label="채움 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton variant="outline" aria-label="테두리 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton variant="ghost" aria-label="투명 좋아요 버튼">
                <HeartIcon />
            </IconButton>
        </div>
    );
}
