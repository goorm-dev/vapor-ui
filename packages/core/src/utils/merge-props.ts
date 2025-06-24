export const isString = (v: unknown): v is string => typeof v === 'string';

export const callAll =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <T extends (...a: any[]) => void>(...fns: (T | undefined)[]) =>
        (...a: Parameters<T>) => {
            fns.forEach(function (fn) {
                fn?.(...a);
            });
        };

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

const clsx = (...args: (string | undefined)[]) =>
    args
        .map((str) => str?.trim?.())
        .filter(Boolean)
        .join(' ');

const CSS_REGEX = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g;

const serialize = (style: string): Record<string, string> => {
    const res: Record<string, string> = {};
    let match: RegExpExecArray | null;
    while ((match = CSS_REGEX.exec(style))) {
        res[match[1]!] = match[2]!;
    }
    return res;
};

const css = (
    a: Record<string, string> | string | undefined,
    b: Record<string, string> | string | undefined,
): Record<string, string> | string => {
    if (isString(a)) {
        if (isString(b)) return `${a};${b}`;
        a = serialize(a);
    } else if (isString(b)) {
        b = serialize(b);
    }
    return Object.assign({}, a ?? {}, b ?? {});
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TupleTypes<T extends any[]> = T[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;

export function mergeProps<T extends Props>(...args: T[]): UnionToIntersection<TupleTypes<T[]>> {
    const result: Props = {};

    for (const props of args) {
        for (const key in result) {
            if (
                key.startsWith('on') &&
                typeof result[key] === 'function' &&
                typeof props[key] === 'function'
            ) {
                result[key] = callAll(props[key], result[key]);
                continue;
            }

            if (key === 'className' || key === 'class') {
                result[key] = clsx(result[key], props[key]);
                continue;
            }

            if (key === 'style') {
                result[key] = css(result[key], props[key]);
                continue;
            }

            result[key] = props[key] !== undefined ? props[key] : result[key];
        }

        for (const key in props) {
            if (result[key] === undefined) {
                result[key] = props[key];
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
}
