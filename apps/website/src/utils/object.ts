/**
 * 주어진 배열의 객체를 변환하여 각 객체의 특정 속성 값을 키로 갖는 새로운 객체를 반환합니다.
 *
 * @param {Array<T>} data - 변환할 객체들의 배열.
 * @param {keyof T} key - 객체의 속성 중 키로 사용할 속성 이름.
 * @returns {Record<string, Omit<T, K>>} 각 객체의 특정 속성 값을 키로 갖는 새로운 객체.
 * @example
 * const data = [
 *   { name: 'Alert', description: 'Alerts Description' },
 *   { name: 'Button', description: 'Button Description' },
 * ];
 *
 * const result = arrayToObjectByKey(data, 'name');
 * console.log(result);
 * // {
 * //   Alert: { description: 'Alerts Description' },
 * //   Button: { description: 'Button Description' },
 * // }
 */
export const arrayToObjectByKey = <T, K extends keyof T>(
    data: T[],
    key: K,
): Record<string, Omit<T, K>> => {
    return data.reduce(
        (acc, item) => {
            const { [key]: keyValue, ...rest } = item;
            return {
                ...acc,
                [keyValue as unknown as string]: rest,
            };
        },
        {} as Record<string, Omit<T, K>>,
    );
};

export function sortByNumericKey(a: { name: string }, b: { name: string }) {
    const numA = parseInt(a.name.split('-').pop() || '0', 10);
    const numB = parseInt(b.name.split('-').pop() || '0', 10);
    return numA - numB;
}
