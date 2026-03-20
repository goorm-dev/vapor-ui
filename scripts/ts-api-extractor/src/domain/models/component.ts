import type { PropModel } from './prop';

export interface ComponentModel {
    name: string;
    displayName: string;
    description?: string;
    props: PropModel[];
}
