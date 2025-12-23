/**
 * Changeset 체인지로그 후처리 스크립트
 *
 * 기능:
 * - changesets에서 생성한 체인지로그의 "Minor Changes", "Patch Changes" 등 타입별 그룹을 제거
 * - PR 제목에서 추출한 스코프 정보를 기반으로 컴포넌트별로 재그룹화
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import prettierInstance from 'prettier';

import { extractVersion } from './helpers.js';

/* -------------------------------------------------------------------------------------------------
 * Utility Functions
 * -----------------------------------------------------------------------------------------------*/

/**
 * 문자열을 Title Case로 변환하는 함수
 *
 * @example
 * - "button" -> "Button"
 * - "menu-item" -> "Menu Item"
 */
function TitleCase(str) {
    return str
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .replace(/-/g, ' ');
}

/**
 * Prettier를 사용해 마크다운 파일을 포맷팅하는 함수
 *
 * @param {string} filePath
 * @param {string} content
 */
async function writeFormattedMarkdownFile(filePath, content) {
    const formatted = await prettierInstance.format(content, {
        ...(await prettierInstance.resolveConfig(filePath)),
        filepath: filePath,
        parser: 'markdown',
    });

    fs.writeFileSync(filePath, formatted);
}

/* -------------------------------------------------------------------------------------------------
 * Main Execution Flow
 * -----------------------------------------------------------------------------------------------*/

/**
 * 메인 실행 함수
 */
function main() {
    const packagesDir = 'packages';

    if (!fs.existsSync(packagesDir)) {
        console.error('packages 디렉토리를 찾을 수 없습니다');
        process.exit(1);
    }

    try {
        const files = getFilesToProcess(packagesDir);

        files.forEach((changelogPath) => {
            if (!fs.existsSync(changelogPath)) {
                console.log(`⚠️ ${changelogPath}: 파일을 찾을 수 없어 건너뜁니다`);
                return;
            }

            const packageName = changelogPath.split(path.sep)[1] || 'unknown';
            processChangelogFile(changelogPath, packageName);
        });
    } catch (error) {
        console.error('체인지로그 처리 중 오류가 발생했습니다:', error.message);
        process.exit(1);
    }
}

/**
 * 처리할 체인지로그 파일 목록을 반환하는 함수
 */
function getFilesToProcess(packagesDir) {
    const changedFiles = getChangedChangelogFiles();

    // 1. Git으로 변경된 파일이 감지된 경우
    if (changedFiles !== null) {
        if (changedFiles.length === 0) {
            console.log('ℹ️ 변경된 CHANGELOG.md 파일이 없습니다');
            return [];
        }

        changedFiles.forEach((file) => console.log(`   📝 ${file}`));
        console.log();

        return changedFiles;
    }

    // 2. Git 사용 불가 또는 감지 실패 시 -> 전체 패키지 스캔
    return fs
        .readdirSync(packagesDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => path.join(packagesDir, dirent.name, 'CHANGELOG.md'));
}

/**
 * Git을 사용해 변경된 CHANGELOG.md 파일들을 찾는 함수
 *
 * changesets가 실행된 후 실제로 변경된 packages 하위의 CHANGELOG.md 파일들만
 * 선별하여 불필요한 처리를 방지합니다.
 *
 * @returns {string[]|null} 변경된 CHANGELOG.md 파일 경로 배열, 또는 Git 사용 불가시 null
 */
function getChangedChangelogFiles() {
    try {
        // git status를 사용해 모든 변경된 파일 목록 가져오기
        const gitOutput = execSync('git status --porcelain', { encoding: 'utf8' });

        // packages 디렉토리의 CHANGELOG.md 파일들만 필터링
        return gitOutput
            .split('\n')
            .filter((line) => line.trim() !== '')
            .map((line) => line.split(' ').pop()) // git status 접두사 제거
            .filter((file) => file.endsWith('/CHANGELOG.md'));
    } catch (error) {
        console.warn('⚠️  Git 상태를 가져올 수 없어 모든 체인지로그 처리로 fallback합니다');
        console.warn('    Git 저장소 내에서 실행하고 Git이 설치되어 있는지 확인하세요');
        return null;
    }
}

/**
 * 단일 체인지로그 파일을 처리하는 함수
 *
 * @param {string} changelogPath - 처리할 CHANGELOG.md 파일의 경로
 * @param {string} packageName - 패키지 이름 (로깅용)
 * @returns {boolean} 처리 성공 여부
 */
function processChangelogFile(changelogPath, packageName) {
    try {
        const changelogContent = fs.readFileSync(changelogPath, 'utf-8');
        const processedContent = postProcessChangelog(changelogContent);

        fs.writeFileSync(changelogPath, processedContent);
        writeFormattedMarkdownFile(changelogPath, processedContent);

        return true;
    } catch (error) {
        console.error(`❌ ${packageName}: 체인지로그 처리 중 오류 - ${error.message}`);
        return false;
    }
}

