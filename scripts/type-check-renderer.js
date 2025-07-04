const fs = require('fs');
const path = require('path');

const resolutionKinds = ['node10', 'node16-cjs', 'node16-esm', 'bundler'];

function getTypeCheckJsons(reportsDir) {
    if (!fs.existsSync(reportsDir)) return [];
    const files = fs
        .readdirSync(reportsDir)
        .filter((f) => f.startsWith('type-check-') && f.endsWith('.json'))
        .map((f) => path.join(reportsDir, f));
    return files
        .map((f) => {
            try {
                return JSON.parse(fs.readFileSync(f, 'utf-8'));
            } catch (e) {
                console.error(`Failed to parse ${f}:`, e);
                return null;
            }
        })
        .filter(Boolean);
}

function renderMarkdownTable(jsons) {
    const headers = ['패키지명', ...resolutionKinds];
    const headerRow = `| ${headers.join(' | ')} |`;
    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;

    const bodyRows = jsons.map((json) => {
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
            if (res.visibleProblems && res.visibleProblems.length > 0) {
                row.push('⚠️');
            } else if (res.resolution && res.resolution.isJson) {
                row.push('🟢 (JSON)');
            } else if (kind === 'node16-cjs') {
                row.push('🟢 (CJS)');
            } else if (kind === 'node16-esm') {
                row.push('🟢 (ESM)');
            } else {
                row.push('🟢');
            }
        }
        return `| ${row.join(' | ')} |`;
    });

    return [headerRow, separatorRow, ...bodyRows].join('\n');
}

function main() {
    const reportsDir = process.argv[2] || './type-check-reports';
    const jsons = getTypeCheckJsons(reportsDir);
    if (jsons.length === 0) {
        console.log('No type check reports found.');
        return;
    }
    const tableStr = renderMarkdownTable(jsons);
    console.log('## 📊 Type Check Reports\n');
    console.log(tableStr);
    console.log('\n**Legend:**');
    console.log('- 🟢: No issues');
    console.log('- 🟢 (CJS): CommonJS compatible');
    console.log('- 🟢 (ESM): ES Module compatible');
    console.log('- 🟢 (JSON): JSON module');
    console.log('- ⚠️: Has type issues');
    console.log('- `-`: Not applicable');
}

if (require.main === module) {
    main();
}

module.exports = { renderMarkdownTable, getTypeCheckJsons };
