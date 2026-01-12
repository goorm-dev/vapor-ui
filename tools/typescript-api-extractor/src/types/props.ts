export interface Property {
    name: string;
    type: string;
    optional: boolean;
    description?: string;
    defaultValue?: string;
    values?: string[];
}

export interface PropsInfo {
    name: string;
    description?: string;
    props: Property[];
}

export interface FilePropsResult {
    props: PropsInfo[];
}
