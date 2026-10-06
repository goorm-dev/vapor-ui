/**
 * extract() tests
 *
 * extract() is the package's seam: give it a directory and a tsconfig, get back
 * the documentation README "Extraction Policy" describes. Every test writes a
 * small source tree to a temp directory and asserts on the returned docs.
 */
import { ExtractorError } from '#errors';
import { type ExtractOptions, extract } from '#extract';
import type { Reporter } from '#reporter';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const TSCONFIG = JSON.stringify({
    compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        strict: true,
        skipLibCheck: true,
    },
    include: ['**/*.ts', '**/*.tsx'],
});

const roots: string[] = [];

/** Writes `files` (relative path → content) next to a tsconfig.json and returns the root. */
function createFixture(files: Record<string, string>): string {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-extractor-extract-'));
    roots.push(root);

    fs.writeFileSync(path.join(root, 'tsconfig.json'), TSCONFIG);
    for (const [file, content] of Object.entries(files)) {
        const filePath = path.join(root, file);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
    }

    return root;
}

function run(root: string, options: Partial<ExtractOptions> = {}) {
    return extract({ inputPath: root, tsconfigPath: path.join(root, 'tsconfig.json'), ...options })
        .docs;
}

/** Extracts a fixture expected to hold exactly one component and returns its doc. */
function extractOne(files: Record<string, string>) {
    const docs = run(createFixture(files));
    expect(docs).toHaveLength(1);
    return docs[0];
}

function propOf(doc: ReturnType<typeof extractOne>, name: string) {
    return doc.props.find((prop) => prop.name === name);
}

function createRecordingReporter(): Reporter & { warnings: string[] } {
    const warnings: string[] = [];

    return {
        warnings,
        info: () => {},
        debug: () => {},
        warn: (message) => {
            warnings.push(message);
        },
    };
}

