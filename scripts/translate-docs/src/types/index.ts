export interface PropsInfo {
    name: string;
    displayName: string;
    description?: string;
    props: Array<{
        name: string;
        type: string[];
        required: boolean;
        description?: string;
        defaultValue?: string;
    }>;
    defaultElement?: string;
}

export interface TranslationResult {
    componentDescription?: string;
    propDescriptions: Record<string, string>;
}
