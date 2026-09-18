import type { PropsInfoJson } from '~/domain/output';

/** 추출 JSON 안에서 번역 대상이 되는 설명문 한 곳. */
export interface Unit {
    /** 추출 JSON 파일 이름. 예: `badge.json` */
    file: string;
    /** 문서 안의 위치. 예: `description`, `props.size.description` */
    path: string;
    /** 영어 원문. 사전의 키이기도 하다. */
    source: string;
}

/** 영어 원문 → 한국어. 키가 원문 그 자체라 이 사전이 곧 영어 원문 스냅샷이다. */
export type Dictionary = ReadonlyMap<string, string>;

/**
 * 문서 하나에서 번역 대상을 모은다.
 *
 * 이 함수가 `applyDictionary`와 짝을 이루는 유일한 순회 정의다. 수집과 적용이
 * 갈리면 검증은 통과하는데 적용은 다르게 되므로, 두 명령 모두 여기만 쓴다.
 */
export function collectUnits(file: string, doc: PropsInfoJson): Unit[] {
    const units: Unit[] = [];

    if (doc.description) units.push({ file, path: 'description', source: doc.description });

    for (const prop of doc.props ?? []) {
        if (prop.description) {
            units.push({
                file,
                path: `props.${prop.name}.description`,
                source: prop.description,
            });
        }
    }

    return units;
}

export interface ApplyResult {
    doc: PropsInfoJson;
    /** 사전에 있어 치환된 설명문 수. */
    applied: number;
    /** 사전에 없어 영어로 남은 설명문 수. */
    kept: number;
}

/**
 * 사전을 문서에 적용한다. 사전에 없는 원문은 영어 그대로 남긴다 —
 * 키를 지우면 사이트의 파일 단위 폴백이 걸리지 않아 설명이 화면에서 사라진다.
 */
export function applyDictionary(doc: PropsInfoJson, dictionary: Dictionary): ApplyResult {
    let applied = 0;
    let kept = 0;

    const translate = (text: string): string => {
        const ko = dictionary.get(text);
        if (ko === undefined) {
            kept++;
            return text;
        }
        applied++;
        return ko;
    };

    return {
        doc: {
            ...doc,
            ...(doc.description ? { description: translate(doc.description) } : {}),
            props: (doc.props ?? []).map((prop) =>
                prop.description
                    ? { ...prop, description: translate(prop.description) }
                    : { ...prop },
            ),
        },
        applied,
        kept,
    };
}
