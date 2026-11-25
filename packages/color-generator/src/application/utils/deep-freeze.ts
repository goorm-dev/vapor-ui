/** Freezes `value` and every object inside it, so a consumer cannot edit a shared table. */
export const deepFreeze = <T>(value: T): T => {
    if (value && typeof value === 'object') {
        Object.values(value).forEach(deepFreeze);
        Object.freeze(value);
    }
    return value;
};
