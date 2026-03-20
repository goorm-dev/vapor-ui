export type PropCategory = 'required' | 'variants' | 'state' | 'custom' | 'base-ui' | 'composition';

export interface PropModel {
    name: string;
    types: string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
    category: PropCategory;
}
