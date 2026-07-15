const KEYS = [
    'width',
    'height',
    'color',
    'background-color',
    'font-size',
    'font-weight',
    'font-family',
    'line-height',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'border',
    'border-radius',
    'display',
] as const;

/** 고정 요소의 핵심 CSS를 계산값(px) 문자열로 추출한다. */
export const extractStyle = (element: Element): Record<string, string> => {
    const computed = getComputedStyle(element);
    return Object.fromEntries(KEYS.map((key) => [key, computed.getPropertyValue(key)]));
};
