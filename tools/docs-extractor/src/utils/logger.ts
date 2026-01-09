import picocolors from 'picocolors';

export class Logger {
    constructor(private verbose: boolean = false) {}

    info(message: string, ...args: unknown[]): void {
        console.log(picocolors.blue('[INFO]'), message, ...args);
    }

    success(message: string, ...args: unknown[]): void {
        console.log(picocolors.green('[SUCCESS]'), message, ...args);
    }

    warn(message: string, ...args: unknown[]): void {
        console.log(picocolors.yellow('[WARN]'), message, ...args);
    }

    error(message: string, ...args: unknown[]): void {
        console.error(picocolors.red('[ERROR]'), message, ...args);
    }

    debug(message: string, ...args: unknown[]): void {
        if (this.verbose) {
            console.log(picocolors.gray('[DEBUG]'), message, ...args);
        }
    }
}
