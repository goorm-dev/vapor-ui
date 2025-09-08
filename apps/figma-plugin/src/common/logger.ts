export const Logger = {
    // ============================================================================
    // General Logging
    // ============================================================================
    info: (message: string, data?: unknown) => {
        console.log(`[INFO] ${message}`, data ?? '');
    },
    warn: (message: string, data?: unknown) => {
        console.warn(`[WARN] ${message}`, data ?? '');
    },
    error: (message: string, error?: unknown) => {
        console.error(`[ERROR] ${message}`, error ?? '');
    },
    /**
     * only use dev
     */
    debug: (message: string, data?: unknown) => {
        console.debug(`[DEBUG] ${message}`, data ?? '');
    },

    // ============================================================================
    // Domain-Specific Logging
    // ============================================================================

    palette: {
        generating: (colorData: unknown) => {
            Logger.info('팔레트 생성 시작', colorData);
        },

        generated: (result: unknown) => {
            Logger.info('팔레트 생성 완료', result);
        },

        creatingSection: (theme: string) => {
            Logger.info(`${theme} 테마 섹션 생성 중`);
        },

        sectionCreated: (theme: string) => {
            Logger.info(`${theme} 테마 섹션 생성 완료`);
        },

        error: (message: string, error?: unknown) => {
            Logger.error(`팔레트 처리 오류: ${message}`, error);
        },
    },
    semantic: {
        generating: (colorData: unknown, dependentTokens: unknown) => {
            Logger.info('시맨틱 토큰 생성 시작', { colorData, dependentTokens });
        },

        generated: (result: unknown) => {
            Logger.info('시맨틱 토큰 생성 완료', result);
        },

        creatingSection: (theme: string) => {
            Logger.info(`${theme} 시맨틱 섹션 생성 중`);
        },

        sectionCreated: (theme: string) => {
            Logger.info(`${theme} 시맨틱 섹션 생성 완료`);
        },

        error: (message: string, error?: unknown) => {
            Logger.error(`시맨틱 토큰 처리 오류: ${message}`, error);
        },
    },
    variables: {
        creating: (collectionName: string) => {
            Logger.info(`Figma 변수 생성 시작: ${collectionName}`);
        },

        created: (collectionName: string, count: number) => {
            Logger.info(`Figma 변수 생성 완료: ${collectionName} (${count}개)`);
        },

        error: (message: string, error?: unknown) => {
            Logger.error(`Figma 변수 생성 오류: ${message}`, error);
        },
    },
    font: {
        loading: (fontFamily: string) => {
            Logger.info(`폰트 로드 시작: ${fontFamily}`);
        },

        loaded: (fontFamily: string) => {
            Logger.info(`폰트 로드 완료: ${fontFamily}`);
        },

        fallback: (originalFont: string, fallbackFont: string, error?: unknown) => {
            Logger.warn(
                `폰트 로드 실패로 대체 폰트 사용: ${originalFont} -> ${fallbackFont}`,
                error,
            );
        },

        error: (message: string, error?: unknown) => {
            Logger.error(`폰트 로드 오류: ${message}`, error);
        },
    },
} as const;
