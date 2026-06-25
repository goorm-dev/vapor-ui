import { groupByImage } from './group-by-image';
import { blobToDataUrl, getImage } from './image-store';
import { uploadImage } from './linear';
import type { QaItem } from './session-store';

export interface TabMeta {
    url?: string;
    title?: string;
}

const hostOf = (url?: string): string => {
    if (!url) return '';
    try {
        return new URL(url).host;
    } catch {
        return url;
    }
};

export const buildTitle = (items: QaItem[], meta: TabMeta): string => {
    const label = meta.title?.trim() || hostOf(meta.url) || '웹페이지';
    return `[QA] ${label} — ${items.length}건`;
};

/** imageRef로 이미지를 Linear에 올리고 마크다운 조각을 만든다. 업로드 실패 시 data URL로 폴백. */
const imageMarkdown = async (key: string, imageRef: string): Promise<string> => {
    const blob = await getImage(imageRef);
    if (!blob) return '';

    const assetUrl = await uploadImage(key, blob, `${imageRef}.png`);
    if (assetUrl) return `![screenshot](${assetUrl})`;

    // 폴백: description 마크다운에 data URL을 넣어 Linear가 자동 업로드하게 한다.
    return `![screenshot](${await blobToDataUrl(blob)})`;
};

export const buildDescription = async (
    key: string,
    items: QaItem[],
    meta: TabMeta,
): Promise<string> => {
    const lines: string[] = [];
    if (meta.url) lines.push(`> 출처: ${meta.url}`, '');

    let n = 0;
    for (const group of groupByImage(items)) {
        const head = group[0];
        const md = head.imageRef ? await imageMarkdown(key, head.imageRef) : '';
        if (md) lines.push(md, '');

        for (const item of group) {
            n += 1;
            const heading = item.memo.split('\n')[0]?.trim() || '(메모 없음)';
            lines.push(`## ${n}. ${heading}`, '');
            lines.push(`- selector: \`${item.selector}\``);
            if (item.memo.trim()) lines.push(`- memo: ${item.memo}`);
            if (item.components?.length) lines.push(`- components: ${item.components.join(', ')}`);
            lines.push('');
        }
    }

    return lines.join('\n');
};
