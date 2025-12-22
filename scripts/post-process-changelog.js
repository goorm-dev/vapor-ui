#!/usr/bin/env node
/**
 * Changeset 체인지로그 후처리 스크립트
 *
 * 기능:
 * - changesets에서 생성한 체인지로그의 "Minor Changes", "Patch Changes" 등 타입별 그룹을 제거
 * - PR 제목에서 추출한 스코프 정보를 기반으로 컴포넌트별로 재그룹화
 * - Git을 활용해 실제 변경된 CHANGELOG.md 파일만 처리하여 효율성 향상
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 문자열을 Title Case로 변환하는 함수
 * 예: "button" -> "Button", "menu-item" -> "Menu Item"
 */
function TitleCase(str) {
    return str
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase()) // 각 단어의 첫 글자를 대문자로
        .replace(/-/g, ' '); // 하이픈을 공백으로 변경
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
    const lines = changelogContent.split('\n');
    const groupedEntries = {}; // 스코프별로 그룹화된 엔트리들
    const otherEntries = []; // 스코프가 없는 엔트리들
    let currentScope = null; // 현재 처리 중인 스코프
    let currentEntry = ''; // 현재 처리 중인 엔트리
    let firstVersionStart = -1; // 첫 번째 버전 섹션 시작 위치
    let firstVersionEnd = -1; // 첫 번째 버전 섹션 끝 위치
    let beforeFirstVersion = []; // 첫 번째 버전 이전 내용 (헤더 등)
    let afterFirstVersion = []; // 첫 번째 버전 이후 내용 (이전 버전들)

    // 첫 번째 버전 섹션의 경계 찾기
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 첫 번째 버전 헤더 찾기 (## 1.0.0, ## 2.1.0 등)
        if (line.match(/^## \d+/) && firstVersionStart === -1) {
            firstVersionStart = i;
            continue;
        }

        // 첫 번째 버전 섹션의 끝 찾기 (다음 ## 버전 또는 파일 끝)
        if (firstVersionStart !== -1 && firstVersionEnd === -1) {
            if (line.match(/^## /)) {
                firstVersionEnd = i;
                break;
            }
        }
    }

    // 버전 섹션이 없으면 원본 내용 그대로 반환
    if (firstVersionStart === -1) {
        return changelogContent;
    }

    // 끝을 찾지 못하면 파일 끝까지 처리
    if (firstVersionEnd === -1) {
        firstVersionEnd = lines.length;
    }

    // 내용을 세 부분으로 분할
    beforeFirstVersion = lines.slice(0, firstVersionStart + 1); // 버전 헤더 포함
    const firstVersionContent = lines.slice(firstVersionStart + 1, firstVersionEnd);
    afterFirstVersion = lines.slice(firstVersionEnd);

    // 첫 번째 버전 섹션의 내용만 처리
    for (let i = 0; i < firstVersionContent.length; i++) {
        const line = firstVersionContent[i];

        // changesets 타입 헤더 건너뛰기 (### Minor Changes, ### Patch Changes 등)
        if (line.match(/^### (Major Changes|Minor Changes|Patch Changes)/)) {
            continue;
        }

        // 타입 헤더 다음의 빈 줄 건너뛰기
        if (
            line.trim() === '' &&
            i > 0 &&
            firstVersionContent[i - 1]?.match(/^### (Major Changes|Minor Changes|Patch Changes)/)
        ) {
            continue;
        }

        // 엔트리에서 스코프 마커 확인 ([SCOPE:component] 형태)
        const scopeMatch = line.match(/^\[SCOPE:([^\]]+)\]/);
        if (scopeMatch) {
            // 이전 엔트리가 있으면 저장
            if (currentEntry) {
                if (currentScope) {
                    if (!groupedEntries[currentScope]) {
                        groupedEntries[currentScope] = [];
                    }
                    groupedEntries[currentScope].push(currentEntry);
                } else {
                    otherEntries.push(currentEntry);
                }
            }

            // 새로운 엔트리 시작
            // 스코프 대소문자 정규화 (첫 글자 대문자, 나머지 소문자)
            const rawScope = scopeMatch[1];
            currentScope =
                rawScope === 'Other'
                    ? null
                    : rawScope.charAt(0).toUpperCase() + rawScope.slice(1).toLowerCase();
            // 줄에서 스코프 마커 제거
            currentEntry = line.replace(/^\[SCOPE:[^\]]+\]/, '');
            continue;
        }

        // 다중 줄 엔트리 처리 (들여쓰기된 줄들)
        if (currentEntry && (line.startsWith('  ') || line.startsWith('\t'))) {
            currentEntry += '\n' + line;
            continue;
        }

        // 완전한 엔트리가 있고 계속되지 않는 새 줄을 만났을 때
        if (
            currentEntry &&
            !line.startsWith('  ') &&
            !line.startsWith('\t') &&
            line.trim() !== ''
        ) {
            if (currentScope) {
                if (!groupedEntries[currentScope]) {
                    groupedEntries[currentScope] = [];
                }
                groupedEntries[currentScope].push(currentEntry);
            } else {
                otherEntries.push(currentEntry);
            }
            currentEntry = '';
            currentScope = null;

            // 현재 줄이 비어있지 않으면 다시 처리
            if (line.trim() !== '') {
                i--;
                continue;
            }
        }

        // 빈 줄 처리
        if (line.trim() === '' && currentEntry) {
            // 엔트리에 빈 줄 추가하지 않음
            continue;
        }

        // 스코프 마커가 아니고 엔트리의 일부도 아니면 건너뛰기
        if (!line.match(/^\[SCOPE:/) && !currentEntry) {
            continue;
        }
    }

    // 마지막 엔트리 처리
    if (currentEntry) {
        if (currentScope) {
            if (!groupedEntries[currentScope]) {
                groupedEntries[currentScope] = [];
            }
            groupedEntries[currentScope].push(currentEntry);
        } else {
            otherEntries.push(currentEntry);
        }
    }

    // 결과 생성
    let result = beforeFirstVersion.join('\n');

    // 버전 헤더 다음에 그룹화된 엔트리들 추가
    if (Object.keys(groupedEntries).length > 0 || otherEntries.length > 0) {
        result += '\n';

        // 스코프별 엔트리 추가 (알파벳 순으로 정렬)
        Object.keys(groupedEntries)
            .sort()
            .forEach((scope) => {
                result += `\n### ${TitleCase(scope)}\n\n`;
                groupedEntries[scope].forEach((entry) => {
                    result += entry + '\n\n';
                });
            });

        // 기타 엔트리 추가
        if (otherEntries.length > 0) {
            result += `### Other Changes\n\n`;
            otherEntries.forEach((entry) => {
                result += entry + '\n\n';
            });
        }
    }

    // 나머지 버전들 추가 (첫 번째 버전 이후의 모든 내용)
    if (afterFirstVersion.length > 0) {
        result += '\n' + afterFirstVersion.join('\n');
    }

    return result.replace(/\n{3,}/g, '\n\n'); // 과도한 줄 바꿈 정리
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
        // 원본 체인지로그 내용 읽기
        const changelogContent = fs.readFileSync(changelogPath, 'utf-8');
        const processedContent = postProcessChangelog(changelogContent);

        // 원본 백업
        fs.writeFileSync(changelogPath + '.backup', changelogContent);

        // 처리된 체인지로그 쓰기
        fs.writeFileSync(changelogPath, processedContent);

        console.log(`✅ ${packageName}: 체인지로그가 스코프별로 그룹화되어 처리되었습니다`);
        console.log(`💾 ${packageName}: 원본이 CHANGELOG.md.backup으로 백업되었습니다`);
        return true;
    } catch (error) {
        console.error(`❌ ${packageName}: 체인지로그 처리 중 오류 - ${error.message}`);
        return false;
    }
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
        const changedFiles = gitOutput
            .split('\n')
            .filter((line) => line.trim() !== '') // 빈 줄 제거
            .map((line) => line.substring(3).trim()) // git status 접두사 제거 (예: " M ", "??" 등)
            .filter((file) => file.startsWith('packages/') && file.endsWith('/CHANGELOG.md'));

        return changedFiles;
    } catch (error) {
        console.warn('⚠️  Git 상태를 가져올 수 없어 모든 체인지로그 처리로 fallback합니다');
        console.warn('   Git 저장소 내에서 실행하고 Git이 설치되어 있는지 확인하세요');
        return null; // 모든 파일 처리로 fallback을 위해 null 반환
    }
}

