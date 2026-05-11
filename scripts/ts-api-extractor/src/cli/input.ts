export interface CliInput {
    component?: string;
    package?: string;
    verbose?: boolean;
}

export class CliError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CliError';
    }
}
