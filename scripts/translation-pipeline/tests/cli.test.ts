import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as clientModule from '~/client';
import { getTranslationUnitKey } from '~/domain';
import { run } from '~/run';
import * as translationModule from '~/translate';

describe('E2E: CLI → translator → 파일 출력', () => {
    let workDir: string;

    beforeEach(() => {
        workDir = mkdtempSync(join(tmpdir(), 'e2e-test-'));
        vi.stubEnv('LITELLM_BASE_URL', 'https://example.test');
    });

    afterEach(() => {
        rmSync(workDir, { recursive: true, force: true });
        vi.unstubAllEnvs();
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
        vi.spyOn(translationModule, 'translateUnits').mockImplementation(
            async (units) =>
                new Map(units.map((unit) => [getTranslationUnitKey(unit), `[ko]${unit.source}`])),
        );
        vi.spyOn(clientModule, 'callLlm').mockResolvedValue({
            content: JSON.stringify({
                evaluations: [
                    { id: 'Button:(description)', verdict: 'PASS', errors: [] },
                    { id: 'Button:size', verdict: 'PASS', errors: [] },
                ],
            }),
        });

        const result = await run(['--input', inputDir, '--output', outputDir]);

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
        vi.spyOn(translationModule, 'translateUnits').mockImplementation(
            async (units) =>
                new Map(
                    units.map((unit) => [
                        getTranslationUnitKey(unit),
                        unit.kind === 'prop.description' && unit.propName === 'size'
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
                            { id: 'Button:(description)', verdict: 'PASS', errors: [] },
                            {
                                id: 'Button:size',
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
                                id: 'Button:size',
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
                    evaluations: [
                        { id: 'Button:size', verdict: 'PASS', errors: [] },
                    ],
                }),
                inputTokens: 0,
                outputTokens: 0,
                cost: 0,
            };
        });

        const result = await run(['--input', inputDir, '--output', outputDir]);

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

/**
 * 특성화 테스트 — 유닛 식별 방식을 바꿔도 산출물이 같아야 한다.
 *
 * mock은 요청에 실린 id를 그대로 echo하므로 키 형식을 모른다. 그래서 식별 방식이
 * `componentIndex:id`에서 `componentDisplayName:propName`으로 바뀌어도 이 테스트는 통과해야 한다.
 */
describe('E2E: 동명 컴포넌트 · 중복 원문', () => {
    let workDir: string;

    beforeEach(() => {
        workDir = mkdtempSync(join(tmpdir(), 'e2e-identity-'));
        vi.stubEnv('LITELLM_BASE_URL', 'https://example.test');
    });

    afterEach(() => {
        rmSync(workDir, { recursive: true, force: true });
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    /** 요청의 id를 그대로 되돌려주는 mock — 키 형식에 의존하지 않는다. */
    function mockLlmEchoingIds(): void {
        vi.spyOn(clientModule, 'callLlm').mockImplementation(async (messages, options) => {
            const request = JSON.parse(messages[1].content) as {
                units: { id: string; source?: string }[];
            };
            if (options.jsonSchema?.name === 'batch_mqm_response') {
                return {
                    content: JSON.stringify({
                        evaluations: request.units.map((unit) => ({
                            id: unit.id,
                            verdict: 'PASS',
                            errors: [],
                        })),
                    }),
                };
            }
            // translation_response · batch_postprocess_response 둘 다 translations[]
            return {
                content: JSON.stringify({
                    translations: request.units.map((unit) => ({
                        id: unit.id,
                        translated: `[ko]${unit.source ?? ''}`,
                    })),
                }),
            };
        });
    }

    function writeIdentityFixture(inputDir: string): void {
        mkdirSync(inputDir, { recursive: true });
        const docs: Record<string, unknown> = {
            // name이 둘 다 'Root' — 이름만으로는 구별되지 않는다
            'avatar-root.json': {
                name: 'Root',
                displayName: 'Avatar.Root',
                description: 'An avatar root.',
                props: [
                    // select-root의 size와 원문이 같다 — 중복 제거 fan-out 경로
                    {
                        name: 'size',
                        type: ['"sm"', '"md"'],
                        required: false,
                        description: 'The size.',
                    },
                ],
            },
            'select-root.json': {
                name: 'Root',
                displayName: 'Select.Root',
                description: 'A select root.',
                props: [
                    {
                        name: 'size',
                        type: ['"sm"', '"md"'],
                        required: false,
                        description: 'The size.',
                    },
                    { name: 'disabled', type: ['boolean'], required: false },
                ],
            },
            // displayName이 없는 문서 (실제 입력에 6개 있다) — name이 이미 정규화돼 있다
            'spinner.json': { name: 'Spinner', description: 'A spinner.', props: [] },
        };
        for (const [fileName, content] of Object.entries(docs)) {
            writeFileSync(join(inputDir, fileName), JSON.stringify(content), 'utf-8');
        }
    }

    function readKo(outputDir: string, fileName: string) {
        return JSON.parse(readFileSync(join(outputDir, 'ko', fileName), 'utf-8')) as {
            name: string;
            description?: string;
            props: { name: string; description?: string; type?: string[] }[];
        };
    }

    it('name이 겹치는 두 문서가 서로의 번역을 덮어쓰지 않는다', async () => {
        const inputDir = join(workDir, 'en');
        const outputDir = join(workDir, 'out');
        writeIdentityFixture(inputDir);
        mockLlmEchoingIds();

        const result = await run(['--input', inputDir, '--output', outputDir]);
        expect(result.writtenFiles).toHaveLength(3);

        const avatar = readKo(outputDir, 'avatar-root.json');
        const select = readKo(outputDir, 'select-root.json');

        // 핵심: 두 'Root'의 컴포넌트 설명이 각자의 원문에서 나왔다
        expect(avatar.description).toBe('[ko]An avatar root.');
        expect(select.description).toBe('[ko]A select root.');

        // 원문이 같은 prop은 양쪽 모두 채워진다 (중복 제거 후 fan-out)
        expect(avatar.props[0].description).toBe('[ko]The size.');
        expect(select.props[0].description).toBe('[ko]The size.');

        // 번역 대상이 아닌 필드는 원본 유지
        expect(select.props[0].type).toEqual(['"sm"', '"md"']);
        expect(select.props[1].description).toBeUndefined();

        // displayName이 없는 문서도 처리된다
        expect(readKo(outputDir, 'spinner.json').description).toBe('[ko]A spinner.');
    });
});
