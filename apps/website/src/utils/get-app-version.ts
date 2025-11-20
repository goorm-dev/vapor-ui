import { readFile } from 'fs/promises';
import path from 'path';

// process.cwd()는 스크립트 실행 위치(대부분 프로젝트 루트)를 반환합니다.
const rootDir = process.cwd();

export async function getAppVersion() {
    try {
        // 상대 경로 '..' 없이, 루트 디렉터리를 기준으로 package.json 경로를 resolve합니다.
        const packagePath = path.resolve(rootDir, 'package.json');

        const data = await readFile(packagePath, 'utf-8');
        const pkg = JSON.parse(data);

        return pkg.version;
    } catch (error) {
        console.error('Failed to read package.json:', error);
        return '0.0.0';
    }
}
