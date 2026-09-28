import path from 'node:path';

const kebabCase = (str: string): string => {
    if (!str) return '';

    const WORD_PATTERN = [
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)/, // 대문자 연속 (예: XML, JSON)
        /[A-Z]?[a-z]+[0-9]*/, // 일반 단어 (예: hello, World1)
        /[A-Z]/, // 남은 대문자 하나
        /[0-9]+/, // 숫자 뭉치
    ];

    const regex = new RegExp(WORD_PATTERN.map((r) => r.source).join('|'), 'g');
    const words = str.match(regex) || [];

    return words.map((word) => word.toLowerCase()).join('-');
};

interface Identifiers {
    hash: string;
    filePath: string;
    debugId?: string;
}

export const identifiers = ({ hash, filePath, debugId }: Identifiers): string => {
    const componentName = path.basename(filePath, '.css.ts');
    const prefix = componentName === 'sprinkles' ? 'v' : componentName;

    const cleanId = debugId ? debugId.replace('-default', '').replace('_', '-') : '';
    const id = kebabCase(cleanId);

    return `${prefix}${id ? `-${id}` : ''}-${hash}`;
};
