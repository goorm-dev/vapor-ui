import type { PropsInfoJson } from '~/application/dto/component-json';
import type { OutputWriterPort } from '~/application/ports/output-writer.port';
import { writeMultipleFiles } from '~/cli/writer';

export class FsOutputWriterAdapter implements OutputWriterPort {
    writeMultipleFiles(
        props: PropsInfoJson[],
        outputDir: string,
        toFileName: (prop: PropsInfoJson) => string,
    ): string[] {
        return writeMultipleFiles(props, outputDir, toFileName);
    }
}
