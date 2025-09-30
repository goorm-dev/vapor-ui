/**
 * Common types and interfaces for the type extraction system
 */

export interface ComponentTypeInfo {
    name: string;
    displayName?: string;
    description?: string;
    props: PropInfo[];
    defaultElement?: string;
}

export interface PropInfo {
    name: string;
    type: string | string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
}

export interface BaseUIComponent {
    modulePath: string;
    componentName: string;
}

export interface TypeExtractorConfig {
    configPath: string;
    files?: string[];
    projectRoot?: string;
}