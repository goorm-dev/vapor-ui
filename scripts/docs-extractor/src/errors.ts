/**
 * Errors that represent a bad request rather than a bug — a missing path, an
 * unknown component name. The CLI prints these plainly instead of as a crash.
 */
export class ExtractorError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ExtractorError';
    }
}
