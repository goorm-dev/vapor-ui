import { describe, expect, it } from 'vitest';

import { parseFigmaUrl } from './figma-url';

describe('parseFigmaUrl', () => {
    it('design URL 에서 fileKey 와 node-id 를 추출하고 하이픈을 콜론으로 바꾼다', () => {
        expect(
            parseFigmaUrl(
                'https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/-Composites?node-id=2337-38499&m=dev',
            ),
        ).toEqual({ fileKey: 'he4tiAGOKGPl0Fm56ZpJsy', nodeId: '2337:38499' });
    });

    it('branch URL 은 branchKey 를 fileKey 로 쓴다', () => {
        expect(
            parseFigmaUrl('https://www.figma.com/design/AAAA/branch/BBBB/Name?node-id=1-2'),
        ).toEqual({ fileKey: 'BBBB', nodeId: '1:2' });
    });

    it('node-id 가 없으면 에러', () => {
        expect(() => parseFigmaUrl('https://www.figma.com/design/AAAA/Name')).toThrow(/node-id/);
    });

    it('figma 파일 URL 이 아니면 에러', () => {
        expect(() => parseFigmaUrl('https://example.com/x?node-id=1-2')).toThrow(/Not a Figma/);
    });
});
