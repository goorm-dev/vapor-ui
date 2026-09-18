import type { Dictionary, Unit } from '~/translate/core/document';

export interface Plan {
    /** 중복을 제거한 원문. 같은 문장이 여러 prop에 걸리므로 유닛 수보다 훨씬 적다. */
    sources: string[];
    /** 사전에 없어 번역이 필요한 원문. */
    misses: string[];
}

/** 유닛과 사전을 견줘 무엇을 번역해야 하는지 정한다. LLM도 파일도 모른다. */
export function planTranslation(units: readonly Unit[], dictionary: Dictionary): Plan {
    const sources = [...new Set(units.map((unit) => unit.source))];

    return {
        sources,
        misses: sources.filter((source) => !dictionary.has(source)),
    };
}
