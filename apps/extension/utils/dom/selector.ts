const escapeIdent = (value: string) =>
    typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(value) : value.replace(/[^\w-]/g, '\\$&');

const nthOfType = (element: Element) => {
    const parent = element.parentElement;
    if (!parent) return '';

    const sameTag = Array.from(parent.children).filter(
        (child) => child.tagName === element.tagName,
    );
    if (sameTag.length <= 1) return '';

    return `:nth-of-type(${sameTag.indexOf(element) + 1})`;
};

const segment = (element: Element) => {
    const tag = element.tagName.toLowerCase();
    if (element.id) return `#${escapeIdent(element.id)}`;

    return `${tag}${nthOfType(element)}`;
};

/**
 * 요소를 가리키는 안정적인 CSS selector 문자열을 만든다.
 * id가 있으면 거기서 멈추고, 없으면 nth-of-type으로 부모 체인을 따라 올라간다.
 */
export const buildSelector = (element: Element): string => {
    const path: string[] = [];
    let current: Element | null = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
        const part = segment(current);
        path.unshift(part);

        if (part.startsWith('#')) break;
        current = current.parentElement;
    }

    return path.join(' > ');
};
