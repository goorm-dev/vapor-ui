type PossibleRef<T> = React.Ref<T | null> | undefined;

type Cleanup = () => void;

/**
 * Assigns `node` to one ref and returns how to detach it: the cleanup a React 19 callback ref
 * returned, or a call that clears the ref with `null`.
 */
function attachRef<T>(ref: PossibleRef<T>, node: T): Cleanup | undefined {
    if (typeof ref === 'function') {
        const refCleanup = ref(node);

        return typeof refCleanup === 'function' ? refCleanup : () => ref(null);
    }

    if (ref !== null && ref !== undefined) {
        (ref as React.RefObject<T | null>).current = node;

        return () => {
            (ref as React.RefObject<T | null>).current = null;
        };
    }

    return undefined;
}

/**
 * Merges refs into one callback ref.
 *
 * Detaching runs the cleanup a callback ref returned (React 19) instead of calling it with `null`,
 * so the cleanup is kept on React 17/18 too, where React itself ignores the returned function.
 */
export function composeRefs<T>(...refs: PossibleRef<T>[]): (node: T | null) => void {
    let cleanups: (Cleanup | undefined)[] = [];

    return (node) => {
        cleanups.forEach((cleanup) => {
            cleanup?.();
        });
        cleanups = [];

        if (node !== null) {
            cleanups = refs.map((ref) => attachRef(ref, node));
        }
    };
}
