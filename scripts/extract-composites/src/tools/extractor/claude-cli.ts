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

/**
 * Fetch the Code Connect snippet for a single Figma instance via a headless
 * Claude CLI subprocess. The CLI invokes `mcp__plugin_figma_figma__get_design_context`
 * through the user's existing Figma MCP connection, then returns the JSX
 * contained in the outermost `<CodeConnectSnippet>` tag as structured JSON.
 *
 * Requires `claude` on PATH (override via CLAUDE_BIN). Default model is Haiku 5.5
 * (override via CLAUDE_MODEL). Returns `undefined` on any subprocess or parse
 * failure so the caller can fall back to a placeholder.
 */
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

/**
 * Spawn a subprocess with stdin closed and collect stdout as UTF-8. Rejects on
 * non-zero exit or stdout exceeding MAX_STDOUT so a stuck subprocess cannot
 * accumulate unbounded memory.
 */
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
