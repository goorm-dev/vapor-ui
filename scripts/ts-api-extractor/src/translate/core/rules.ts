/** 용어 사전. `avoid` 표기가 번역에 나타나면 검증에서 실패한다. */
export interface Terms {
    terms: { term: string; use: string; avoid?: string[] }[];
    sentencePatterns: { en: string; ko: string }[];
}

export interface Rule {
    name: string;
    label: string;
    /** 위반이면 사유를, 통과면 `null`을 돌려준다. */
    check: (source: string, ko: string, terms: Terms) => string | null;
}

const codeSpans = (text: string): string[] => (text.match(/`[^`]+`/g) ?? []).sort();
const hasHangul = (text: string): boolean => /[가-힣]/.test(text);

/**
 * 사전 항목 하나에 걸리는 검증 규칙.
 *
 * 규칙을 늘릴 때는 이 배열에 추가만 한다 — 실행 쪽은 건드리지 않는다.
 */
export const rules: Rule[] = [
    {
        name: 'EMPTY',
        label: '빈 번역',
        check: (_source, ko) => (ko.trim() ? null : '빈 번역'),
    },
    {
        name: 'SPAN',
        label: '코드 스팬 훼손',
        check: (source, ko) => {
            const before = codeSpans(source);
            const after = codeSpans(ko);
            if (JSON.stringify(before) === JSON.stringify(after)) return null;
            return `코드 스팬 불일치: ${JSON.stringify(before)} -> ${JSON.stringify(after)}`;
        },
    },
    {
        name: 'UNTRANSLATED',
        label: '미번역',
        check: (_source, ko) => (hasHangul(ko) ? null : `한글 없음: ${ko.slice(0, 50)}`),
    },
    {
        name: 'TERM',
        label: '용어 사전 위반',
        check: (_source, ko, terms) => {
            for (const entry of terms.terms) {
                for (const bad of entry.avoid ?? []) {
                    if (ko.includes(bad)) return `"${bad}" 대신 "${entry.use}" (${entry.term})`;
                }
            }
            return null;
        },
    },
];

export interface Finding {
    rule: string;
    label: string;
    source: string;
    detail: string;
}

/** 사전 전체에 규칙을 적용한다. 빈 번역이면 나머지 규칙은 건너뛴다. */
export function checkDictionary(dictionary: ReadonlyMap<string, string>, terms: Terms): Finding[] {
    const findings: Finding[] = [];

    for (const [source, ko] of dictionary) {
        for (const rule of rules) {
            const detail = rule.check(source, ko, terms);
            if (detail === null) continue;

            findings.push({ rule: rule.name, label: rule.label, source, detail });
            if (rule.name === 'EMPTY') break;
        }
    }

    return findings;
}
