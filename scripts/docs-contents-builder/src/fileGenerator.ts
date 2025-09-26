import kebabCase from 'lodash/kebabCase';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as tae from 'typescript-api-extractor';

import { formatComponentData } from './componentHandler';

export class FileGenerator {
    constructor(
        private outputDir: string,
        private language: string,
        private fileExportsMap: Map<string, tae.ExportNode[]>,
    ) {}

    generateComponentFiles(exports: tae.ExportNode[]): void {
        for (const exportNode of exports) {
            this.generateComponentFile(exportNode, exports);
        }
    }

    private generateComponentFile(exportNode: tae.ExportNode, allExports: tae.ExportNode[]): void {
        try {
            const sourceFilePath = this.findSourceFilePath(exportNode);

            const componentApiReference = formatComponentData(
                exportNode,
                allExports,
                this.language,
                sourceFilePath,
            );

            const json = JSON.stringify(componentApiReference, null, 2) + '\n';
            const fileName = `${kebabCase(exportNode.name)}.json`;
            const filePath = path.join(this.outputDir, fileName);

            // 출력 디렉토리가 없는 경우 생성
            if (!fs.existsSync(this.outputDir)) {
                fs.mkdirSync(this.outputDir, { recursive: true });
            }

            fs.writeFileSync(filePath, json);
            console.log(`✅ Generated ${fileName}`);
        } catch (error) {
            console.error('Full error details:', error);
            console.error('ExportNode that caused error:', {
                name: exportNode.name,
                type: exportNode.type,
            });
            console.error(
                `❌ Failed to format component ${exportNode.name}: ${(error as Error).message}`,
            );
        }
    }

    private findSourceFilePath(exportNode: tae.ExportNode): string {
        for (const [file, fileExports] of this.fileExportsMap.entries()) {
            if (fileExports.includes(exportNode)) {
                return file;
            }
        }
        return '';
    }
}
