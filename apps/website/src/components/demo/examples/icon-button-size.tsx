import { IconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function IconButtonSize() {
    return (
        <div className="flex items-center gap-4">
            <IconButton size="sm" aria-label="작은 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton size="md" aria-label="보통 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton size="lg" aria-label="큰 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton size="xl" aria-label="매우 큰 좋아요 버튼">
                <HeartIcon />
            </IconButton>
        </div>
    );
}
