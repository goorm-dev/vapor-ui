import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { run } from '~/cli/run';
import * as clientModule from '~/translation/client';
import * as translationModule from '~/translation/translate';

const validEnv = {
    LITELLM_API_KEY: 'test-key',
    LITELLM_BASE_URL: 'https://example.test',
};

describe('E2E: CLI → translator → 파일 출력', () => {
    let workDir: string;

    beforeEach(() => {
        workDir = mkdtempSync(join(tmpdir(), 'e2e-test-'));
    });

    afterEach(() => {
        rmSync(workDir, { recursive: true, force: true });
        vi.restoreAllMocks();
    });

    function writeInputFile(inputDir: string): void {
        mkdirSync(inputDir, { recursive: true });
        writeFileSync(
            join(inputDir, 'button.json'),
            JSON.stringify({
                name: 'Button',
                description: 'A clickable button.',
                props: [
                    {
                        name: 'size',
                        type: ['"sm"', '"md"'],
                        required: false,
                        description: 'Size of the button.',
                    },
                    { name: 'disabled', type: ['boolean'], required: false },
                ],
            }),
            'utf-8',
        );
    }

    it('Happy path: EN JSON → 번역 PASS → ko/ 파일 생성 + 리포트 생성', async () => {
        const inputDir = join(workDir, 'en');
        const outputDir = join(workDir, 'out');
        writeInputFile(inputDir);

        // LLM 호출 직전 모듈만 fixture로 대체
        vi.spyOn(translationModule, 'translateComponentUnits').mockImplementation(
            async (_componentName, units) =>
                new Map(units.map((unit) => [unit.id, `[ko]${unit.source}`])),
        );
        vi.spyOn(clientModule, 'callLlm').mockResolvedValue({
            content: JSON.stringify({
                evaluations: [
                    { id: 'component.description', verdict: 'PASS', errors: [] },
                    { id: 'props[0].size.description', verdict: 'PASS', errors: [] },
                ],
            }),
        });

        const result = await run(['--input', inputDir, '--output', outputDir], { env: validEnv });

        // ko/ 파일 생성 확인
        expect(result.writtenFiles).toHaveLength(1);
        const koPath = join(outputDir, 'ko', 'button.json');
        expect(existsSync(koPath)).toBe(true);

        const koContent = JSON.parse(readFileSync(koPath, 'utf-8')) as {
            name: string;
            description: string;
            props: { name: string; description?: string; type?: string[] }[];
        };

        // 번역된 내용 확인
        expect(koContent.name).toBe('Button');
        expect(koContent.description).toBe('[ko]A clickable button.');
        expect(koContent.props[0].description).toBe('[ko]Size of the button.');
        // 번역 대상 아닌 필드는 원본 유지
        expect(koContent.props[0].type).toEqual(['"sm"', '"md"']);
        expect(koContent.props[1].description).toBeUndefined();

        // 리포트 파일 생성 확인
        expect(existsSync(result.reportPath)).toBe(true);
        const reportContent = readFileSync(result.reportPath, 'utf-8');
        expect(reportContent).toContain('Translation Quality Report');
        expect(reportContent).toContain('| Button |');

        // 캐시 파일 생성 확인
        expect(existsSync(join(outputDir, '.translation-cache.json'))).toBe(true);
    });

    it('MQM FAIL → 후처리 → PASS: 수정된 번역이 ko/ 파일에 반영됨', async () => {
        const inputDir = join(workDir, 'en');
        const outputDir = join(workDir, 'out');
        writeInputFile(inputDir);

        const mqmError = {
            category: 'Fluency/Unnatural phrasing' as const,
            severity: 'minor' as const,
            source_span: 'Size of the button.',
            mt_span: '버튼의 크기를 제어합니다.',
            explanation: '번역투 표현입니다.',
        };

        // translate: 초기 번역 반환
        vi.spyOn(translationModule, 'translateComponentUnits').mockImplementation(
            async (_componentName, units) =>
                new Map(
                    units.map((unit) => [
                        unit.id,
                        unit.id === 'props[0].size.description'
                            ? '버튼의 크기를 제어합니다.'
                            : `[ko]${unit.source}`,
                    ]),
                ),
        );

        // callLlm 호출 순서: 1) 초기 batch MQM, 2) batch postprocess, 3) 최종 batch MQM
        let llmCallCount = 0;
        vi.spyOn(clientModule, 'callLlm').mockImplementation(async () => {
            llmCallCount++;
            if (llmCallCount === 1) {
                return {
                    content: JSON.stringify({
                        evaluations: [
                            { id: 'component.description', verdict: 'PASS', errors: [] },
                            {
                                id: 'props[0].size.description',
                                verdict: 'FAIL',
                                errors: [mqmError],
                            },
                        ],
                    }),
                    inputTokens: 0,
                    outputTokens: 0,
                    cost: 0,
                };
            }
            if (llmCallCount === 2) {
                return {
                    content: JSON.stringify({
                        translations: [
                            {
                                id: 'props[0].size.description',
                                translated: '버튼의 크기를 지정합니다.',
                            },
                        ],
                    }),
                    inputTokens: 0,
                    outputTokens: 0,
                    cost: 0,
                };
            }
            // 최종 MQM: PASS
            return {
                content: JSON.stringify({
                    evaluations: [{ id: 'props[0].size.description', verdict: 'PASS', errors: [] }],
                }),
                inputTokens: 0,
                outputTokens: 0,
                cost: 0,
            };
        });

        const result = await run(['--input', inputDir, '--output', outputDir], { env: validEnv });

        const koPath = join(outputDir, 'ko', 'button.json');
        const koContent = JSON.parse(readFileSync(koPath, 'utf-8')) as {
            props: { description?: string }[];
        };

        // 후처리된 번역이 최종 파일에 반영됨
        expect(koContent.props[0].description).toBe('버튼의 크기를 지정합니다.');

        // 리포트에 검증됨으로 기록 (unverified 없음)
        const reportContent = readFileSync(result.reportPath, 'utf-8');
        expect(reportContent).toContain('No reportable unverified translations.');
    });
});
