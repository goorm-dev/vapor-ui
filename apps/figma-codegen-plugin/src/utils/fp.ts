/**
 * 함수형 프로그래밍 유틸리티
 *
 * PRD 4.1: 순수 함수 기반 파이프라인 구성
 */

/**
 * pipe: 함수를 왼쪽에서 오른쪽으로 합성
 *
 * @param fns - 합성할 함수들
 * @returns 합성된 함수
 */
export function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
    return (arg: T) => fns.reduce((prev, fn) => fn(prev), arg);
}

/**
 * compose: 함수를 오른쪽에서 왼쪽으로 합성
 *
 * @param fns - 합성할 함수들
 * @returns 합성된 함수
 */
export function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
    return (arg: T) => fns.reduceRight((prev, fn) => fn(prev), arg);
}

/**
 * memoize: 함수 결과를 메모이제이션
 *
 * @param fn - 메모이제이션할 함수
 * @returns 메모이제이션된 함수
 */
export function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
    const cache = new Map<string, ReturnType<T>>();

    return ((...args: Parameters<T>) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn(...args) as ReturnType<T>;
        cache.set(key, result);
        return result;
    }) as T;
}

/**
 * identity: 항등 함수
 */
export function identity<T>(x: T): T {
    return x;
}

/**
 * tap: 값을 변경하지 않고 사이드 이펙트 수행
 */
export function tap<T>(fn: (arg: T) => void): (arg: T) => T {
    return (arg: T) => {
        fn(arg);
        return arg;
    };
}
