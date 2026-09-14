#!/usr/bin/env node
// 추출된 API JSON의 한국어 번역을 검증한다. LLM 없이 결정론적으로 동작한다.
// 사용법: node verify.mjs <extracted-dir> <glossary.json> [--terms <terms.json>]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);

const die = (msg) => {
    console.error(
        `오류: ${msg}\n사용법: node verify.mjs <extracted-dir> <glossary.json> [--terms <terms.json>]`,
    );
    process.exit(2);
};

const positional = argv.filter((a) => !a.startsWith('--'));
const termsFlag = argv.indexOf('--terms');
const termsPath = termsFlag >= 0 ? argv[termsFlag + 1] : path.join(HERE, 'terms.json');
const [dir, glossaryPath] = positional;

if (!dir || !glossaryPath) die('인자가 부족합니다');
if (!fs.existsSync(dir)) die(`경로 없음: ${dir}`);
if (!fs.existsSync(glossaryPath)) die(`경로 없음: ${glossaryPath}`);

/** 추출 JSON 디렉터리에서 번역 대상 문자열을 모은다. */
function collectUnits(root) {
    const units = [];
    for (const fn of fs.readdirSync(root).sort()) {
        if (!fn.endsWith('.json')) continue;
        let raw;
        try {
            raw = JSON.parse(fs.readFileSync(path.join(root, fn), 'utf8'));
        } catch {
            die(`JSON 파싱 실패: ${fn}`);
        }
        for (const [ci, c] of (Array.isArray(raw) ? raw : [raw]).entries()) {
            if (c?.description)
                units.push({ file: fn, where: `[${ci}].description`, text: c.description });
            for (const p of c?.props ?? []) {
                if (p?.description)
                    units.push({ file: fn, where: `[${ci}].props.${p.name}`, text: p.description });
            }
        }
    }
    return units;
}

const codeSpans = (s) => (s.match(/`[^`]+`/g) ?? []).sort();
const hasHangul = (s) => /[가-힣]/.test(s);

const units = collectUnits(dir);
const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));
const terms = JSON.parse(fs.readFileSync(termsPath, 'utf8'));

const unique = [...new Set(units.map((u) => u.text))];
const findings = [];
const add = (kind, en, detail) => findings.push({ kind, en, detail });

// 1) 커버리지 — 모든 고유 원문에 번역이 있는가
for (const en of unique) {
    if (!(en in glossary)) add('MISSING', en, '번역 없음');
}

for (const [en, ko] of Object.entries(glossary)) {
    if (typeof ko !== 'string' || !ko.trim()) {
        add('EMPTY', en, '빈 번역');
        continue;
    }
    // 2) 코드 스팬 보존 — 백틱 안은 원문 그대로여야 한다
    const a = codeSpans(en);
    const b = codeSpans(ko);
    if (JSON.stringify(a) !== JSON.stringify(b)) {
        add('SPAN', en, `코드 스팬 불일치: ${JSON.stringify(a)} -> ${JSON.stringify(b)}`);
    }
    // 3) 미번역 — 한글이 하나도 없다
    if (!hasHangul(ko)) add('UNTRANSLATED', en, `한글 없음: ${ko.slice(0, 50)}`);
    // 4) 용어 사전 위반
    for (const t of terms.terms ?? []) {
        for (const bad of t.avoid ?? []) {
            if (ko.includes(bad)) add('TERM', en, `"${bad}" 대신 "${t.use}" (${t.term})`);
        }
    }
}

const unresolved = units.filter((u) => !(u.text in glossary)).length;

console.log(`대상 디렉터리 : ${path.resolve(dir)}`);
console.log(`총 유닛       : ${units.length}`);
console.log(`고유 원문     : ${unique.length}`);
console.log(`번역 보유     : ${Object.keys(glossary).length}`);
console.log(`미해결 유닛   : ${unresolved}`);
console.log('');

if (findings.length === 0) {
    console.log(`요약: 위반 0건 — 고유 원문 ${unique.length}개 전부 검증 통과`);
    process.exit(0);
}

const byKind = {};
for (const f of findings) (byKind[f.kind] ??= []).push(f);
const LABEL = {
    MISSING: '번역 누락',
    EMPTY: '빈 번역',
    SPAN: '코드 스팬 훼손',
    UNTRANSLATED: '미번역',
    TERM: '용어 사전 위반',
};
let n = 0;
for (const [kind, list] of Object.entries(byKind)) {
    for (const f of list.slice(0, 20)) {
        console.log(`[${++n}] ${LABEL[kind]}`);
        console.log(`  원문: ${f.en.slice(0, 90)}${f.en.length > 90 ? '…' : ''}`);
        console.log(`  사유: ${f.detail}`);
        console.log('');
    }
    if (list.length > 20) console.log(`  … ${LABEL[kind]} ${list.length - 20}건 더 있음\n`);
}
console.log(
    `요약: ${findings.length}건 위반 (${Object.entries(byKind)
        .map(([k, v]) => `${LABEL[k]} ${v.length}`)
        .join(', ')})`,
);
process.exit(1);
