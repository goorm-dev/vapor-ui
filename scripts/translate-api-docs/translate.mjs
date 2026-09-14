#!/usr/bin/env node
// 추출된 API JSON의 영어 설명문을 한국어로 옮긴다.
//
// 캐시(translations.ko.json)에 이미 있는 원문은 다시 번역하지 않는다. 개발자마다
// 결과가 달라지지 않는 것은 도구를 끄기 때문이 아니라 이 캐시가 커밋되기 때문이다.
// 캐시가 채워져 있으면 LLM을 한 번도 호출하지 않는다.
//
// 사용법: node translate.mjs <extracted-dir> [--cache <path>] [--batch <n>]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = (name, fallback) => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 ? argv[i + 1] : fallback;
};
const die = (msg) => {
    console.error(
        `오류: ${msg}\n사용법: node translate.mjs <extracted-dir> [--cache <path>] [--batch <n>]`,
    );
    process.exit(2);
};

const VALUED = new Set(['--cache', '--batch']);
const positional = [];
for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
        if (VALUED.has(argv[i])) i++;
        continue;
    }
    positional.push(argv[i]);
}
const dir = positional[0];
const cachePath = flag('cache', path.join(HERE, 'translations.ko.json'));
const BATCH = Number(flag('batch', '40'));

if (!dir) die('추출 디렉터리를 지정하세요');
if (!fs.existsSync(dir)) die(`경로 없음: ${dir}`);
if (!Number.isInteger(BATCH) || BATCH < 1) die(`--batch 값이 잘못되었습니다: ${BATCH}`);

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const terms = readJson(path.join(HERE, 'terms.json'));

/** 추출 JSON을 읽어 파일별 파싱 결과를 돌려준다. */
function loadFiles(root) {
    return fs
        .readdirSync(root)
        .filter((f) => f.endsWith('.json'))
        .sort()
        .map((f) => ({ name: f, full: path.join(root, f), data: readJson(path.join(root, f)) }));
}

/** 한 컴포넌트 객체의 모든 description을 fn으로 훑는다. 반환값이 있으면 치환한다. */
function walkDescriptions(data, fn) {
    for (const c of Array.isArray(data) ? data : [data]) {
        if (c?.description) {
            const next = fn(c.description);
            if (next !== undefined) c.description = next;
        }
        for (const p of c?.props ?? []) {
            if (p?.description) {
                const next = fn(p.description);
                if (next !== undefined) p.description = next;
            }
        }
    }
}

const files = loadFiles(dir);
const sources = new Set();
for (const f of files) walkDescriptions(f.data, (t) => void sources.add(t));

const cache = fs.existsSync(cachePath) ? readJson(cachePath) : {};
const missing = [...sources].filter((t) => !(t in cache));

console.log(`추출 파일   : ${files.length}`);
console.log(`고유 원문   : ${sources.size}`);
console.log(`캐시 보유   : ${Object.keys(cache).length}`);
console.log(`번역 필요   : ${missing.length}`);

if (missing.length > 0) {
    // 이 디렉터리는 pnpm 워크스페이스 멤버가 아니다 — 루트 lockfile을 흔들지 않기 위해서다.
    // 번역은 로컬에서만 돌리므로 여기서 한 번 설치한다.
    let query;
    try {
        ({ query } = await import('@anthropic-ai/claude-agent-sdk'));
    } catch {
        die(`의존성이 없습니다. 먼저 설치하세요:\n  (cd ${HERE} && npm install)`);
    }

    const glossary = [
        '용어 사전(반드시 이 표기를 쓴다):',
        ...terms.terms.map(
            (t) =>
                `- ${t.term} → ${t.use}${t.avoid?.length ? `   (X: ${t.avoid.join(', ')})` : ''}`,
        ),
        '',
        '문형:',
        ...terms.sentencePatterns.map((p) => `- ${p.en} → ${p.ko}`),
    ].join('\n');

    const schema = {
        type: 'object',
        additionalProperties: false,
        required: ['translations'],
        properties: {
            translations: {
                type: 'array',
                items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['id', 'ko'],
                    properties: { id: { type: 'string' }, ko: { type: 'string' } },
                },
            },
        },
    };

    let spent = 0;
    for (let i = 0; i < missing.length; i += BATCH) {
        const units = missing.slice(i, i + BATCH).map((text, k) => ({ id: `u${i + k}`, text }));
        process.stdout.write(`  번역 ${i + 1}-${i + units.length} / ${missing.length} … `);

        const res = query({
            prompt: `규칙:
- 백틱 코드 스팬, prop 이름, 타입 이름은 원문 그대로 둔다.
- 원문에 없는 사실을 추가하지 않는다. 설명을 보충하거나 조건을 덧붙이지 않는다.
- 문장체 존댓말(-입니다/-합니다)로 쓴다.

${glossary}

${JSON.stringify(units)}`,
            options: {
                model: 'claude-opus-5',
                systemPrompt: '너는 vapor-ui 디자인 시스템의 API 문서 번역가다. 번역만 한다.',
                // ponytail: 도구를 켜면 모델이 소스를 읽고 원문에 없는 설명을 덧붙인다(실측).
                allowedTools: [],
                maxTurns: 1,
                outputFormat: { type: 'json_schema', schema },
            },
        });

        let got = 0;
        for await (const m of res) {
            if (m.type !== 'result') continue;
            if (m.subtype !== 'success') die(`번역 실패: ${m.subtype}`);
            for (const t of m.structured_output?.translations ?? []) {
                const en = missing[Number(t.id.slice(1))];
                if (en !== undefined && t.ko?.trim()) {
                    cache[en] = t.ko;
                    got++;
                }
            }
            spent += m.total_cost_usd ?? 0;
        }
        console.log(`${got}/${units.length}건`);
        if (got !== units.length)
            die('반환 개수가 요청과 다릅니다. 캐시를 저장하지 않고 중단합니다.');
    }

    const sorted = Object.fromEntries(
        Object.keys(cache)
            .sort()
            .map((k) => [k, cache[k]]),
    );
    fs.writeFileSync(cachePath, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
    console.log(
        `캐시 갱신   : ${cachePath} (총 ${Object.keys(sorted).length}건, $${spent.toFixed(4)})`,
    );
}

// 캐시를 추출 JSON에 적용한다. 캐시에 없는 원문은 영어 그대로 남긴다.
let applied = 0;
let fallback = 0;
for (const f of files) {
    walkDescriptions(f.data, (t) => {
        if (cache[t]) {
            applied++;
            return cache[t];
        }
        fallback++;
        return undefined;
    });
    fs.writeFileSync(f.full, JSON.stringify(f.data, null, 4) + '\n', 'utf8');
}

console.log(`적용        : ${applied}건 번역, ${fallback}건 영어 유지`);
