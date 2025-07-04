import Table from 'cli-table3';
import fs from 'fs';

interface TypeCheckResult {
    analysis: {
        packageName: string;
        entrypoints: {
            '.': {
                resolutions: {
                    [key: string]: {
                        visibleProblems?: any[];
                        resolution?: {
                            isJson?: boolean;
                        };
                    };
                };
            };
        };
    };
}

const resolutionKinds = ['node10', 'node16-cjs', 'node16-esm', 'bundler'];

export function renderTypeCheckReport(reportFiles: string[]): string {
    const table = new Table({
        head: ['패키지명', ...resolutionKinds],
    });

    for (const reportFile of reportFiles) {
        if (!fs.existsSync(reportFile)) {
            continue;
        }

        try {
            const jsonContent = fs.readFileSync(reportFile, 'utf-8');
            const json: TypeCheckResult = JSON.parse(jsonContent);

            const analysis = json.analysis;
            const pkgName = analysis.packageName;
            const entrypoint = analysis.entrypoints['.'];
            const resolutions = entrypoint.resolutions;

            const row = [pkgName];
            for (const kind of resolutionKinds) {
                const res = resolutions[kind];
                if (!res) {
                    row.push('-');
                    continue;
                }

                // 문제 없으면 OK, 문제 있으면 ⚠️
                if (res.visibleProblems && res.visibleProblems.length > 0) {
                    row.push('⚠️');
                } else if (res.resolution?.isJson) {
                    row.push('🟢 (JSON)');
                } else if (kind === 'node16-cjs') {
                    row.push('🟢 (CJS)');
                } else if (kind === 'node16-esm') {
                    row.push('🟢 (ESM)');
                } else {
                    row.push('🟢');
                }
            }
            table.push(row);
        } catch (error) {
            console.error(`Error processing ${reportFile}:`, error);
        }
    }

    return table.toString();
}

export function generateTypeCheckComment(reportsDir: string): string {
    const reportFiles = fs
        .readdirSync(reportsDir)
        .filter((file) => file.startsWith('type-check-') && file.endsWith('.json'))
        .map((file) => `${reportsDir}/${file}`);

    if (reportFiles.length === 0) {
        return '## 📊 Type Check Reports\n\nNo type check reports found.';
    }

    const tableOutput = renderTypeCheckReport(reportFiles);

    return (
        `## 📊 Type Check Reports

\`\`\`
${tableOutput}
\`\`\`

**Legend:**
- 🟢: No issues
- 🟢 (CJS): CommonJS compatible
- 🟢 (ESM): ES Module compatible  
- 🟢 (JSON): JSON module
- ⚠️: Has type issues
- ` - `: Not applicable`
    );
}
