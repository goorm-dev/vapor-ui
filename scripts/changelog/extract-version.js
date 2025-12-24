/**
 * 체인지로그 내용을 파싱하여 섹션별로 분리하는 유틸리티 함수
 *
 * @param {string} content - 전체 체인지로그 내용
 * @returns {Object | null} 파싱된 결과 객체 또는 헤더를 찾지 못한 경우 null
 * @property {string} preamble - 첫 번째 버전 헤더 이전의 내용 (패키지명 등)
 * @property {string} version - 추출된 버전 문자열 (예: "1.0.0")
 * @property {string} header - 버전 헤더 전체 라인 (예: "## 1.0.0")
 * @property {string} content - 해당 버전의 본문 내용
 * @property {string} rest - 해당 버전 이후의 나머지 내용
 */
export function extractVersion(content) {
    // 1. 첫 번째 버전 헤더 찾기 (맨 위에 있는 것이 최신 버전이라고 가정)
    // Keep A Changelog 형식을 따르므로 ## [Version] 또는 ## Version 형태를 찾음
    const versionHeaderRegex = /^##\s+(.*)$/m;
    const firstMatch = versionHeaderRegex.exec(content);

    if (!firstMatch) return null;

    const firstHeaderStartIndex = firstMatch.index;
    const versionString = firstMatch[1].trim();

    // 헤더 라인의 끝(개행) 찾기
    const firstLineEndIndex = content.indexOf('\n', firstHeaderStartIndex);
    const versionHeaderEndIndex = firstLineEndIndex !== -1 ? firstLineEndIndex : content.length;
    const versionHeader = content.slice(firstHeaderStartIndex, versionHeaderEndIndex);

    // 2. 다음 헤더 찾기 (## 로 시작하는 다음 라인)
    // 현재 버전 섹션의 끝을 찾기 위함
    const nextHeaderRegex = /^##\s+/gm;
    nextHeaderRegex.lastIndex = versionHeaderEndIndex;

    const nextMatch = nextHeaderRegex.exec(content);
    const endIndex = nextMatch ? nextMatch.index : content.length;

    // 3. 내용 분리
    const preamble = content.slice(0, firstHeaderStartIndex);
    const contentBody = content.slice(versionHeaderEndIndex + 1, endIndex);
    const rest = content.slice(endIndex);

    return {
        preamble: preamble.trim(),
        version: versionString,
        header: versionHeader,
        content: contentBody, // 호출자가 trim() 필요시 수행
        rest: rest,
    };
}
