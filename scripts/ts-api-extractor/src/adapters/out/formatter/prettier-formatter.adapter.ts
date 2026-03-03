import type { FormatterPort } from '~/application/ports/formatter.port';
import { formatWithPrettier } from '~/cli/writer';

export class PrettierFormatterAdapter implements FormatterPort {
    format(filePaths: string[]): void {
        formatWithPrettier(filePaths);
    }
}
