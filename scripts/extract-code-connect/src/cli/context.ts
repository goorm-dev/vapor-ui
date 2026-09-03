/** 주입 가능한 실행 환경. 테스트는 임시 cwd 와 spy 로거를 넘긴다. */
export interface CliIo {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    log?: (msg: string) => void;
    warn?: (msg: string) => void;
    error?: (msg: string) => void;
}

export type CliContext = Required<CliIo>;

export function resolveContext(io: CliIo = {}): CliContext {
    return {
        cwd: io.cwd ?? process.cwd(),
        env: io.env ?? process.env,
        log: io.log ?? console.log,
        warn: io.warn ?? console.warn,
        error: io.error ?? console.error,
    };
}
