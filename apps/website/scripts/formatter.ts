import type { ComponentData, ComponentTypeInfo } from './types';

/**
 * Formatter utilities for component data
 */

/**
 * Creates component data structure from ComponentTypeInfo
 */
export function createComponentData(
    component: ComponentTypeInfo,
    sourceFile: string,
): ComponentData {
    return {
        name: component.name,
        displayName: component.displayName,
        description: component.description,
        props: component.props.map((prop) => ({
            name: prop.name,
            type: prop.type,
            required: prop.required,
            description: prop.description,
            defaultValue: prop.defaultValue,
        })),
        defaultElement: component.defaultElement,
        sourceFile,
    };
}
