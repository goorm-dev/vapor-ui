import fs from 'node:fs';
import path from 'node:path';

import type { PropsInfoJson } from '~/models/output';
import { serializePropsInfo } from '~/stages/write';
import type { Dictionary } from '~/translate/core/document';
import type { Terms } from '~/translate/core/rules';

export interface DocFile {
    /** 파일 이름. 예: `badge.json` */
    file: string;
    fullPath: string;
    doc: PropsInfoJson;
}

const readJson = <T>(filePath: string): T => JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;

/** 추출 디렉터리의 JSON을 이름순으로 읽는다. */
export function readDocs(dir: string): DocFile[] {
    return fs
        .readdirSync(dir)
        .filter((file) => file.endsWith('.json'))
        .sort()
        .map((file) => {
            const fullPath = path.join(dir, file);
            try {
                return { file, fullPath, doc: readJson<PropsInfoJson>(fullPath) };
            } catch {
                throw new Error(`JSON 파싱 실패: ${fullPath}`);
            }
        });
}

/** 추출 단계와 같은 직렬화를 쓴다 — 들여쓰기가 갈리면 전 파일이 diff로 뜬다. */
export function writeDoc(fullPath: string, doc: PropsInfoJson): void {
    fs.writeFileSync(fullPath, serializePropsInfo(doc), 'utf8');
}

export function readDictionary(filePath: string): Map<string, string> {
    if (!fs.existsSync(filePath)) return new Map();
    return new Map(Object.entries(readJson<Record<string, string>>(filePath)));
}

/** 키(영어 원문)순으로 저장한다. 정렬이 고정돼야 diff가 읽힌다. */
export function writeDictionary(filePath: string, dictionary: Dictionary): void {
    const sorted = [...dictionary.keys()].sort().map((key) => [key, dictionary.get(key)!] as const);
    const json = JSON.stringify(Object.fromEntries(sorted), null, 2);
    fs.writeFileSync(filePath, json + '\n', 'utf8');
}

export function readTerms(filePath: string): Terms {
    return readJson<Terms>(filePath);
}
