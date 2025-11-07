type DataAttr = Record<string, string>;

type SingleDataAttrValue = string | number | boolean | null | undefined;
type SingleDataAttrReturn = DataAttr | Record<string, never>;

export function createDataAttribute(key: string, value: SingleDataAttrValue): SingleDataAttrReturn {
    if (value === null || value === undefined) {
        return {};
    }

    const lowerCaseKey = key.toLowerCase();
    const dataKey = `data-${lowerCaseKey}`;

    if (typeof value === 'boolean') {
        return value ? { [dataKey]: '' } : {};
    }

    return { [dataKey]: String(value) };
}

type MultiDataAttrValue = Record<string, SingleDataAttrValue>;
type MultiDataAttrReturn = DataAttr;

export function createDataAttributes(attributes: MultiDataAttrValue): MultiDataAttrReturn {
    return Object.entries(attributes).reduce((acc, [key, value]) => {
        return { ...acc, ...createDataAttribute(key, value) };
    }, {} as MultiDataAttrReturn);
}
