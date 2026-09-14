import meow from 'meow';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkDictionary } from '~/translate/core/rules';
import { readDictionary, readTerms } from '~/translate/infra/json-store';

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DICTIONARY_PATH = path.join(PACKAGE_ROOT, 'translations.ko.json');
const TERMS_PATH = path.join(PACKAGE_ROOT, 'terms.json');
const MAX_PER_KIND = 20;

/**
 * 번역 사전의 내용을 검증한다. LLM 없이 결정론적으로 동작한다.
 *
 * 커버리지(사전이 추출된 원문을 다 덮는가)는 검사하지 않는다 — 그건
 * `translate --apply-only`가 이미 하고, 거기서 실패하면 여기까지 오지 않는다.
 * 덕분에 이 명령은 추출 산출물에 의존하지 않는다.
 */
function runCli(): void {
    meow(
        `
  Usage
    $ ts-api-extractor-verify

  번역 사전의 코드 스팬·용어·미번역을 검증한다.
`,
        { importMeta: import.meta, flags: {} },
    );

    const dictionary = readDictionary(DICTIONARY_PATH);
    const findings = checkDictionary(dictionary, readTerms(TERMS_PATH));

    console.log(`사전        : ${DICTIONARY_PATH}`);
    console.log(`항목        : ${dictionary.size}`);
    console.log('');

    if (findings.length === 0) {
        console.log(`요약: 위반 0건 — 사전 ${dictionary.size}개 항목 전부 검증 통과`);
        return;
    }

    const byRule = new Map<string, typeof findings>();
    for (const finding of findings) {
        const list = byRule.get(finding.rule) ?? [];
        list.push(finding);
        byRule.set(finding.rule, list);
    }

    let index = 0;
    for (const [, list] of byRule) {
        for (const finding of list.slice(0, MAX_PER_KIND)) {
            const head = finding.source.slice(0, 90);
            console.log(`[${++index}] ${finding.label}`);
            console.log(`  원문: ${head}${finding.source.length > 90 ? '…' : ''}`);
            console.log(`  사유: ${finding.detail}`);
            console.log('');
        }
        if (list.length > MAX_PER_KIND) {
            console.log(`  … ${list[0]!.label} ${list.length - MAX_PER_KIND}건 더 있음\n`);
        }
    }

    const summary = [...byRule.values()].map((list) => `${list[0]!.label} ${list.length}`);
    console.log(`요약: ${findings.length}건 위반 (${summary.join(', ')})`);
    process.exit(1);
}

runCli();