/**
 * 체인지로그 내용을 스코프별로 그룹화하여 후처리하는 함수
 *
 * 처리 과정:
 * 1. 최신 버전 섹션(첫 번째 ## 헤더)만 처리 대상으로 선별
 * 2. changesets의 타입별 헤더(Minor Changes, Patch Changes) 제거
 * 3. [SCOPE:component] 마커를 기반으로 스코프별로 엔트리 재그룹화
 * 4. 스코프별 ### 헤더로 재구성하여 출력
 */
function postProcessChangelog(changelogContent) {
    const parsed = extractVersion(changelogContent);

    if (!parsed) return changelogContent;

    const { preamble: packageName, header, content, rest } = parsed;
    const { groupedEntries, otherEntries } = processVersionContent(content);

    return reconstructChangelog({
        packageName,
        versionHeader: header,
        groupedEntries,
        otherEntries,
        afterTargetVersion: rest,
    });
}

/* -------------------------------------------------------------------------------------------------
 * Content Processing Helpers
 * -----------------------------------------------------------------------------------------------*/

/**
 * 버전 섹션의 내용을 처리하여 스코프별로 그룹화하는 함수
 *
 * @param {string} versionContent - 처리할 버전 섹션 내용
 * @returns {Object} - { groupedEntries, otherEntries }
 */
function processVersionContent(versionContent) {
    const changesetTemplate = /^### (Major|Minor|Patch) Changes.*/gm;
    const cleanedContent = versionContent.replace(changesetTemplate, '');
    const lines = cleanedContent.split('\n');

    const entries = [];
    let currentScope = null;
    let currentBuffer = [];

    const commitBuffer = () => {
        if (currentBuffer.length === 0) return;

        // 첫 번째 라인이 비어있는지 확인 (헤더만 있는 경우)
        const isFirstLineEmpty = currentBuffer[0].trim() === '';

        const formattedBuffer = currentBuffer.map((line, index) => {
            // 제목 라인은 그대로 유지
            if (index === 0) return line;

            // 개행 라인은 그대로 유지
            if (line.trim() === '') return line;

            // 첫 번째 라인이 비어있으면 들여쓰기 하지 않음 (형제 항목들)
            if (isFirstLineEmpty) return line;

            // 첫 번째 라인이 있으면 들여쓰기 함 (하위 항목들)
            return '\t' + line;
        });

        const currentContent = formattedBuffer.join('\n').trim();
        entries.push({ scope: currentScope, content: currentContent });

        currentBuffer = [];
    };

    lines.forEach((line) => {
        const trimmedLine = line.trim();
        const isScope = line.match(/^\s*\[SCOPE:([^\]]+)\]/);

        if (isScope) {
            commitBuffer();
            const [, rawScope] = isScope;

            currentScope = rawScope === 'etc' ? null : TitleCase(rawScope);
            currentBuffer.push(line.replace(/^\s*\[SCOPE:[^\]]+\]\s*/, ''));

            return;
        }

        if (currentBuffer.length > 0 || trimmedLine) {
            currentBuffer.push(line);
        }
    });
    commitBuffer();

    const groupedEntries = {};
    const otherEntries = [];

    entries.forEach(({ scope, content }) => {
        if (!content) return;

        if (!scope && content.startsWith('- ')) {
            otherEntries.push(content);
            return;
        }

        if (!groupedEntries[scope]) groupedEntries[scope] = [];
        groupedEntries[scope].push(content);
    });

    return { groupedEntries, otherEntries };
}

/**
 * 처리된 내용들을 최종 체인지로그로 재구성하는 함수
 *
 * @param {Object} sections - 체인지로그 섹션들
 * @returns {string} 재구성된 체인지로그 내용
 */
function reconstructChangelog({
    packageName,
    versionHeader,
    groupedEntries,
    otherEntries,
    afterTargetVersion,
}) {
    const parts = [];

    // 첫 번째 버전 이전 내용 추가 (제목, 설명 등)
    if (packageName) {
        parts.push(packageName);
    }

    // 첫 번째 버전 헤더 추가
    if (versionHeader) {
        parts.push(versionHeader);
    }

    // 그룹화된 엔트리들이 있는 경우
    if (Object.keys(groupedEntries).length > 0 || otherEntries.length > 0) {
        // 스코프별 엔트리 추가 (알파벳 순으로 정렬)
        Object.keys(groupedEntries)
            .sort()
            .forEach((scope) => {
                pushEntry({ parts, title: TitleCase(scope), entries: groupedEntries[scope] });
            });

        // 기타 엔트리 추가
        if (otherEntries.length > 0) {
            pushEntry({ parts, title: 'etc', entries: otherEntries });
        }
    }

    // 첫 번째 버전 이후의 내용 추가 (이전 버전들)
    if (afterTargetVersion && afterTargetVersion.trim()) {
        parts.push(afterTargetVersion.trim());
    }

    // 최종 결과 생성 (과도한 줄 바꿈 정리)
    return parts.join('\n').replace(/\n{3,}/g, '\n\n');
}

function pushEntry({ parts, title, entries }) {
    parts.push(`### ${title}`);
    parts.push('');

    entries.forEach((entry) => {
        parts.push(entry);
        parts.push('');
    });
}

// 스크립트 실행
main();
