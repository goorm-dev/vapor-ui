/**
 * Metadata Loader
 *
 * PRD 10: component.metadata.json 로드 및 파싱
 */

import type { ComponentMetadata, MetadataLoaderOptions } from './types';

/**
 * 메타데이터 로더 생성
 *
 * @param options - 로더 옵션
 * @returns 메타데이터 객체
 */
export async function loadMetadata(
    options: MetadataLoaderOptions = {},
): Promise<ComponentMetadata> {
    // Phase 2: 메타데이터 파일 로드
    // Figma Plugin 환경에서는 파일 시스템 접근이 제한적이므로,
    // 기본 메타데이터를 하드코딩하거나 options로 전달받음

    if (options.defaultMetadata) {
        return options.defaultMetadata;
    }

    // 기본 메타데이터 반환
    return getDefaultMetadata();
}

/**
 * 기본 메타데이터 반환
 *
 * Figma Plugin에서 파일 로드가 불가능할 경우 사용
 */
function getDefaultMetadata(): ComponentMetadata {
    return {
        version: '1.0.0',
        components: {
            Button: {
                name: 'Button',
                vaporComponentName: 'Button',
                variants: [
                    {
                        figmaProperty: 'size',
                        propName: 'size',
                    },
                    {
                        figmaProperty: 'variant',
                        propName: 'variant',
                    },
                    {
                        figmaProperty: 'colorPalette',
                        propName: 'colorPalette',
                    },
                    {
                        figmaProperty: 'disabled',
                        propName: 'disabled',
                    },
                ],
            },
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
                        augmentations: [
                            {
                                name: 'inject-close',
                                type: 'functional-component',
                                target: 'Dialog.Header',
                                functionalComponent: {
                                    type: 'Trigger',
                                    position: 'last-child',
                                    componentName: 'Dialog.Close',
                                },
                            },
                        ],
                    },
                    Body: {
                        name: 'Body',
                        vaporComponentName: 'Dialog.Body',
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
            Tabs: {
                name: 'Tabs',
                vaporComponentName: 'Tabs',
                subComponents: {
                    Panel: {
                        name: 'Panel',
                        vaporComponentName: 'Tabs.Panel',
                        augmentations: [
                            {
                                name: 'inject-panel-props',
                                type: 'functional-component',
                                target: 'Tabs.Panel',
                                functionalComponent: {
                                    type: 'Panel',
                                    position: 'wrap',
                                    componentName: 'Tabs.Panel',
                                    props: {
                                        value: '${index}',
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        },
    };
}

/**
 * 컴포넌트 메타데이터 조회
 *
 * @param metadata - 전체 메타데이터
 * @param componentName - 컴포넌트 이름 (예: "Dialog", "Dialog.Header")
 * @returns 컴포넌트 규칙 (없으면 undefined)
 */
export function getComponentRule(metadata: ComponentMetadata, componentName: string) {
    // "Dialog.Header" 같은 복합 이름 처리
    const parts = componentName.split('.');

    if (parts.length === 1) {
        // 최상위 컴포넌트 조회 (예: "Dialog")
        return metadata.components[componentName];
    }

    // 복합 컴포넌트 조회 (예: "Dialog.Header")
    const [parent, ...childParts] = parts;
    const childName = childParts.join('.'); // "Header" or nested like "Foo.Bar"

    const parentRule = metadata.components[parent];
    if (!parentRule) {
        return undefined;
    }

    // 하위 컴포넌트 조회
    return parentRule.subComponents?.[childName];
}
