/**
 * policy() tests
 *
 * Covers README "Extraction Policy" → Props, Types and Fields through the one
 * public function, with plain ParsedComponent data in and ComponentDoc out.
 */
import type { ParsedComponent, ParsedProp, ParsedTypeMember } from '#model';
import { policy } from '#policy';

const STRING: ParsedTypeMember = { text: 'string', kind: 'other' };
const UNDEFINED: ParsedTypeMember = { text: 'undefined', kind: 'undefined' };

function prop(name: string, overrides: Partial<ParsedProp> = {}): ParsedProp {
    return { name, typeMembers: [STRING], isOptional: true, source: 'project', ...overrides };
}

function other(text: string): ParsedTypeMember {
    return { text, kind: 'other' };
}

function literal(value: string): ParsedTypeMember {
    return { text: `"${value}"`, kind: 'string-literal' };
}

function fn(text: string): ParsedTypeMember {
    return { text, kind: 'function' };
}

function component(props: ParsedProp[], overrides: Partial<ParsedComponent> = {}): ParsedComponent {
    return { name: 'Button', props, ...overrides };
}

function propsOf(...props: ParsedProp[]) {
    return policy([component(props)])[0].props;
}

function namesOf(...props: ParsedProp[]): string[] {
    return propsOf(...props).map((doc) => doc.name);
}

function typesOf(...typeMembers: ParsedTypeMember[]) {
    const [{ type, detailedType }] = propsOf(prop('x', { typeMembers }));
    return { type, detailedType };
}

