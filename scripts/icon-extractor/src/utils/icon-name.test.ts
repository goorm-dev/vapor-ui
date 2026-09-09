import { normalizeIconName } from './icon-name';

describe('normalizeIconName', () => {
    it('Figma 레이어 이름을 PascalCase 컴포넌트 이름으로 바꾼다', () => {
        expect(normalizeIconName('❤️ arrow-right')).toBe('ArrowRight');
        expect(normalizeIconName('chevron down')).toBe('ChevronDown');
    });

    it('TypeScript 식별자가 될 수 없는 이름은 거부한다', () => {
        expect(() => normalizeIconName('123 settings')).toThrow(/not a valid component name/);
        expect(() => normalizeIconName('❤️')).toThrow(/not a valid component name/);
        expect(() => normalizeIconName('')).toThrow(/not a valid component name/);
    });
});
