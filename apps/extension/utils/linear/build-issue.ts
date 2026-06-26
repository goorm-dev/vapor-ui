import { blobToDataUrlUnderLimit, getImage } from '~/utils/data/image-store';
import type { QaItem } from '~/utils/data/session-store';
import { annotateImage } from '~/utils/dom/annotate-image';

import { groupByImage } from './group-by-image';

const LINEAR_DESCRIPTION_MAX_LENGTH = 250_000;
const DESCRIPTION_MARGIN = 5_000;
const SCREENSHOT_MARKDOWN_OVERHEAD = '![screenshot]()'.length;
const SCREENSHOT_OMITTED =
    '> 스크린샷 생략: Linear description 길이 제한으로 이미지를 줄일 수 없습니다.';

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
    const pageUrls = new Set(items.flatMap((item) => (item.pageUrl ? [item.pageUrl] : [])));
    const label =
        pageUrls.size > 1
            ? '여러 페이지'
            : items.find((item) => item.pageTitle?.trim())?.pageTitle?.trim() ||
              hostOf(items.find((item) => item.pageUrl)?.pageUrl) ||
              meta.title?.trim() ||
              hostOf(meta.url) ||
              '웹페이지';
    return `[QA] ${label} — ${items.length}건`;
};

/**
 * 그룹 이미지에 박스를 합성해 Linear에 올리고 마크다운 조각을 만든다.
 * sidepanel에서 보는 것과 동일하게 파랑 박스 + 번호 라벨을 박아 넣는다.
 * Linear가 가져갈 수 있도록 합성 결과를 data URL로 직접 넣는다.
 */
const imageMarkdown = async (group: QaItem[], maxLength: number): Promise<string> => {
    const head = group[0];
    if (!head.imageRef) return '';

    const blob = await getImage(head.imageRef);
    if (!blob) return '';

    const boxes = group.map((item) => ({ rect: item.rect, index: item.index }));
    const annotated = await annotateImage(blob, boxes, head.width);
    const dataUrl = await blobToDataUrlUnderLimit(
        annotated,
        maxLength - SCREENSHOT_MARKDOWN_OVERHEAD,
    );

    return dataUrl ? `![screenshot](${dataUrl})` : SCREENSHOT_OMITTED;
};

export const buildDescription = async (items: QaItem[], meta: TabMeta): Promise<string> => {
    const groups = groupByImage(items);
    const imageGroups = groups.filter((group) => group[0].imageRef).length;
    const imageMaxLength = Math.floor(
        (LINEAR_DESCRIPTION_MAX_LENGTH - DESCRIPTION_MARGIN) / Math.max(1, imageGroups),
    );
    const lines: string[] = [];

    let n = 0;
    let lastPageUrl: string | undefined;
    for (const group of groups) {
        const pageUrl = group[0].pageUrl ?? meta.url;
        if (pageUrl && pageUrl !== lastPageUrl) {
            lines.push(`> 출처: ${pageUrl}`, '');
            lastPageUrl = pageUrl;
        }

        const md = await imageMarkdown(group, imageMaxLength);
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

    return fitLinearDescription(lines.join('\n'));
};

const fitLinearDescription = (description: string): string => {
    if (description.length <= LINEAR_DESCRIPTION_MAX_LENGTH) return description;

    const withoutScreenshots = description
        .split('\n')
        .filter((line) => !line.startsWith('![screenshot]('))
        .join('\n');
    if (withoutScreenshots.length <= LINEAR_DESCRIPTION_MAX_LENGTH) return withoutScreenshots;

    const notice = '\n\n> 일부 내용은 Linear description 길이 제한으로 생략되었습니다.';
    return withoutScreenshots.slice(0, LINEAR_DESCRIPTION_MAX_LENGTH - notice.length) + notice;
};
