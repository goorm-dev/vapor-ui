import type { PropertyJson, PropsInfoJson } from '~/application/dto/component-json';

export type { PropsInfoJson, PropertyJson };

export interface FileResultJson {
    props: PropsInfoJson[];
}
