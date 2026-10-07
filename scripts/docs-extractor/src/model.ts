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

/**
 * One top-level member of a prop's type, as TypeScript splits it: `boolean` stays
 * one member and aliases such as `ReactNode` are not expanded.
 */
export interface ParsedTypeMember {
    /** The member as the type printer wrote it. */
    text: string;
    kind: 'function' | 'string-literal' | 'undefined' | 'other';
}

export interface ParsedProp {
    name: string;
    typeMembers: ParsedTypeMember[];
    /** The public vapor-ui type names the printer chose for this prop's type, in print order. */
    typeRefs: string[];
    isOptional: boolean;
    /** Tagged `@ignore` upstream and not re-declared by vapor-ui. */
    isIgnored?: boolean;
    source: PropSource;
    description?: string;
    defaultValue?: string;
}

export interface ParsedComponent {
    name: string;
    description?: string;
    props: ParsedProp[];
    /** Bodies of the public vapor-ui type names the props print, keyed by that name. */
    typeRefs?: Record<string, string>;
}

/** The members on one line, function members wrapped so `| undefined` doesn't read as their return type. */
export function joinTypeMembers(members: ParsedTypeMember[]): string {
    if (members.length === 1) return members[0].text;

    return members
        .map((member) => (member.kind === 'function' ? `(${member.text})` : member.text))
        .join(' | ');
}

// ──────────────────────────────────────────────────────────────
// The generated JSON (output of policy, README "Fields")
// ──────────────────────────────────────────────────────────────

export interface PropDoc {
    name: string;
    /** Summary for scanning: no `undefined`, function members read `function`. */
    type: string[];
    /** The full type on one line, `undefined` included. */
    detailedType: string;
    required: boolean;
    description?: string;
    defaultValue?: string;
}

export interface ComponentDoc {
    name: string;
    description?: string;
    props: PropDoc[];
    /** Definitions of the vapor-ui type names in `props[].detailedType`, keyed by that name. */
    typeRefs?: Record<string, string>;
}
