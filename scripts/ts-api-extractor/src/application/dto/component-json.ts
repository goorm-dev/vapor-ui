export interface PropertyJson {
    name: string;
    type: string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
}

export interface PropsInfoJson {
    name: string;
    displayName: string;
    description?: string;
    props: PropertyJson[];
}
