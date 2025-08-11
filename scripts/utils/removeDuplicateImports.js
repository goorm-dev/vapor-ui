import fs from 'fs';
import path from 'path';

// 처리할 디렉터리 경로
const directoryPath = 'stories/foundation/icons/';

try {
    // 디렉터리 내 모든 파일을 읽어옴
    const files = fs.readdirSync(directoryPath);

    files.forEach((file) => {
        const filePath = path.join(directoryPath, file);

        // 파일인지 확인 (디렉터리 제외)
        if (fs.statSync(filePath).isFile() && filePath.endsWith('.jsx')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // 중복된 import 문을 찾아 제거하는 정규 표현식
            const regex =
                /^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/gm;
            const imports = new Map();

            // 중복된 import 제거
            content = content.replace(
                regex,
                (match, importName, importPath) => {
                    if (imports.has(importName)) {
                        return ''; // 중복된 import 제거
                    }
                    imports.set(importName, importPath);
                    return match;
                },
            );

            // 연속된 빈 줄을 하나로 압축
            content = content.replace(/(\r?\n){2,}/g, '\n\n');

            // 파일 덮어쓰기
            fs.writeFileSync(filePath, content, 'utf8');

            console.log(`Processed: ${filePath}`);
        }
    });

    console.log('All duplicate imports removed and empty lines cleaned.');
} catch (err) {
    console.error('Error processing files:', err);
}
