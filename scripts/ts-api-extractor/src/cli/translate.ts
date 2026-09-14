import meow from 'meow';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadExtractorConfig } from '~/config/loader';
import { applyDictionary, collectUnits } from '~/translate/core/document';
import { planTranslation } from '~/translate/core/plan';
import type { Translator } from '~/translate/core/translator';
import {
    readDictionary,
    readDocs,
    readTerms,
    writeDictionary,
    writeDoc,
} from '~/translate/infra/json-store';
import { createLlmTranslator } from '~/translate/infra/llm-translator';

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DICTIONARY_PATH = path.join(PACKAGE_ROOT, 'translations.ko.json');
const TERMS_PATH = path.join(PACKAGE_ROOT, 'terms.json');

let spent = 0;

async function runCli(): Promise<void> {
    const cli = meow(
        `
  Usage
    $ ts-api-extractor-translate

  추출된 API 문서의 영어 설명문을 커밋된 사전으로 한국어화한다.
  사전에 있는 원문은 다시 번역하지 않으므로 결과가 개발자마다 달라지지 않는다.

  Options
    --config          Config file path (추출과 같은 outputDir을 쓴다)
    --batch           번역 배치 크기 (default: 40)
    --apply-only      사전 적용만 한다. 사전에 없는 원문이 있으면 실패한다 (CI용)

  Examples
    $ ts-api-extractor-translate
    $ ts-api-extractor-translate --apply-only
`,
        {
            importMeta: import.meta,
            flags: {
                config: { type: 'string' },
                batch: { type: 'number', default: 40 },
                applyOnly: { type: 'boolean', default: false },
            },
        },
    );

    const { config: configPath, batch, applyOnly } = cli.flags;

    if (!Number.isInteger(batch) || batch < 1) {
        throw new Error(`--batch 값이 잘못되었습니다: ${batch}`);
    }

    const config = await loadExtractorConfig({ configPath });
    const outputDir = path.resolve(process.cwd(), config.outputDir);

    const docs = readDocs(outputDir);
    const units = docs.flatMap(({ file, doc }) => collectUnits(file, doc));
    const dictionary = readDictionary(DICTIONARY_PATH);
    const { sources, misses } = planTranslation(units, dictionary);

    console.log(`추출 파일   : ${docs.length}`);
    console.log(`고유 원문   : ${sources.length}`);
    console.log(`사전 보유   : ${dictionary.size}`);
    console.log(`번역 필요   : ${misses.length}`);

    if (misses.length > 0) {
        // --apply-only는 Translator를 주입하지 않는 것으로 표현된다.
        // "CI에서는 번역 금지"라는 규칙이 분기가 아니라 조립의 문제가 된다.
        const translator: Translator | null = applyOnly
            ? null
            : await createLlmTranslator({
                  terms: readTerms(TERMS_PATH),
                  batchSize: batch,
                  onProgress: (done, total) => console.log(`  번역 ${done}/${total}건`),
                  onCost: (usd) => (spent += usd),
              });

        if (!translator) {
            throw new Error(
                `번역되지 않은 원문 ${misses.length}건. 로컬에서 pnpm api-docs 실행 후 커밋하세요.\n` +
                    misses
                        .slice(0, 5)
                        .map((source) => `  - ${source.slice(0, 80)}`)
                        .join('\n'),
            );
        }

        for (const [source, ko] of await translator(misses)) dictionary.set(source, ko);

        writeDictionary(DICTIONARY_PATH, dictionary);
        console.log(`사전 갱신   : ${dictionary.size}건 (누적 $${spent.toFixed(4)})`);
    }

    let applied = 0;
    let kept = 0;
    for (const { fullPath, doc } of docs) {
        const result = applyDictionary(doc, dictionary);
        writeDoc(fullPath, result.doc);
        applied += result.applied;
        kept += result.kept;
    }

    console.log(`적용        : ${applied}건 번역, ${kept}건 영어 유지`);
}

runCli().catch((error: unknown) => {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
});
