/**
 * extract() assembly tests
 *
 * The unit tests cover each stage in isolation; this covers the wiring between
 * them — tsconfig setup, config -> FilterConfig mapping, output file naming,
 * bytes actually landing on disk, and recovery when one file fails.
 */
import { extract } from '#app/extract';
import { defaultExtractorConfig } from '#domain/config/defaults';
import type { ExtractorConfig } from '#domain/config/schema';
import type { Reporter } from '#domain/reporter';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const TSCONFIG = JSON.stringify({
    compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        strict: true,
        skipLibCheck: true,
    },
    include: ['**/*.ts', '**/*.tsx'],
});

const BADGE_SOURCE = `
export namespace BadgeRoot {
    export type Props = {
        /** 뱃지 라벨 */
        label: string;
        /** 뱃지 크기 */
        size?: 'sm' | 'md' | 'lg';
        /** 스크린리더 레이블 */
        'aria-label'?: string;
    };
}

/** 상태를 표시하는 뱃지. */
export const BadgeRoot = ({ size = 'md', ...props }: BadgeRoot.Props) => ({ size, ...props });
`;

interface Fixture {
    root: string;
    componentFile: string;
    outputDir: string;
}

function createFixture(): Fixture {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-api-extractor-extract-'));
    const componentFile = path.join(root, 'badge.tsx');

    fs.writeFileSync(path.join(root, 'tsconfig.json'), TSCONFIG);
    fs.writeFileSync(componentFile, BADGE_SOURCE);

    return { root, componentFile, outputDir: path.join(root, 'out') };
}

function createConfig(fixture: Fixture) {
    return {
        ...defaultExtractorConfig,
        inputPath: fixture.root,
        tsconfig: path.join(fixture.root, 'tsconfig.json'),
        outputDir: fixture.outputDir,
    } satisfies ExtractorConfig;
}

function createRecordingReporter(): Reporter & { warnings: string[] } {
    const warnings: string[] = [];

    return {
        warnings,
        info: () => {},
        debug: () => {},
        warn: (message) => {
            warnings.push(message);
        },
    };
}

function runExtract(fixture: Fixture, options: Partial<Parameters<typeof extract>[0]> = {}) {
    return extract({
        tsconfigPath: path.join(fixture.root, 'tsconfig.json'),
        targetFiles: [fixture.componentFile],
        config: createConfig(fixture),
        ...options,
    });
}

describe('extract', () => {
    let fixture: Fixture;

    beforeEach(() => {
        fixture = createFixture();
    });

    afterEach(() => {
        fs.rmSync(fixture.root, { recursive: true, force: true });
    });

    it('컴포넌트당 kebab-case JSON 파일 하나를 쓴다', () => {
        const result = runExtract(fixture);

        expect(result.writtenFiles).toEqual([path.join(fixture.outputDir, 'badge-root.json')]);
        expect(fs.existsSync(result.writtenFiles[0])).toBe(true);
    });

    it('removeStale이면 이번에 쓰지 않은 추출 JSON을 지우고 다른 JSON은 남긴다', () => {
        const stale = path.join(fixture.outputDir, 'removed-part.json');
        const unrelated = path.join(fixture.outputDir, 'package.json');
        fs.mkdirSync(fixture.outputDir, { recursive: true });
        fs.writeFileSync(stale, JSON.stringify({ name: 'RemovedPart', props: [] }));
        fs.writeFileSync(unrelated, JSON.stringify({ name: 'not-extractor-output' }));

        runExtract(fixture, { removeStale: true });

        expect(fs.readdirSync(fixture.outputDir).sort()).toEqual([
            'badge-root.json',
            'package.json',
        ]);
    });

    it('removeStale이 없으면 기존 파일을 지우지 않는다', () => {
        const stale = path.join(fixture.outputDir, 'removed-part.json');
        fs.mkdirSync(fixture.outputDir, { recursive: true });
        fs.writeFileSync(stale, JSON.stringify({ name: 'RemovedPart', props: [] }));

        runExtract(fixture);

        expect(fs.existsSync(stale)).toBe(true);
    });

    it('디스크에 쓰인 바이트가 반환된 props와 일치한다', () => {
        const result = runExtract(fixture);
        const written = JSON.parse(fs.readFileSync(result.writtenFiles[0], 'utf8'));

        expect(written).toEqual(result.props[0]);
    });

    it('설명·기본값·필수 여부를 끝까지 전달한다', () => {
        const { props } = runExtract(fixture);

        expect(props[0].name).toBe('BadgeRoot');
        expect(props[0].description).toBe('상태를 표시하는 뱃지.');
        expect(props[0].props).toEqual([
            { name: 'label', type: ['string'], required: true, description: '뱃지 라벨' },
            {
                name: 'size',
                type: ['sm', 'md', 'lg'],
                required: false,
                description: '뱃지 크기',
                defaultValue: 'md',
            },
        ]);
    });

    it('Props를 interface로 선언한 컴포넌트도 추출한다', () => {
        const sheetFile = path.join(fixture.root, 'sheet.tsx');
        fs.writeFileSync(
            sheetFile,
            `
export namespace SheetRoot {
    export interface Props {
        /** 열림 여부 */
        open?: boolean;
    }
}

/** 화면 가장자리에서 열리는 패널. */
export const SheetRoot = (props: SheetRoot.Props) => props;
`,
        );

        const { props } = runExtract(fixture, { targetFiles: [sheetFile] });

        expect(props).toEqual([
            {
                name: 'SheetRoot',
                description: '화면 가장자리에서 열리는 패널.',
                props: [
                    { name: 'open', type: ['boolean'], required: false, description: '열림 여부' },
                ],
            },
        ]);
    });

    it('filterHtml 설정이 필터 단계까지 전달된다', () => {
        const names = runExtract(fixture).props[0].props.map((prop) => prop.name);
        expect(names).not.toContain('aria-label');

        const kept = extract({
            tsconfigPath: path.join(fixture.root, 'tsconfig.json'),
            targetFiles: [fixture.componentFile],
            config: { ...createConfig(fixture), filterHtml: false },
        });
        expect(kept.props[0].props.map((prop) => prop.name)).toContain('aria-label');
    });

    it('읽을 수 없는 파일은 경고만 남기고 나머지를 계속 처리한다', () => {
        const reporter = createRecordingReporter();

        const result = runExtract(fixture, {
            targetFiles: [path.join(fixture.root, 'missing.tsx'), fixture.componentFile],
            reporter,
        });

        expect(result.props).toHaveLength(1);
        expect(reporter.warnings).toEqual([
            'Failed to extract props for missing: source file not found',
        ]);
    });
});
