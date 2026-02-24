/**
 * Type cleaner unit tests
 *
 * Tests for type string cleaning and simplification.
 */
import {
    cleanType,
    containsStateCallback,
    simplifyStateCallback,
    splitTopLevelUnion,
} from '~/core/parser/type/cleaner';

describe('containsStateCallback', () => {
    it('State 콜백 포함 시 true', () => {
        expect(containsStateCallback('(state: Button.State) => string')).toBe(true);
    });

    it('State 콜백 없으면 false', () => {
        expect(containsStateCallback('string | number')).toBe(false);
    });

    it('.State) 패턴 감지', () => {
        expect(containsStateCallback('((props: Props, state: Root.State) => void)')).toBe(true);
    });
});

describe('simplifyStateCallback', () => {
    it('State 콜백을 반환 타입으로 단순화', () => {
        const input = '(state: Root.State) => string';
        const result = simplifyStateCallback(input);
        expect(result).toBe('string');
    });

    it('State 없으면 그대로 반환', () => {
        const input = 'string | number';
        const result = simplifyStateCallback(input);
        expect(result).toBe('string | number');
    });

    it('union에서 State 콜백만 단순화', () => {
        const input = 'string | (state: Root.State) => boolean';
        const result = simplifyStateCallback(input);
        expect(result).toBe('string | boolean');
    });
});

describe('splitTopLevelUnion', () => {
    it('단순 union 분리', () => {
        expect(splitTopLevelUnion('a | b | c')).toEqual(['a', 'b', 'c']);
    });

    it('단일 타입은 배열로', () => {
        expect(splitTopLevelUnion('string')).toEqual(['string']);
    });

    it('괄호 안의 | 무시', () => {
        expect(splitTopLevelUnion('(a | b) | c')).toEqual(['(a | b)', 'c']);
    });

    it('제네릭 안의 | 무시', () => {
        expect(splitTopLevelUnion('Array<a | b> | c')).toEqual(['Array<a | b>', 'c']);
    });

    it('중첩 괄호 처리', () => {
        expect(splitTopLevelUnion('((a | b) | c) | d')).toEqual(['((a | b) | c)', 'd']);
    });

    it('함수 타입 내부 | 무시', () => {
        expect(splitTopLevelUnion('(x: a | b) => c | d')).toEqual(['(x: a | b) => c', 'd']);
    });

    it('빈 문자열', () => {
        expect(splitTopLevelUnion('')).toEqual([]);
    });

    it('공백만 있는 part는 빈 문자열로 포함', () => {
        // 실제 구현은 빈 문자열도 포함함 (filter는 호출자가 처리)
        expect(splitTopLevelUnion('a |  | b')).toEqual(['a', '', 'b']);
    });

    it('객체 리터럴 내부 | 무시', () => {
        expect(splitTopLevelUnion('{ a: x | y } | z')).toEqual(['{ a: x | y }', 'z']);
    });

    it('배열 타입 내부 | 무시', () => {
        expect(splitTopLevelUnion('[a | b] | c')).toEqual(['[a | b]', 'c']);
    });

    it('화살표 함수 (=>) 처리', () => {
        // => 에서 >는 제네릭 닫기가 아님
        expect(splitTopLevelUnion('() => void | null')).toEqual(['() => void', 'null']);
    });
});

describe('cleanType', () => {
    it('ComponentRenderFn 단순화', () => {
        const input = 'ComponentRenderFn<Props, State>';
        const result = cleanType(input);
        expect(result.type).toBe('ReactElement | ((props: HTMLProps) => ReactElement)');
    });

    it('undefined 제거', () => {
        const input = 'string | undefined';
        const result = cleanType(input);
        expect(result.type).toBe('string');
    });

    it('중복 타입 제거', () => {
        const input = 'string | string | number';
        const result = cleanType(input);
        expect(result.type).toBe('string | number');
    });

    it('string literal union → values 추출', () => {
        const input = '"primary" | "secondary" | "danger"';
        const result = cleanType(input);
        expect(result.values).toEqual(['primary', 'secondary', 'danger']);
    });

    it('mixed union → values는 원본 유지', () => {
        const input = 'string | number';
        const result = cleanType(input);
        expect(result.values).toEqual(['string', 'number']);
    });

    it('render prop 타입 정리', () => {
        const input = '(props: HTMLProps<HTMLDivElement>, state: Root.State) => ReactElement';
        const result = cleanType(input);
        expect(result.type).toBe('(props: HTMLProps) => ReactElement');
    });

    it('제네릭 State 제거', () => {
        const input = 'Callback<Props, Root.State>';
        const result = cleanType(input);
        expect(result.type).toBe('Callback<Props>');
    });
});