describe('policy', () => {
    describe('문서화할 prop (README Props 규칙 1-5)', () => {
        it('className·style은 React/DOM 타입에서 왔어도 남긴다', () => {
            expect(
                namesOf(prop('className', { source: 'react' }), prop('style', { source: 'dom' })),
            ).toEqual(['className', 'style']);
        });

        it('React·DOM·Base UI가 아닌 node_modules에서 온 prop은 뺀다', () => {
            expect(
                namesOf(
                    prop('onClick', { source: 'react' }),
                    prop('onFocus', { source: 'dom' }),
                    prop('tabIndex', { source: 'external' }),
                ),
            ).toEqual([]);
        });

        it('React 타입에서 온 필수 prop도 뺀다', () => {
            expect(namesOf(prop('children', { source: 'react', isOptional: false }))).toEqual([]);
        });

        it('data-·aria-로 시작하는 prop은 어디서 왔든 뺀다', () => {
            expect(
                namesOf(
                    prop('data-testid'),
                    prop('aria-hidden'),
                    prop('aria-label', { source: 'base-ui' }),
                ),
            ).toEqual([]);
        });

        it('sprinkles 모듈에서 온 prop은 뺀다', () => {
            expect(namesOf(prop('color', { source: 'sprinkles' }))).toEqual([]);
        });

        it('deprecated CSS 축약 이름의 prop은 직접 선언했어도 뺀다', () => {
            expect(namesOf(prop('$css'), prop('padding'), prop('width'))).toEqual([]);
        });

        it('직접 선언한 prop, variant prop, Base UI prop은 남긴다', () => {
            expect(
                namesOf(
                    prop('disabled'),
                    prop('size', { source: 'variants' }),
                    prop('keepMounted', { source: 'base-ui' }),
                ),
            ).toEqual(['size', 'disabled', 'keepMounted']);
        });
    });

    describe('정렬 (README Props 그룹 표)', () => {
        it('required → variants → state → custom → base-ui → composition 순으로 놓는다', () => {
            expect(
                namesOf(
                    prop('render'),
                    prop('keepMounted', { source: 'base-ui' }),
                    prop('className'),
                    prop('onChange'),
                    prop('size', { source: 'variants' }),
                    prop('children', { isOptional: false }),
                ),
            ).toEqual(['children', 'size', 'onChange', 'className', 'keepMounted', 'render']);
        });

        it('그룹은 required, composition, variants, state, base-ui 순으로 먼저 맞는 쪽을 따른다', () => {
            expect(
                namesOf(
                    prop('asChild', { source: 'variants' }),
                    prop('value', { source: 'variants' }),
                    prop('open', { source: 'base-ui' }),
                    prop('keepMounted', { source: 'base-ui' }),
                    prop('render', { isOptional: false }),
                ),
            ).toEqual(['render', 'value', 'open', 'keepMounted', 'asChild']);
        });

        it('같은 그룹 안에서는 이름순으로 놓는다', () => {
            expect(namesOf(prop('zIndex'), prop('className'), prop('disabled'))).toEqual([
                'className',
                'disabled',
                'zIndex',
            ]);
        });

        it.each([
            'value',
            'defaultValue',
            'onChange',
            'onOpenChange',
            'onValueChange',
            'open',
            'checked',
            'selected',
            'expanded',
            'pressed',
            'active',
            'defaultOpen',
            'defaultChecked',
            'defaultSelected',
            'defaultExpanded',
            'defaultPressed',
            'defaultActive',
        ])('%s는 state 그룹이라 custom prop보다 앞에 온다', (name) => {
            expect(namesOf(prop('aaa'), prop(name))).toEqual([name, 'aaa']);
        });

        it.each(['onClick', 'openDelay', 'valueText'])(
            '%s는 state 패턴에 맞지 않아 custom 그룹이다',
            (name) => {
                expect(namesOf(prop(name), prop('aaa'))).toEqual(['aaa', name]);
            },
        );
    });

    describe('타입 (README Types)', () => {
        it('요약 type은 멤버마다 원소 하나로 쓰고 undefined는 뺀다', () => {
            expect(typesOf(other('boolean'), UNDEFINED).type).toEqual(['boolean']);
        });

        it('detailedType은 undefined까지 모든 멤버를 | 로 잇는다', () => {
            expect(typesOf(other('boolean'), UNDEFINED).detailedType).toBe('boolean | undefined');
        });

        it('string literal은 요약에서 따옴표를 떼고 detailedType에서는 유지한다', () => {
            expect(typesOf(literal('sm'), literal('md'), UNDEFINED)).toEqual({
                type: ['sm', 'md'],
                detailedType: '"sm" | "md" | undefined',
            });
        });

        it('요약에서 함수 멤버는 function으로 줄인다', () => {
            expect(typesOf(STRING, fn('(state: Button.State) => string'), UNDEFINED)).toEqual({
                type: ['string', 'function'],
                detailedType: 'string | ((state: Button.State) => string) | undefined',
            });
        });

        it('요약에서 function은 한 번만 쓴다', () => {
            expect(
                typesOf(
                    other('ReactElement'),
                    fn('() => ReactElement'),
                    fn('(a: A) => ReactElement'),
                ).type,
            ).toEqual(['ReactElement', 'function']);
        });

        it('함수 하나뿐인 타입은 detailedType에서 괄호로 감싸지 않는다', () => {
            expect(typesOf(fn('(value: string) => void'))).toEqual({
                type: ['function'],
                detailedType: '(value: string) => void',
            });
        });

        it('그 밖의 멤버는 출력된 텍스트 그대로 쓴다', () => {
            expect(
                typesOf(other('ReactNode'), other('React.RefObject<HTMLElement | null>')),
            ).toEqual({
                type: ['ReactNode', 'React.RefObject<HTMLElement | null>'],
                detailedType: 'ReactNode | React.RefObject<HTMLElement | null>',
            });
        });
    });

    describe('필드 (README Fields)', () => {
        it('prop 필드를 name, type, detailedType, required, description, defaultValue 순으로 쓴다', () => {
            const [doc] = propsOf(
                prop('size', {
                    typeMembers: [literal('sm'), literal('md'), UNDEFINED],
                    source: 'variants',
                    description: '버튼 크기',
                    defaultValue: 'md',
                }),
            );

            expect(doc).toEqual({
                name: 'size',
                type: ['sm', 'md'],
                detailedType: '"sm" | "md" | undefined',
                required: false,
                description: '버튼 크기',
                defaultValue: 'md',
            });
            expect(Object.keys(doc)).toEqual([
                'name',
                'type',
                'detailedType',
                'required',
                'description',
                'defaultValue',
            ]);
        });

        it('optional이 아닌 prop은 required: true다', () => {
            expect(propsOf(prop('label', { isOptional: false }))[0].required).toBe(true);
        });

        it('설명·기본값이 없으면 필드를 생략한다', () => {
            expect(propsOf(prop('disabled', { typeMembers: [other('boolean')] }))[0]).toEqual({
                name: 'disabled',
                type: ['boolean'],
                detailedType: 'boolean',
                required: false,
            });
        });

        it('컴포넌트 필드를 name, description, props 순으로 쓴다', () => {
            const [doc] = policy([component([], { name: 'Dialog', description: '대화상자' })]);

            expect(doc).toEqual({ name: 'Dialog', description: '대화상자', props: [] });
            expect(Object.keys(doc)).toEqual(['name', 'description', 'props']);
        });

        it('컴포넌트 설명이 없으면 description을 생략한다', () => {
            expect(policy([component([], { name: 'Box' })])).toEqual([{ name: 'Box', props: [] }]);
        });

        it('컴포넌트를 입력 순서대로 하나씩 돌려준다', () => {
            expect(
                policy([component([], { name: 'Button' }), component([], { name: 'Input' })]).map(
                    (doc) => doc.name,
                ),
            ).toEqual(['Button', 'Input']);
        });

        it('빈 입력에는 빈 배열을 돌려준다', () => {
            expect(policy([])).toEqual([]);
        });

        it('입력의 prop 순서를 바꾸지 않는다', () => {
            const input = component([prop('zIndex'), prop('className')]);

            policy([input]);

            expect(input.props.map((p) => p.name)).toEqual(['zIndex', 'className']);
        });
    });
});
