import { IconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function IconButtonDisabled() {
    return (
        <div className="flex items-center gap-4">
            <IconButton disabled aria-label="비활성화된 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton disabled variant="outline" aria-label="비활성화된 테두리 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton disabled variant="ghost" aria-label="비활성화된 투명 버튼">
                <HeartIcon />
            </IconButton>
        </div>
    );
}