/**
 * 메인 실행 함수
 *
 * 실행 흐름:
 * 1. Git을 통해 변경된 CHANGELOG.md 파일들 확인
 * 2. 변경된 파일이 있으면 해당 파일들만 처리
 * 3. Git 사용이 불가능하거나 변경된 파일이 없으면 모든 packages 스캔
 * 4. 처리 결과 요약 출력
 */
function main() {
    const packagesDir = 'packages';

    // packages 디렉토리 존재 확인
    if (!fs.existsSync(packagesDir)) {
        console.error('packages 디렉토리를 찾을 수 없습니다');
        process.exit(1);
    }

    let processedCount = 0; // 처리 성공한 파일 수
    let errorCount = 0; // 처리 실패한 파일 수

    try {
        // 변경된 CHANGELOG.md 파일들만 가져오기 시도
        const changedChangelogFiles = getChangedChangelogFiles();

        if (changedChangelogFiles !== null && changedChangelogFiles.length > 0) {
            // 변경된 파일들이 있는 경우
            console.log(
                `🔍 ${changedChangelogFiles.length}개의 변경된 CHANGELOG.md 파일을 발견했습니다:`,
            );
            changedChangelogFiles.forEach((file) => console.log(`   📝 ${file}`));
            console.log();

            // 변경된 파일들만 처리
            changedChangelogFiles.forEach((changelogPath) => {
                const packageName = changelogPath.split('/')[1]; // 경로에서 패키지명 추출

                if (fs.existsSync(changelogPath)) {
                    console.log(`📝 ${packageName}/CHANGELOG.md 처리 중...`);
                    const success = processChangelogFile(changelogPath, packageName);
                    if (success) {
                        processedCount++;
                    } else {
                        errorCount++;
                    }
                } else {
                    console.log(`⚠️  ${changelogPath}: 파일을 찾을 수 없어 건너뜁니다`);
                }
            });
        } else if (changedChangelogFiles !== null && changedChangelogFiles.length === 0) {
            // Git은 사용 가능하지만 변경된 CHANGELOG.md가 없는 경우
            console.log('ℹ️  변경된 CHANGELOG.md 파일이 없습니다');
            console.log('   changesets로 업데이트된 패키지가 없다면 정상입니다');
        } else {
            // Fallback: 모든 CHANGELOG.md 파일 처리
            console.log('🔄 Fallback: 모든 CHANGELOG.md 파일을 처리합니다...');

            // packages 디렉토리의 모든 하위 디렉토리 스캔
            const packageDirs = fs
                .readdirSync(packagesDir, { withFileTypes: true })
                .filter((dirent) => dirent.isDirectory())
                .map((dirent) => dirent.name);

            console.log(`📦 확인할 ${packageDirs.length}개의 패키지를 발견했습니다...`);

            packageDirs.forEach((packageName) => {
                const changelogPath = path.join(packagesDir, packageName, 'CHANGELOG.md');

                if (fs.existsSync(changelogPath)) {
                    console.log(`📝 ${packageName}/CHANGELOG.md 처리 중...`);
                    const success = processChangelogFile(changelogPath, packageName);
                    if (success) {
                        processedCount++;
                    } else {
                        errorCount++;
                    }
                } else {
                    console.log(`⚠️  ${packageName}: CHANGELOG.md를 찾을 수 없어 건너뜁니다`);
                }
            });
        }

        // 처리 결과 요약 출력
        console.log('\n📊 처리 요약:');
        console.log(`   ✅ ${processedCount}개의 체인지로그가 성공적으로 처리되었습니다`);
        if (errorCount > 0) {
            console.log(`   ❌ ${errorCount}개의 체인지로그 처리 중 오류가 발생했습니다`);
        }
        if (changedChangelogFiles === null) {
            console.log(`   🔄 모든 가용한 체인지로그를 처리했습니다 (fallback 모드)`);
        } else if (changedChangelogFiles.length === 0) {
            console.log(`   ℹ️  처리가 필요한 체인지로그가 없습니다`);
        } else {
            console.log(`   🎯 변경된 체인지로그만 처리했습니다`);
        }
    } catch (error) {
        console.error('체인지로그 처리 중 오류가 발생했습니다:', error.message);
        process.exit(1);
    }
}

// 스크립트 실행
main();
