import { describe, expect, it } from 'vitest';

import { jsonOutputFormat } from '~/domain/output-format';

describe('serializePropsInfo', () => {
    // 산출물이 커밋되고 CI가 재생성 결과와 대조하므로 포맷이 흔들리면 전 파일이 diff로 뜬다.
    it('4-space 들여쓰기에 끝 개행을 붙인다', () => {
        const json = jsonOutputFormat.serialize({ name: 'Badge', props: [] });

        expect(json).toBe('{\n    "name": "Badge",\n    "props": []\n}\n');
    });
});
