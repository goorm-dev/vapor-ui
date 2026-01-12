export interface ExtendedType {
    name: string;
    resolved: string;
}

export interface Property {
    name: string;
    type: string;
    optional: boolean;
    description?: string;
}

export interface PropsInfo {
    name: string;
    extends: ExtendedType[];
    properties: Property[];
    resolvedProperties: Property[];
    associatedTypes: string[];
}

export interface FilePropsResult {
    filePath: string;
    props: PropsInfo[];
}
