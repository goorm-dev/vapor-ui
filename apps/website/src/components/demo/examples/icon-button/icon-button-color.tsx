import { IconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function IconButtonColor() {
    return (
        <div className="flex flex-wrap gap-2">
            <IconButton colorPalette="primary" aria-label="기본 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton colorPalette="secondary" aria-label="보조 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton colorPalette="success" aria-label="성공 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton colorPalette="warning" aria-label="경고 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton colorPalette="danger" aria-label="위험 좋아요 버튼">
                <HeartIcon />
            </IconButton>
            <IconButton colorPalette="contrast" aria-label="대비 좋아요 버튼">
                <HeartIcon />
            </IconButton>
        </div>
    );
}
