type DataAttr = { [key: string]: string };

type SingleDataAttrValue = string | number | boolean | null | undefined;

type ReturnByValue<T> = T extends null | undefined ? {} : DataAttr;

export function createDataAttribute<T extends SingleDataAttrValue>(
    key: string,
    value: T,
): ReturnByValue<T> {
    if (value == null || value === false) {
        return {} as ReturnByValue<T>;
    }
    return { [`data-${key}`]: value === true ? '' : String(value) } as ReturnByValue<T>;
}

type MultiDataAttrValue = Record<string, SingleDataAttrValue>;
type MultiDataAttrReturn = DataAttr;

export function createDataAttributes(attributes: MultiDataAttrValue): MultiDataAttrReturn {
    return Object.entries(attributes).reduce((acc, [key, value]) => {
        return { ...acc, ...createDataAttribute(key, value) };
    }, {} as MultiDataAttrReturn);
}
