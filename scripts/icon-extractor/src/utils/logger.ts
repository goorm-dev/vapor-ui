import pc from 'picocolors';

const TAG = ' GDS FIGMA EXPORT: ';

const log = {
    info: (message: string) => console.log(pc.yellow(TAG) + message),
    warn: (message: string) => console.warn(pc.yellow(TAG) + message),
    error: (message: string) => console.error(pc.red(`${TAG}ERROR: ${message}`)),
};

export { log };
