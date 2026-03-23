import type { PropsInfoJson } from '~/application/dto/component-json';
import type { ComponentModel } from '~/domain/models/component';
import type { ParsedComponent } from '~/domain/models/parsed';

export interface ExtractComponentMetadataOutput {
    parsed: ParsedComponent[];
    models: ComponentModel[];
    props: PropsInfoJson[];
    writtenFiles: string[];
}