afterEach(() => {
    for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

const BADGE_SOURCE = `
export namespace BadgeRoot {
    export type Props = {
        /** 뱃지 라벨 */
        label: string;
        /** 뱃지 크기 */
        size?: 'sm' | 'md' | 'lg';
        /** 스크린리더 레이블 */
        'aria-label'?: string;
    };
}

/** 상태를 표시하는 뱃지. */
export const BadgeRoot = ({ size = 'md', ...props }: BadgeRoot.Props) => ({ size, ...props });
`;

describe('extract', () => {
    it('설명·기본값·필수 여부를 끝까지 전달한다', () => {
        expect(run(createFixture({ 'badge.tsx': BADGE_SOURCE }))).toEqual([
            {
                name: 'BadgeRoot',
                description: '상태를 표시하는 뱃지.',
                props: [
                    {
                        name: 'label',
                        type: ['string'],
                        detailedType: 'string',
                        required: true,
                        description: '뱃지 라벨',
                    },
                    {
                        name: 'size',
                        type: ['sm', 'md', 'lg'],
                        detailedType: '"sm" | "md" | "lg" | undefined',
                        required: false,
                        description: '뱃지 크기',
                        defaultValue: 'md',
                    },
                ],
            },
        ]);
    });

    it('아무것도 쓰지 않는다', () => {
        const root = createFixture({ 'badge.tsx': BADGE_SOURCE });

        run(root);

        expect(fs.readdirSync(root).sort()).toEqual(['badge.tsx', 'tsconfig.json']);
    });
});

describe('컴포넌트 인식', () => {
    it('export된 Props가 있는 export된 namespace만 컴포넌트가 된다', () => {
        const docs = run(
            createFixture({
                'button.tsx': `
                    export namespace Button {
                        export type Props = { label?: string };
                    }
                    namespace Internal {
                        export type Props = { label?: string };
                    }
                    export namespace StateOnly {
                        export type State = { open: boolean };
                    }
                    export namespace PrivateProps {
                        type Props = { label?: string };
                    }
                    declare module 'external' {
                        export type Props = { label?: string };
                    }
                    export const Button = (props: Button.Props) => props;
                `,
            }),
        );

        expect(docs.map((doc) => doc.name)).toEqual(['Button']);
    });

    it('Props를 interface로 선언한 컴포넌트도 추출한다', () => {
        const doc = extractOne({
            'sheet.tsx': `
                export namespace SheetRoot {
                    export interface Props {
                        /** 열림 여부 */
                        open?: boolean;
                    }
                }

                /** 화면 가장자리에서 열리는 패널. */
                export const SheetRoot = (props: SheetRoot.Props) => props;
            `,
        });

        expect(doc).toEqual({
            name: 'SheetRoot',
            description: '화면 가장자리에서 열리는 패널.',
            props: [
                {
                    name: 'open',
                    type: ['boolean'],
                    detailedType: 'boolean | undefined',
                    required: false,
                    description: '열림 여부',
                },
            ],
        });
    });

    it('한 파일의 namespace마다 문서를 하나씩 만든다', () => {
        const docs = run(
            createFixture({
                'avatar.tsx': `
                    export namespace AvatarRoot {
                        export type Props = { size?: 'sm' | 'md' };
                    }
                    export namespace AvatarImage {
                        export type Props = { src?: string };
                    }
                `,
            }),
        );

        expect(docs.map((doc) => doc.name)).toEqual(['AvatarRoot', 'AvatarImage']);
    });

    it('.stories.tsx·.test.tsx·.ts 파일은 읽지 않는다', () => {
        const ns = (name: string) =>
            `export namespace ${name} { export type Props = { a?: string }; }`;
        const docs = run(
            createFixture({
                'button/button.tsx': ns('Button'),
                'button/button.stories.tsx': ns('ButtonStory'),
                'button/button.test.tsx': ns('ButtonTest'),
                'button/types.ts': ns('ButtonTypes'),
            }),
        );

        expect(docs.map((doc) => doc.name)).toEqual(['Button']);
    });

    /**
     * glob resolves directories concurrently, so the raw order varies between runs.
     * That order decides how TypeScript prints shared literal unions, which made the
     * extracted JSON churn — files have to be read in a stable order.
     */
    it('파일 경로 순서대로 문서를 돌려준다', () => {
        const ns = (name: string) =>
            `export namespace ${name} { export type Props = { a?: string }; }`;
        const docs = run(
            createFixture({
                'zebra/zebra.tsx': ns('Zebra'),
                'alpha/alpha.tsx': ns('Alpha'),
                'mango/mango.tsx': ns('Mango'),
            }),
        );

        expect(docs.map((doc) => doc.name)).toEqual(['Alpha', 'Mango', 'Zebra']);
    });

    describe('component 옵션', () => {
        const ns = (name: string) =>
            `export namespace ${name} { export type Props = { a?: string }; }`;
        const files = {
            'button/button.tsx': ns('Button'),
            'button/button-group.tsx': ns('ButtonGroup'),
            'collapsible/collapsible-root.tsx': ns('CollapsibleRoot'),
        };

        it.each([
            ['button', 'Button'],
            ['Button', 'Button'],
            ['ButtonGroup', 'ButtonGroup'],
            ['button-group', 'ButtonGroup'],
            ['CollapsibleRoot', 'CollapsibleRoot'],
        ])('%s → %s 파일만 읽는다 (대소문자·하이픈 무시)', (component, expected) => {
            const docs = run(createFixture(files), { component });

            expect(docs.map((doc) => doc.name)).toEqual([expected]);
        });

        it('없는 이름이면 사용 가능한 파일 이름과 함께 ExtractorError를 던진다', () => {
            const root = createFixture(files);

            expect(() => run(root, { component: 'NotFound' })).toThrow(
                new ExtractorError(
                    "Component 'NotFound' not found.\nAvailable: button-group, button, collapsible-root",
                ),
            );
        });
    });

    it('inputPath가 없으면 ExtractorError를 던진다', () => {
        const root = createFixture({ 'badge.tsx': BADGE_SOURCE });
        const missing = path.join(root, 'missing');

        expect(() => run(root, { inputPath: missing })).toThrow(
            new ExtractorError(`Path does not exist: ${missing}`),
        );
    });

    it('.tsx 파일이 없으면 ExtractorError를 던진다', () => {
        const root = createFixture({ 'types.ts': 'export type A = string;' });

        expect(() => run(root)).toThrow(
            new ExtractorError('No .tsx files found in the specified path'),
        );
    });
});

describe('설명', () => {
    it('export const에 붙은 마지막 JSDoc을 컴포넌트 설명으로 쓴다', () => {
        const doc = extractOne({
            'multi.tsx': `
                export namespace Multi {
                    export type Props = { a?: string };
                }
                /**
                 * 첫 번째 주석
                 */
                /**
                 * 두 번째 주석 (사용됨)
                 */
                export const Multi = (props: Multi.Props) => props;
            `,
        });

        expect(doc.description).toBe('두 번째 주석 (사용됨)');
    });

    it('여러 줄 JSDoc은 줄바꿈을 그대로 둔다', () => {
        const doc = extractOne({
            'input.tsx': `
                export namespace Input {
                    export type Props = {
                        /**
                         * 클릭 이벤트 핸들러
                         * 버튼 클릭 시 호출됩니다
                         */
                        onClick?: () => void;
                    };
                }
                /**
                 * 입력 필드 컴포넌트
                 *
                 * 다양한 타입의 입력을 지원합니다.
                 */
                export const Input = (props: Input.Props) => props;
            `,
        });

        expect(doc.description).toBe('입력 필드 컴포넌트\n\n다양한 타입의 입력을 지원합니다.');
        expect(propOf(doc, 'onClick')?.description).toBe(
            '클릭 이벤트 핸들러\n버튼 클릭 시 호출됩니다',
        );
    });

    it('JSDoc 태그는 버리고 설명 문장만 남긴다', () => {
        const doc = extractOne({
            'button.tsx': `
                export namespace Button {
                    export type Props = {
                        /**
                         * 버튼 크기
                         * @default 'lg'
                         */
                        size?: 'sm' | 'lg';
                    };
                }
                /**
                 * 기본 버튼 컴포넌트
                 * @deprecated Use Action instead.
                 */
                export const Button = (props: Button.Props) => props;
            `,
        });

        expect(doc.description).toBe('기본 버튼 컴포넌트');
        expect(propOf(doc, 'size')).toEqual({
            name: 'size',
            type: ['sm', 'lg'],
            detailedType: '"sm" | "lg" | undefined',
            required: false,
            description: '버튼 크기',
        });
    });

    it('비어 있거나 없는 JSDoc은 설명 필드를 만들지 않는다', () => {
        const doc = extractOne({
            'empty.tsx': `
                export namespace Empty {
                    export type Props = {
                        /** */
                        value?: string;
                        other?: string;
                    };
                }
                /**
                 */
                export const Empty = (props: Empty.Props) => props;
            `,
        });

        expect(doc).toEqual({
            name: 'Empty',
            props: [
                {
                    name: 'value',
                    type: ['string'],
                    detailedType: 'string | undefined',
                    required: false,
                },
                {
                    name: 'other',
                    type: ['string'],
                    detailedType: 'string | undefined',
                    required: false,
                },
            ],
        });
    });

    describe('여러 곳에 선언된 prop', () => {
        it('JSDoc을 이어붙이지 않고 하나만 쓴다', () => {
            const doc = extractOne({
                'merged.tsx': `
                    interface Base {
                        /** Style applied to the element, based on the component's state. */
                        style?: string;
                    }
                    interface Own {
                        /** Style applied to the element, based on the component’s state. */
                        style?: string;
                    }
                    export namespace Merged {
                        export type Props = Base & Own;
                    }
                `,
            });

            expect(propOf(doc, 'style')?.description).toBe(
                "Style applied to the element, based on the component's state.",
            );
        });

        it('Base UI 선언보다 vapor-ui 선언의 설명을 쓴다', () => {
            const doc = extractOne({
                'node_modules/@base-ui/react/types.d.ts': `
                    export interface Upstream {
                        /** Upstream wording. */
                        style?: string;
                    }
                `,
                'merged.tsx': `
                    import type { Upstream } from '@base-ui/react/types';
                    interface Own {
                        /** Vapor wording. */
                        style?: string;
                    }
                    export namespace Merged {
                        export type Props = Upstream & Own;
                    }
                `,
            });

            expect(propOf(doc, 'style')?.description).toBe('Vapor wording.');
        });

        it('설명이 없는 선언은 건너뛴다', () => {
            const doc = extractOne({
                'merged.tsx': `
                    interface NoDoc {
                        style?: string;
                    }
                    interface Documented {
                        /** The only wording. */
                        style?: string;
                    }
                    export namespace Merged {
                        export type Props = NoDoc & Documented;
                    }
                `,
            });

            expect(propOf(doc, 'style')?.description).toBe('The only wording.');
        });
    });
});

describe('기본값', () => {
    it('구조분해 기본값을 소스에 적힌 값으로 옮긴다', () => {
        const doc = extractOne({
            'slider.tsx': `
                export namespace Slider {
                    export type Props = {
                        size?: string;
                        type?: string;
                        max?: number;
                        disabled?: boolean;
                    };
                }
                export const Slider = ({ size = 'md', type = "text", max = 100, disabled = false }: Slider.Props) => null;
            `,
        });

        expect(doc.props.map((prop) => [prop.name, prop.defaultValue])).toEqual([
            ['disabled', 'false'],
            ['max', '100'],
            ['size', 'md'],
            ['type', 'text'],
        ]);
    });

    it('함수 본문에서 props를 구조분해한 기본값도 읽고, 처음 나온 값을 쓴다', () => {
        const doc = extractOne({
            'widget.tsx': `
                export namespace Widget {
                    export type Props = { size?: string };
                }
                export const Widget = (props: Widget.Props) => {
                    const { size = 'sm' } = props;
                    {
                        const { size = 'lg' } = props;
                    }
                    return size;
                };
            `,
        });

        expect(propOf(doc, 'size')?.defaultValue).toBe('sm');
    });

    const RECIPE_CSS = `
        declare function recipe(config: unknown): (variants?: unknown) => string;
        declare function componentRecipe(config: unknown): (variants?: unknown) => string;
        declare function style(config: unknown): (variants?: unknown) => string;

        export const root = recipe({
            variants: { size: { sm: {}, md: {} }, mode: { light: {}, dark: {} } },
            defaultVariants: { size: 'md', mode: "dark" },
        });
        export const badge = componentRecipe({
            defaultVariants: { shape: 'pill' },
        });
        export const plain = style({
            defaultVariants: { size: 'sm' },
        });
    `;

    it('styles.<recipe>(…)로 호출한 recipe()·componentRecipe()의 defaultVariants를 읽는다', () => {
        const docs = run(
            createFixture({
                'button.css.ts': RECIPE_CSS,
                'button.tsx': `
                    import * as styles from './button.css';

                    export namespace Button {
                        export type Props = { size?: string; mode?: string };
                    }
                    export const Button = (props: Button.Props) => styles.root(props);

                    export namespace Badge {
                        export type Props = { shape?: string };
                    }
                    export const Badge = (props: Badge.Props) => styles.badge(props);
                `,
            }),
        );

        expect(docs.map((doc) => doc.props.map((prop) => [prop.name, prop.defaultValue]))).toEqual([
            [
                ['mode', 'dark'],
                ['size', 'md'],
            ],
            [['shape', 'pill']],
        ]);
    });

    it('구조분해 기본값이 recipe 기본값보다 앞선다', () => {
        const doc = extractOne({
            'button.css.ts': RECIPE_CSS,
            'button.tsx': `
                import * as styles from './button.css';

                export namespace Button {
                    export type Props = { size?: string };
                }
                export const Button = ({ size = 'sm' }: Button.Props) => styles.root({ size });
            `,
        });

        expect(propOf(doc, 'size')?.defaultValue).toBe('sm');
    });

    it('recipe가 아닌 호출이나 named import로 부른 recipe는 읽지 않는다', () => {
        const docs = run(
            createFixture({
                'button.css.ts': RECIPE_CSS,
                'button.tsx': `
                    import * as styles from './button.css';
                    import { root } from './button.css';

                    export namespace Plain {
                        export type Props = { size?: string };
                    }
                    export const Plain = (props: Plain.Props) => styles.plain(props);

                    export namespace Named {
                        export type Props = { size?: string };
                    }
                    export const Named = (props: Named.Props) => root(props);
                `,
            }),
        );

        expect(docs.map((doc) => propOf(doc, 'size'))).toEqual([
            { name: 'size', type: ['string'], detailedType: 'string | undefined', required: false },
            { name: 'size', type: ['string'], detailedType: 'string | undefined', required: false },
        ]);
    });

    it('context로 넘겨받는 기본값은 추출하지 않는다', () => {
        const docs = run(
            createFixture({
                'tabs.css.ts': `
                    declare function recipe(config: unknown): (variants?: unknown) => string;
                    export const list = recipe({ defaultVariants: { size: 'md' } });
                `,
                'tabs.tsx': `
                    import * as styles from './tabs.css';

                    declare const SizeContext: { Provider: (props: { value?: string }) => null };
                    declare function useSize(): string | undefined;

                    export namespace TabsRoot {
                        export type Props = { size?: 'sm' | 'md' };
                    }
                    export const TabsRoot = ({ size }: TabsRoot.Props) => SizeContext.Provider({ value: size });

                    export namespace TabsList {
                        export type Props = { label?: string };
                    }
                    export const TabsList = (props: TabsList.Props) => styles.list({ size: useSize(), ...props });
                `,
            }),
        );

        expect(propOf(docs[0], 'size')).toEqual({
            name: 'size',
            type: ['sm', 'md'],
            detailedType: '"sm" | "md" | undefined',
            required: false,
        });
    });

    it('JSDoc의 @default는 기본값으로 읽지 않는다', () => {
        const doc = extractOne({
            'button.tsx': `
                export namespace Button {
                    export type Props = {
                        /**
                         * 버튼 크기
                         * @default 'lg'
                         */
                        size?: string;
                    };
                }
            `,
        });

        expect(propOf(doc, 'size')?.defaultValue).toBeUndefined();
    });
});

const REACT_TYPES = `
    declare namespace React {
        interface ReactElement {
            type: unknown;
        }
        interface RefObject<T> {
            current: T;
        }
        type ReactNode = ReactElement | string | number | boolean | null | undefined;
        type RefCallback<T> = (instance: T | null) => void;
        type Ref<T> = RefCallback<T> | RefObject<T | null> | null;
    }
    export = React;
`;

describe('타입 출력', () => {
    function typesOf(doc: ReturnType<typeof extractOne>) {
        return Object.fromEntries(
            doc.props.map((prop) => [prop.name, [prop.type, prop.detailedType]]),
        );
    }

    it('prop 타입을 TypeScript 표기대로 출력한다', () => {
        const doc = extractOne({
            'field.tsx': `
                export namespace Field {
                    export type Props = {
                        a?: boolean;
                        b?: number;
                        c?: 42;
                        d?: 'primary' | 'secondary';
                        e?: (value: string) => void;
                        f: (a: string, b: number) => boolean;
                        g?: null;
                        h: string | ((state: { open: boolean }) => string);
                    };
                }
            `,
        });

        expect(typesOf(doc)).toEqual({
            a: [['boolean'], 'boolean | undefined'],
            b: [['number'], 'number | undefined'],
            c: [['42'], '42 | undefined'],
            d: [['primary', 'secondary'], '"primary" | "secondary" | undefined'],
            e: [['function'], '((value: string) => void) | undefined'],
            f: [['function'], '(a: string, b: number) => boolean'],
            g: [['null'], 'null | undefined'],
            h: [['string', 'function'], 'string | ((state: { open: boolean; }) => string)'],
        });
    });

    it('boolean은 union 안에서도 true·false로 나누지 않는다', () => {
        const doc = extractOne({
            'popup.tsx': `
                export namespace Popup {
                    export type Props = { focus?: boolean | HTMLElement | (() => boolean) };
                }
            `,
        });

        expect(typesOf(doc)).toEqual({
            focus: [
                ['boolean', 'HTMLElement', 'function'],
                'boolean | HTMLElement | (() => boolean) | undefined',
            ],
        });
    });

    it('리터럴로만 된 이름 붙은 union은 필수·선택 prop 모두 값으로 펼친다', () => {
        const doc = extractOne({
            'button.tsx': `
                type Size = 'sm' | 'md';

                export namespace Button {
                    export type Props = { required: Size; optional?: Size };
                }
            `,
        });

        expect(typesOf(doc)).toEqual({
            required: [['sm', 'md'], '"sm" | "md"'],
            optional: [['sm', 'md'], '"sm" | "md" | undefined'],
        });
    });

    it('리터럴이 아닌 멤버가 있는 이름 붙은 union은 이름으로 쓴다', () => {
        const doc = extractOne({
            'popup.tsx': `
                type Padding = number | { top?: number };

                export namespace Popup {
                    export type Props = { collisionPadding?: Padding };
                }
            `,
        });

        expect(typesOf(doc)).toEqual({ collisionPadding: [['Padding'], 'Padding | undefined'] });
    });

    it('ReactNode·Ref 같은 React alias는 풀지 않는다', () => {
        const doc = extractOne({
            'node_modules/@types/react/index.d.ts': REACT_TYPES,
            'box.tsx': `
                import type * as React from 'react';

                export namespace Box {
                    export type Props = {
                        children?: React.ReactNode | ((open: boolean) => React.ReactNode);
                        innerRef?: React.Ref<HTMLDivElement>;
                    };
                }
            `,
        });

        expect(typesOf(doc)).toEqual({
            children: [['ReactNode', 'function'], 'ReactNode | ((open: boolean) => ReactNode)'],
            innerRef: [['React.Ref<HTMLDivElement>'], 'React.Ref<HTMLDivElement> | undefined'],
        });
    });

    it('Base UI 타입을 공개 vapor-ui 이름으로 출력한다', () => {
        const docs = run(
            createFixture({
                'collapsible/@base-ui/CollapsibleRoot.d.ts': `
                    export namespace Root {
                        export interface State {
                            open: boolean;
                        }
                        export interface ChangeEventDetails {
                            source: 'keyboard' | 'pointer';
                        }
                    }
                `,
                'collapsible/index.ts': `export * as Collapsible from './index.parts';`,
                'collapsible/index.parts.ts': `export { CollapsibleRoot as Root } from './collapsible';`,
                'collapsible/collapsible.tsx': `
                    import type * as BaseCollapsible from './@base-ui/CollapsibleRoot';

                    export namespace CollapsibleRoot {
                        export type Props = {
                            state: BaseCollapsible.Root.State;
                            onOpenChange?: (details: BaseCollapsible.Root.ChangeEventDetails) => void;
                        };
                        export type State = BaseCollapsible.Root.State;
                        export type ChangeEventDetails = BaseCollapsible.Root.ChangeEventDetails;
                    }
                `,
            }),
        );

        expect(typesOf(docs[0])).toEqual({
            state: [['Collapsible.Root.State'], 'Collapsible.Root.State'],
            onOpenChange: [
                ['function'],
                '((details: Collapsible.Root.ChangeEventDetails) => void) | undefined',
            ],
        });
    });

    it('prop이 이름으로 쓰는 Base UI 타입의 정의를 typeRefs에 담는다', () => {
        const docs = run(
            createFixture({
                'collapsible/@base-ui/CollapsibleRoot.d.ts': `
                    type Status = 'starting' | 'ending' | undefined;
                    type Detail<R extends string> = { reason: R; cancel: () => void };
                    export namespace Root {
                        export interface State {
                            open: boolean;
                            status: Status;
                            label?: string;
                        }
                        export type ChangeEventDetails = Detail<'trigger-press'> | Detail<'none'>;
                    }
                `,
                'collapsible/index.ts': `export * as Collapsible from './index.parts';`,
                'collapsible/index.parts.ts': `export { CollapsibleRoot as Root } from './collapsible';`,
                'collapsible/collapsible.tsx': `
                    import type * as BaseCollapsible from './@base-ui/CollapsibleRoot';

                    export namespace CollapsibleRoot {
                        export type State = BaseCollapsible.Root.State;
                        export type ChangeEventDetails = BaseCollapsible.Root.ChangeEventDetails;
                        export type Props = {
                            className?: (state: State) => string;
                            onOpenChange?: (details: ChangeEventDetails) => void;
                        };
                    }
                `,
            }),
        );

        expect(docs[0].typeRefs).toEqual({
            'Collapsible.Root.State': [
                '{',
                '  open: boolean;',
                '  status: "starting" | "ending" | undefined;',
                '  label?: string;',
                '}',
            ].join('\n'),
            'Collapsible.Root.ChangeEventDetails': [
                '{',
                '  reason: "trigger-press";',
                '  cancel: () => void;',
                '} | {',
                '  reason: "none";',
                '  cancel: () => void;',
                '}',
            ].join('\n'),
        });
    });

    it('Base UI 타입 이름을 쓰지 않는 컴포넌트는 typeRefs가 없다', () => {
        const doc = extractOne({ 'badge.tsx': BADGE_SOURCE });

        expect(doc).not.toHaveProperty('typeRefs');
    });

    describe('여러 namespace가 같은 Base UI 타입을 가리킬 때', () => {
        const BASE_COLLAPSIBLE = `
            export namespace Root {
                export interface State {
                    open: boolean;
                }
            }
            export namespace Trigger {
                export interface State {
                    open: boolean;
                }
            }
        `;

        it('prop이 속한 namespace의 이름으로 출력한다', () => {
            const docs = run(
                createFixture({
                    'collapsible/@base-ui/Collapsible.d.ts': BASE_COLLAPSIBLE,
                    'collapsible/index.ts': `export * as Collapsible from './index.parts';`,
                    'collapsible/index.parts.ts': `export { CollapsibleRoot as Root, CollapsibleTrigger as Trigger } from './collapsible';`,
                    'collapsible/collapsible.tsx': `
                        import type * as BaseCollapsible from './@base-ui/Collapsible';

                        export namespace CollapsibleRoot {
                            export type State = BaseCollapsible.Root.State;
                            export type Props = { state: State };
                        }

                        export namespace CollapsibleTrigger {
                            export type State = BaseCollapsible.Root.State;
                            export type Props = { state: State };
                        }
                    `,
                }),
            );

            expect(docs.map((doc) => [doc.name, propOf(doc, 'state')?.detailedType])).toEqual([
                ['CollapsibleRoot', 'Collapsible.Root.State'],
                ['CollapsibleTrigger', 'Collapsible.Trigger.State'],
            ]);
        });

        it('공개 이름이 없는 Base UI 타입은 경고한다', () => {
            const reporter = createRecordingReporter();
            const root = createFixture({
                'collapsible/@base-ui/Collapsible.d.ts': BASE_COLLAPSIBLE,
                'collapsible/index.ts': `export * as Collapsible from './index.parts';`,
                'collapsible/index.parts.ts': `export { CollapsibleTrigger as Trigger } from './collapsible';`,
                'collapsible/collapsible.tsx': `
                    import type * as BaseCollapsible from './@base-ui/Collapsible';

                    export namespace CollapsibleTrigger {
                        export type State = BaseCollapsible.Root.State;
                        export type Props = { state: BaseCollapsible.Trigger.State };
                    }
                `,
            });

            run(root, { reporter });

            expect(reporter.warnings).toContainEqual(
                expect.stringContaining('No public vapor-ui name for a Base UI type'),
            );
        });
    });

    describe('조건부 타입으로 이름을 잃은 Base UI 타입', () => {
        // Base UI writes event details as `R extends string ? Detail<R> & {} : never`.
        // TypeScript evaluates it into an anonymous object, so the name is gone from the type.
        const BASE_RADIO_GROUP = `
            type Detail<R extends string, C extends object> = { reason: R; cancel: () => void } & C;
            type EventDetails<R extends string, C extends object = {}> = R extends string
                ? Detail<R, C> & {}
                : never;

            export namespace RadioGroup {
                export type ChangeEventDetails = EventDetails<'none'>;
                export type Props = {
                    onValueChange?: (value: string, eventDetails: ChangeEventDetails) => void;
                };
            }
        `;

        it('공개 vapor-ui 이름으로 출력하고, prop이 속한 namespace의 이름을 먼저 쓴다', () => {
            const docs = run(
                createFixture({
                    'segmented/@base-ui/RadioGroup.d.ts': BASE_RADIO_GROUP,
                    'segmented/index.ts': `export * as Segmented from './index.parts';`,
                    'segmented/index.parts.ts': `export { SegmentedRootPrimitive as RootPrimitive, SegmentedRoot as Root } from './segmented';`,
                    'segmented/segmented.tsx': `
                        import type { RadioGroup } from './@base-ui/RadioGroup';

                        export namespace SegmentedRootPrimitive {
                            export type Props = RadioGroup.Props;
                            export type ChangeEventDetails = RadioGroup.ChangeEventDetails;
                        }

                        export namespace SegmentedRoot {
                            export type Props = {
                                onValueChange?: (value: string, eventDetails: SegmentedRoot.ChangeEventDetails) => void;
                            };
                            export type ChangeEventDetails = SegmentedRootPrimitive.ChangeEventDetails;
                        }
                    `,
                }),
            );

            expect(
                docs.map((doc) => [doc.name, propOf(doc, 'onValueChange')?.detailedType]),
            ).toEqual([
                [
                    'SegmentedRootPrimitive',
                    '((value: string, eventDetails: Segmented.RootPrimitive.ChangeEventDetails) => void) | undefined',
                ],
                [
                    'SegmentedRoot',
                    '((value: string, eventDetails: Segmented.Root.ChangeEventDetails) => void) | undefined',
                ],
            ]);
        });

        it('공개 이름이 없으면 구조를 펼쳐 출력하고 경고한다', () => {
            const reporter = createRecordingReporter();
            const root = createFixture({
                'radio/@base-ui/RadioGroup.d.ts': BASE_RADIO_GROUP,
                'radio/radio.tsx': `
                    import type { RadioGroup } from './@base-ui/RadioGroup';

                    export namespace Radio {
                        /** 라디오 그룹 */
                        export type Props = RadioGroup.Props;
                    }
                `,
            });

            const [doc] = run(root, { reporter });

            expect(propOf(doc, 'onValueChange')?.detailedType).toBe(
                '((value: string, eventDetails: { reason: "none"; cancel: () => void; }) => void) | undefined',
            );
            expect(reporter.warnings).toContainEqual(
                expect.stringContaining('No public vapor-ui name for a Base UI type'),
            );
        });
    });

    it('익명 타입은 다른 익명 Base UI 타입의 이름으로 출력하지 않는다', () => {
        const docs = run(
            createFixture({
                'form/@base-ui/FormRoot.d.ts': `
                    export namespace Root {
                        export type SubmitEventDetails = { reason: string };
                    }
                `,
                'form/index.ts': `export * as Form from './index.parts';`,
                'form/index.parts.ts': `export { FormRoot as Root } from './form';`,
                'form/form.tsx': `
                    import type * as BaseForm from './@base-ui/FormRoot';

                    export namespace FormRoot {
                        export type Props = { errors?: { field: string } };
                        export type SubmitEventDetails = BaseForm.Root.SubmitEventDetails;
                    }
                `,
            }),
        );

        expect(propOf(docs[0], 'errors')?.type).toEqual(['{ field: string; }']);
    });

    it('import("…") 경로 없이 타입 이름만 쓴다', () => {
        const doc = extractOne({
            'types.ts': `export interface Value { id: string }`,
            'picker.tsx': `
                export namespace Picker {
                    export type Props = { value?: import('./types').Value };
                }
            `,
        });

        expect(propOf(doc, 'value')?.type).toEqual(['Value']);
    });
});

describe('prop 출처', () => {
    it('React·DOM·외부 패키지에서 온 prop은 빼고 className·style은 남긴다', () => {
        const doc = extractOne({
            'node_modules/@types/react/index.d.ts': `
                export interface HTMLAttributes {
                    className?: string;
                    style?: object;
                    onClick?: () => void;
                }
            `,
            'node_modules/some-lib/index.d.ts': `
                export interface ExternalProps {
                    tracking?: string;
                }
            `,
            'box.tsx': `
                import type { HTMLAttributes } from 'react';
                import type { ExternalProps } from 'some-lib';

                export namespace Box {
                    export type Props = HTMLAttributes &
                        ExternalProps &
                        Pick<HTMLElement, 'hidden'> & { label: string };
                }
            `,
        });

        expect(doc.props.map((prop) => prop.name)).toEqual(['label', 'className', 'style']);
    });

    it('data-·aria- prop은 뺀다', () => {
        const names = run(createFixture({ 'badge.tsx': BADGE_SOURCE }))[0].props.map(
            (prop) => prop.name,
        );

        expect(names).not.toContain('aria-label');
    });

    it('sprinkles 모듈의 prop은 빼고 .css.ts의 variant prop은 남긴다', () => {
        const doc = extractOne({
            'styles/sprinkles.css.ts': `export type Sprinkles = { customSpace?: string };`,
            'button.css.ts': `export type ButtonVariants = { size?: 'sm' | 'md' };`,
            'button.tsx': `
                import type { ButtonVariants } from './button.css';
                import type { Sprinkles } from './styles/sprinkles.css';

                export namespace Button {
                    export type Props = Sprinkles & ButtonVariants & { label: string };
                }
            `,
        });

        expect(doc.props.map((prop) => prop.name)).toEqual(['label', 'size']);
    });

    it('Base UI prop은 남기고 직접 선언한 prop 뒤에 둔다', () => {
        const doc = extractOne({
            'node_modules/@base-ui/react/button.d.ts': `
                export interface BaseButtonProps {
                    disabled?: boolean;
                    focusableWhenDisabled?: boolean;
                }
            `,
            'button.tsx': `
                import type { BaseButtonProps } from '@base-ui/react/button';

                export namespace Button {
                    export type Props = BaseButtonProps & { loading?: boolean };
                }
            `,
        });

        expect(doc.props.map((prop) => prop.name)).toEqual([
            'loading',
            'disabled',
            'focusableWhenDisabled',
        ]);
    });
});

describe('경고', () => {
    it('JSDoc이 없는 컴포넌트와 prop을 경고 하나로 모아 알린다', () => {
        const reporter = createRecordingReporter();
        const root = createFixture({
            'chip.tsx': `
                export namespace Chip {
                    export type Props = {
                        /** 칩 라벨 */
                        label: string;
                        size?: 'sm' | 'md';
                    };
                }

                export const Chip = (props: Chip.Props) => props;
            `,
        });

        run(root, { reporter });

        expect(reporter.warnings).toEqual(['Missing JSDoc on 2 items:\n  - Chip\n  - Chip.size']);
    });

    it('JSDoc이 모두 있으면 경고하지 않는다', () => {
        const reporter = createRecordingReporter();

        run(createFixture({ 'badge.tsx': BADGE_SOURCE }), { reporter });

        expect(reporter.warnings).toEqual([]);
    });
});

describe('파싱 실패', () => {
    it('읽을 수 없는 파일은 failures로 돌려주고 나머지는 계속 추출한다', () => {
        const reporter = createRecordingReporter();
        const root = createFixture({ 'badge.tsx': BADGE_SOURCE });
        fs.symlinkSync(path.join(root, 'missing.tsx'), path.join(root, 'broken.tsx'));

        const result = extract({
            inputPath: root,
            tsconfigPath: path.join(root, 'tsconfig.json'),
            reporter,
        });

        expect(result.failures).toEqual(['broken']);
        expect(result.docs.map((doc) => doc.name)).toEqual(['BadgeRoot']);
        expect(reporter.warnings).toHaveLength(1);
        expect(reporter.warnings[0]).toMatch(/^Failed to extract props for broken: /);
    });

    it('모두 읽히면 failures는 비어 있다', () => {
        const root = createFixture({ 'badge.tsx': BADGE_SOURCE });

        const result = extract({ inputPath: root, tsconfigPath: path.join(root, 'tsconfig.json') });

        expect(result.failures).toEqual([]);
    });
});
