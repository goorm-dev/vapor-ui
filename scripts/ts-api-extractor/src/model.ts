// ──────────────────────────────────────────────────────────────
// What read/ finds in the source (input to policy)
// ──────────────────────────────────────────────────────────────

/** Where a prop was declared. Decided while reading, consumed by the policy. */
export type PropSource =
    | 'project' // a .ts/.tsx file in the project
    | 'variants' // a .css.ts file
    | 'sprinkles' // the sprinkles module
    | 'base-ui' // the @base-ui package
    | 'react' // @types/react
    | 'dom' // TypeScript's DOM lib
    | 'external'; // any other node_modules package

export interface ParsedProp {
    name: string;
    /** The type as the type printer wrote it, before the policy cleans it. */
    typeString: string;
    isOptional: boolean;
    source: PropSource;
    description?: string;
    defaultValue?: string;
}

export interface ParsedComponent {
    name: string;
    description?: string;
    props: ParsedProp[];
}

// ──────────────────────────────────────────────────────────────
// The generated JSON (output of policy, README "Fields")
// ──────────────────────────────────────────────────────────────

export interface PropDoc {
    name: string;
    type: string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
}

export interface ComponentDoc {
    name: string;
    description?: string;
    props: PropDoc[];
}
