/**
 * Component Metadata
 *
 * PRD 10: component.metadata.ts
 * Vapor-UI 컴포넌트별 변환 규칙 정의
 *
 * ✅ TypeScript로 작성하여:
 * - 타입 안전성 (컴파일 타임 검증)
 * - IDE 지원 (자동완성, 오류 표시)
 * - 주석으로 문서화
 * - 함수형 로직 (ValueTransformFn, TargetMatcherFn, PropGeneratorFn)
 * - 복잡한 변환 로직 구현
 */
import type { ComponentMetadata } from './types';

/**
 * Metadata Export
 *
 * PRD 9: 직접 import 방식
 * 이 객체를 직접 import하여 사용
 *
 * @example
 * import { metadata } from './infrastructure/metadata/component.metadata';
 */
export const metadata: ComponentMetadata = {
    version: '1.0.0',
    components: {
        /**
         * Button Component
         *
         * 예외 규칙 없음 - 모든 Figma variants가 자동으로 props로 변환됨
         * (Convention over Configuration)
         */
        Button: {
            name: 'Button',
            vaporComponentName: 'Button',
        },

        /**
         * Dialog Component
         *
         * Dialog.Root로 변환되며, Dialog.Trigger를 자동 주입
         * PRD 10.1 예시 참고
         */
        Dialog: {
            name: 'Dialog',
            vaporComponentName: 'Dialog.Root',
            augmentations: [
                {
                    name: 'inject-trigger',
                    type: 'functional-component',
                    target: 'Dialog',
                    functionalComponent: {
                        type: 'Trigger',
                        position: 'first-child',
                        componentName: 'Dialog.Trigger',
                    },
                },
            ],
            subComponents: {
                Content: {
                    name: 'Content',
                    vaporComponentName: 'Dialog.Popup',
                },
                Header: {
                    name: 'Header',
                    vaporComponentName: 'Dialog.Header',
                },
                Body: {
                    name: 'Body',
                    vaporComponentName: 'Dialog.Body',
                    augmentations: [
                        {
                            name: 'inject-close',
                            type: 'functional-component',
                            target: 'Dialog.Header',
                            functionalComponent: {
                                type: 'Close',
                                position: 'last-child',
                                componentName: 'Dialog.Close',
                            },
                        },
                    ],
                },
                Footer: {
                    name: 'Footer',
                    vaporComponentName: 'Dialog.Footer',
                },
                Overlay: {
                    name: 'Overlay',
                    vaporComponentName: 'Dialog.Overlay',
                },
                Title: {
                    name: 'Title',
                    vaporComponentName: 'Dialog.Title',
                },
                Description: {
                    name: 'Description',
                    vaporComponentName: 'Dialog.Description',
                },
            },
        },

        /**
         * Tabs Component
         *
         * ✅ 함수형 augmentation 예시 (PRD 10.3)
         * Tabs.Panel에 동적으로 value prop 주입
         */
        Tabs: {
            name: 'Tabs',
            vaporComponentName: 'Tabs',
            augmentations: [
                {
                    name: 'inject-panel-value',
                    type: 'functional-component',
                    // ✅ 함수형 target: 복잡한 매칭 로직
                    target: (node) => {
                        return (
                            node.componentName === 'Tabs' &&
                            !['Tabs.Trigger', 'Tabs.List'].includes(
                                node.metadata?.figmaNodeName ?? '',
                            )
                        );
                    },
                    functionalComponent: {
                        type: 'Panel',
                        position: 'wrap',
                        componentName: 'Tabs.Panel',
                        // ✅ 함수형 props: 동적 값 생성
                        props: (child, index) => ({
                            value: `${index}`,
                        }),
                    },
                },
            ],
            subComponents: {
                Root: {
                    name: 'Root',
                    vaporComponentName: 'Tabs.Root',
                },
                List: {
                    name: 'List',
                    vaporComponentName: 'Tabs.List',
                },
                Trigger: {
                    name: 'Trigger',
                    vaporComponentName: 'Tabs.Trigger',
                },
                Panel: {
                    name: 'Panel',
                    vaporComponentName: 'Tabs.Panel',
                },
            },
        },

        /**
         * Breadcrumb Component
         */
        Breadcrumb: {
            name: 'Breadcrumb',
            vaporComponentName: 'Breadcrumb',
            variants: [
                {
                    figmaProperty: 'size',
                    propName: 'size',
                },
            ],
            subComponents: {
                Item: {
                    name: 'Item',
                    vaporComponentName: 'Breadcrumb.Item',
                    variants: [
                        {
                            figmaProperty: 'current',
                            propName: 'current',
                        },
                    ],
                },
            },
        },

        /**
         * Alert Component
         */
        Alert: {
            name: 'Alert',
            vaporComponentName: 'Alert',
            variants: [
                {
                    figmaProperty: 'variant',
                    propName: 'variant',
                },
                {
                    figmaProperty: 'colorPalette',
                    propName: 'colorPalette',
                },
            ],
            subComponents: {
                Title: {
                    name: 'Title',
                    vaporComponentName: 'Alert.Title',
                },
                Description: {
                    name: 'Description',
                    vaporComponentName: 'Alert.Description',
                },
            },
        },

        /**
         * Card Component
         */
        Card: {
            name: 'Card',
            vaporComponentName: 'Card',
            subComponents: {
                Header: {
                    name: 'Header',
                    vaporComponentName: 'Card.Header',
                },
                Body: {
                    name: 'Body',
                    vaporComponentName: 'Card.Body',
                },
                Footer: {
                    name: 'Footer',
                    vaporComponentName: 'Card.Footer',
                },
            },
        },

        /**
         * ✅ 예시: 함수형 값 변환 (PRD 10.1)
         *
         * 복잡한 변환 로직을 함수로 표현
         */
        // StatusBadge: {
        //     name: 'StatusBadge',
        //     vaporComponentName: 'StatusBadge',
        //     variants: [
        //         {
        //             figmaProperty: 'Status',
        //             propName: 'status',
        //             // ✅ 함수형 변환: "In Progress" → "inProgress"
        //             valueMapping: (value) => {
        //                 return value
        //                     .split(' ')
        //                     .map((word, i) =>
        //                         i === 0
        //                             ? word.toLowerCase()
        //                             : capitalize(word)
        //                     )
        //                     .join('');
        //             },
        //         },
        //         {
        //             figmaProperty: 'Priority',
        //             propName: 'priority',
        //             // ✅ 타입 변환: "low" → 0
        //             valueMapping: (value) => {
        //                 const priorities = ['low', 'medium', 'high'];
        //                 return priorities.indexOf(value.toLowerCase());
        //             },
        //         },
        //     ],
        // },
    },
};

/**
 * Helper: getComponentRule
 *
 * 컴포넌트 규칙 조회 헬퍼
 * "Dialog.Header" 같은 복합 이름 지원
 *
 * @param componentName - 컴포넌트 이름 (예: "Dialog", "Dialog.Header")
 * @returns 컴포넌트 규칙 (없으면 undefined)
 */
export function getComponentRule(componentName: string) {
    const parts = componentName.split('.');

    if (parts.length === 1) {
        // 최상위 컴포넌트 조회 (예: "Dialog")
        return metadata.components[componentName];
    }

    // 복합 컴포넌트 조회 (예: "Dialog.Header")
    const [parent, ...childParts] = parts;
    const childName = childParts.join('.');

    const parentRule = metadata.components[parent];
    if (!parentRule) {
        return undefined;
    }

    // 하위 컴포넌트 조회
    return parentRule.subComponents?.[childName];
}

/**
 * Helper: capitalize
 *
 * 문자열 첫 글자를 대문자로 변환
 */
// function capitalize(str: string): string {
//     return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
// }
