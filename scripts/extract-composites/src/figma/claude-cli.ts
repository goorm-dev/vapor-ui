import { spawn } from 'node:child_process';

const CLAUDE_BIN = process.env.CLAUDE_BIN ?? 'claude';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL ?? 'claude-haiku-5-5';
const MCP_TOOL = 'mcp__plugin_figma_figma__get_design_context';

const SNIPPET_SCHEMA = JSON.stringify({
    type: 'object',
    properties: {
        snippet: {
            type: 'string',
            description: 'Raw JSX inside the outermost <CodeConnectSnippet> tag',
        },
        componentName: {
            type: 'string',
            description: 'The component name reported in data-name',
        },
    },
    required: ['snippet', 'componentName'],
});

export interface SnippetResult {
    snippet: string;
    componentName: string;
}

/** 사용자의 Figma MCP 연결을 재사용하기 위해 headless Claude CLI 서브프로세스로 돌린다.
 *  CLAUDE_BIN, CLAUDE_MODEL env로 교체 가능. 서브프로세스/파싱 실패 시 undefined를 반환해
 *  호출자가 placeholder로 대체하도록 한다. */
export async function fetchCodeConnectSnippet(
    fileKey: string,
    nodeId: string,
): Promise<SnippetResult | undefined> {
    const prompt =
        `Use ${MCP_TOOL} with fileKey=${fileKey}, nodeId=${nodeId}, ` +
        `excludeScreenshot=true, clientLanguages=typescript, clientFrameworks=react. ` +
        `Extract the JSX inside the outermost <CodeConnectSnippet> tag. ` +
        `Return the raw JSX only — no markdown fences, no prose.`;

    try {
        const stdout = await runSubprocess(CLAUDE_BIN, [
            '-p',
            prompt,
            '--output-format',
            'json',
            '--json-schema',
            SNIPPET_SCHEMA,
            '--allowed-tools',
            MCP_TOOL,
            '--model',
            CLAUDE_MODEL,
        ]);
        const payload = JSON.parse(stdout) as {
            structured_output?: SnippetResult;
            is_error?: boolean;
        };
        if (payload.is_error) return undefined;
        const out = payload.structured_output;
        if (!out?.snippet || typeof out.snippet !== 'string' || !out.snippet.trim()) {
            return undefined;
        }
        return {
            snippet: out.snippet,
            componentName:
                typeof out.componentName === 'string' && out.componentName.trim()
                    ? out.componentName.trim()
                    : 'Component',
        };
    } catch {
        return undefined;
    }
}

const MAX_STDOUT = 10 * 1024 * 1024;

/** stdout이 MAX_STDOUT을 넘으면 kill해 멈춘 서브프로세스가 메모리를 끝없이 쌓지 못하게 한다. */
function runSubprocess(cmd: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
        const stdoutChunks: Buffer[] = [];
        const stderrChunks: Buffer[] = [];
        let stdoutSize = 0;
        child.stdout.on('data', (chunk: Buffer) => {
            stdoutChunks.push(chunk);
            stdoutSize += chunk.length;
            if (stdoutSize > MAX_STDOUT) {
                child.kill('SIGTERM');
                reject(new Error(`${cmd} stdout exceeded ${MAX_STDOUT} bytes`));
            }
        });
        child.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk));
        child.on('error', reject);
        child.on('close', (code) => {
            if (code === 0) {
                resolve(Buffer.concat(stdoutChunks).toString('utf8'));
            } else {
                const stderr = Buffer.concat(stderrChunks).toString('utf8').slice(0, 500);
                reject(new Error(`${cmd} exited ${code}: ${stderr}`));
            }
        });
    });
}
