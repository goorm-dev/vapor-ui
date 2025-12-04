type DataAttr = Record<string, string>;

type Falsy = null | undefined | false;

type SingleDataAttrValue = string | number | boolean | null | undefined;

type ReturnByValue<T> = T extends Falsy ? {} : DataAttr;

export function createDataAttribute<T extends SingleDataAttrValue>(
    key: string,
    value: T,
): ReturnByValue<T> {
    if (value == null || value === false) {
        return {};
    }

    const lowerCaseKey = key.toLowerCase();
    const dataKey = `data-${lowerCaseKey}`;

    return {
        [dataKey]: value === true ? '' : String(value),
    };
}

type MultiDataAttrValue = Record<string, SingleDataAttrValue>;
type MultiDataAttrReturn = DataAttr;

export function createDataAttributes(attributes: MultiDataAttrValue): MultiDataAttrReturn {
    return Object.entries(attributes).reduce((acc, [key, value]) => {
        return { ...acc, ...createDataAttribute(key, value) };
    }, {} as MultiDataAttrReturn);
}
