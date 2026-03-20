export interface ParsedProp {
    name: string;
    typeString: string;
    isOptional: boolean;
    description?: string;
    defaultValue?: string;
    declarationFilePath?: string;
}

export interface ParsedComponent {
    name: string;
    description?: string;
    props: ParsedProp[];
}
