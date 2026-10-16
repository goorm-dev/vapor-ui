import { checkTranslation, parseGuide } from '../src/guide';

describe('parseGuide', () => {
    it('frontmatter의 version·model과 본문을 읽는다', () => {
        expect(parseGuide('---\nversion: 3\nmodel: claude-sonnet-5-5\n---\n\n# 가이드\n')).toEqual({
            version: 3,
            model: 'claude-sonnet-5-5',
            body: '# 가이드',
        });
    });

    it('CRLF 줄바꿈과 따옴표로 감싼 값도 읽는다', () => {
        expect(parseGuide('---\r\nversion: 2\r\nmodel: "m"\r\n---\r\nbody')).toEqual({
            version: 2,
            model: 'm',
            body: 'body',
        });
    });

    it('version이나 model이 없으면 에러를 낸다', () => {
        expect(() => parseGuide('---\nmodel: x\n---\nbody')).toThrow(/version/);
        expect(() => parseGuide('# no frontmatter')).toThrow(/frontmatter/);
    });
});

describe('checkTranslation', () => {
    it('백틱 안의 코드가 원문과 같으면 통과한다', () => {
        expect(
            checkTranslation(
                'Renders a `<div>` with `open`.',
                '`open`과 함께 `<div>` 요소로 렌더링됩니다.',
            ),
        ).toBeNull();
    });

    it('백틱 안의 코드를 바꾸면 실패한다', () => {
        expect(
            checkTranslation("`'trap-focus'`: traps focus.", "`'trap 포커스'`: 포커스를 가둡니다."),
        ).toMatch(/trap-focus/);
    });

    it('빈 번역은 실패한다', () => {
        expect(checkTranslation('The value.', '  ')).not.toBeNull();
    });
});
