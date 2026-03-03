import type { LoggerPort } from '~/application/ports/logger.port';

export class ConsoleLoggerAdapter implements LoggerPort {
    info(message: string): void {
        console.error(message);
    }

    warn(message: string): void {
        console.warn(message);
    }

    error(message: string): void {
        console.error(message);
    }
}
