export interface Property {
    name: string;
    type: string;
    optional: boolean;
    description?: string;
}

export interface PropsInfo {
    name: string;
    description?: string;
    props: Property[];
}

export interface FilePropsResult {
    props: PropsInfo[];
}
