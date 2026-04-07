/**
 * JSON serializer unit tests
 */
import type { ComponentModel, PropModel } from '~/models/internal';
import { componentModelToJson, componentsToJson, propModelToJson } from '~/transform';

describe('propModelToJson', () => {
    it('필수 필드만 변환', () => {
        const model: PropModel = {
            name: 'disabled',
            types: ['boolean'],
            required: false,
            category: 'custom',
        };

        const result = propModelToJson(model);

        expect(result).toEqual({
            name: 'disabled',
            type: ['boolean'],
            required: false,
        });
    });

    it('description 포함', () => {
        const model: PropModel = {
            name: 'label',
            types: ['string'],
            required: true,
            description: '버튼 레이블',
            category: 'required',
        };

        const result = propModelToJson(model);

        expect(result.description).toBe('버튼 레이블');
    });

    it('defaultValue 포함', () => {
        const model: PropModel = {
            name: 'size',
            types: ['"sm"', '"md"', '"lg"'],
            required: false,
            defaultValue: 'md',
            category: 'variants',
        };

        const result = propModelToJson(model);

        expect(result.defaultValue).toBe('md');
    });

    it('category는 JSON에 포함되지 않음', () => {
        const model: PropModel = {
            name: 'test',
            types: ['string'],
            required: false,
            category: 'state',
        };

        const result = propModelToJson(model);

        expect(result).not.toHaveProperty('category');
    });

    it('빈 description은 포함되지 않음', () => {
        const model: PropModel = {
            name: 'test',
            types: ['string'],
            required: false,
            category: 'custom',
            description: undefined,
        };

        const result = propModelToJson(model);

        expect(result).not.toHaveProperty('description');
    });
});

describe('componentModelToJson', () => {
    it('기본 컴포넌트 변환', () => {
        const model: ComponentModel = {
            name: 'Button',
            props: [],
        };

        const result = componentModelToJson(model);

        expect(result).toEqual({
            name: 'Button',
            props: [],
        });
    });

    it('description 포함', () => {
        const model: ComponentModel = {
            name: 'Button',
            description: '기본 버튼 컴포넌트',
            props: [],
        };

        const result = componentModelToJson(model);

        expect(result.description).toBe('기본 버튼 컴포넌트');
    });

    it('props 변환', () => {
        const model: ComponentModel = {
            name: 'Button',
            props: [
                {
                    name: 'disabled',
                    types: ['boolean'],
                    required: false,
                    category: 'custom',
                },
            ],
        };

        const result = componentModelToJson(model);

        expect(result.props).toHaveLength(1);
        expect(result.props[0].name).toBe('disabled');
    });
});

describe('componentsToJson', () => {
    it('여러 컴포넌트 변환', () => {
        const models: ComponentModel[] = [
            { name: 'Button', props: [] },
            { name: 'Input', props: [] },
        ];

        const result = componentsToJson(models);

        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('Button');
        expect(result[1].name).toBe('Input');
    });

    it('빈 배열', () => {
        const result = componentsToJson([]);

        expect(result).toEqual([]);
    });
});
