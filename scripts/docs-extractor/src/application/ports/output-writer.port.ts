import type { PropsInfoJson } from '~/application/dto/component-json';

export interface OutputWriterPort {
    writeMultipleFiles(
        props: PropsInfoJson[],
        outputDir: string,
        toFileName: (prop: PropsInfoJson) => string,
    ): string[];
}
