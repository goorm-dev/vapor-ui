import { IconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function IconButtonColor() {
    return (
        <div className="flex flex-wrap gap-2">
            <IconButton color="primary" aria-label="기본 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton color="secondary" aria-label="보조 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton color="success" aria-label="성공 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton color="warning" aria-label="경고 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton color="danger" aria-label="위험 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton color="contrast" aria-label="대비 좋아요 버튼">
                <HeartIcon />
            </IconButton>
        </div>
    );
}
