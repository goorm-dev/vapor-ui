export interface Property {
    name: string;
    type: string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
}

export interface PropsInfo {
    name: string;
    displayName: string;
    description?: string;
    props: Property[];
    defaultElement?: string;
}

export interface FilePropsResult {
    props: PropsInfo[];
}
