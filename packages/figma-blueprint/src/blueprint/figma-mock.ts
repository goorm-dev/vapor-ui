// The `figma` module Code Connect templates import, backed by a Figma REST node tree instead of Figma's servers.
// A template runs as a function (see ship/templates.ts), so `figma.selectedInstance` / `figma.batch` read the top of a
// stack. Nested templates are not run inline: executeTemplate() returns an INSTANCE section, rendered as a marker that
// blueprint.ts uses to find which element the nested instance sits in.
import type { Batch } from '~/entries/code-connect';
import { FIGMA_KEY } from '~/ship/templates';

export interface FigmaNode {
    id: string;
    name: string;
    type: string;
    visible?: boolean;
    children?: FigmaNode[];
    componentId?: string;
    componentProperties?: Record<string, { value: string | boolean }>;
    componentPropertyReferences?: Record<string, string>;
    characters?: string;
    absoluteBoundingBox?: Rect | null;
    absoluteRenderBounds?: Rect | null;
    layoutPositioning?: string;
    // A property → one alias, a list per paint or text range (fills, fontSize), or a map per corner or axis
    // (rectangleCornerRadii, size).
    boundVariables?: Record<string, Alias | Alias[] | Record<string, Alias>>;
}

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Alias {
    type: 'VARIABLE_ALIAS';
    id: string;
}

export interface Context {
    handle: object;
    batch: Batch | null;
    // Copy a template read from Figma text during this run; blueprint.ts turns props holding it into "*".
    texts: Set<unknown>;
}

interface InstanceSection {
    type: 'INSTANCE';
    guid: string;
}

const code = (strings: readonly string[], ...values: unknown[]) => ({
    type: 'SECTIONS',
    language: 'typescript',
    sections: [
        { type: 'CODE', code: strings.reduce((acc, s, i) => acc + render(values[i - 1]) + s) },
    ],
});

export function render(v: unknown): string {
    if (v == null || v === false) return '';
    if (Array.isArray(v)) return v.map(render).join('');
    if (typeof v !== 'object') return String(v);
    const section = v as { type?: string; sections?: unknown; code?: string; guid?: string };
    if (section.type === 'SECTIONS') return render(section.sections);
    if (section.type === 'CODE') return section.code ?? '';
    if (section.type === 'INSTANCE') return `<__nested id="${section.guid}" />`;
    return '';
}

// figma.helpers.react, as far as composites' figma-utils uses it: props render as JSX attribute fragments.
const react = {
    renderProp(name: string, v: unknown) {
        if (v == null || v === false || v === '') return '';
        if (v === true) return ` ${name}`;
        if (typeof v === 'string') return ` ${name}="${v}"`;
        if (typeof v === 'number') return ` ${name}={${v}}`;
        return code([` ${name}={`, '}'], v);
    },
    renderChildren: (v: unknown) => v ?? '',
};

const top = () => {
    const ctx = stack.at(-1);
    if (!ctx) throw new Error('figma used outside a template run');
    return ctx;
};

const standIn = {
    stack: [] as Context[],
    code,
    helpers: { react },
    get selectedInstance() {
        return top().handle;
    },
    get currentLayer() {
        return top().handle;
    },
    get batch() {
        return top().batch ?? {};
    },
};
// One stand-in per process, with the run stack on it: a template binds the first one registered, so a second copy of
// this module (another install, a test runner re-evaluating the package) must run templates through the same one.
const { stack } = ((globalThis as unknown as Record<symbol, typeof standIn>)[FIGMA_KEY] ??=
    standIn);

export function withContext<T>(ctx: Context, fn: () => T): T {
    stack.push(ctx);
    try {
        return fn();
    } finally {
        stack.pop();
    }
}

const errorHandle = (message: string) => ({
    type: 'ERROR',
    message,
    executeTemplate: () => ({ example: [] }),
    __render__: () => [],
});

export interface Connection<E> {
    id: string | null;
    entry: E;
}

type Visit = { traverseInstances?: boolean } | undefined;

// connected(node) answers whether the node has a template, the hook blueprint.ts provides.
export function makeHandles<E>(tree: { connected(n: FigmaNode): Connection<E> | null }) {
    const cache = new Map<string, object>();
    const visible = (n: FigmaNode) => n.visible !== false;
    const prop = (n: FigmaNode, name: string) => {
        const props = n.componentProperties ?? {};
        return (
            props[name] ?? Object.entries(props).find(([k]) => k.replace(/#.*/, '') === name)?.[1]
        );
    };
    // Layers a template sees as children: instances and text. Frames, groups and SLOT nodes are see-through.
    const layers = (n: FigmaNode): FigmaNode[] =>
        (n.children ?? [])
            .filter(visible)
            .flatMap((c) => (c.type === 'INSTANCE' || c.type === 'TEXT' ? [c] : layers(c)));
    // Descendants, entering plain instances (🟨 slot layers) but not connected ones unless traverseInstances.
    function* walk(n: FigmaNode, opts?: Visit): Generator<FigmaNode> {
        for (const c of layers(n)) {
            yield c;
            if (c.type === 'INSTANCE' && (opts?.traverseInstances || !tree.connected(c)))
                yield* walk(c, opts);
        }
    }
    function* nodes(n: FigmaNode): Generator<FigmaNode> {
        for (const c of (n.children ?? []).filter(visible)) {
            yield c;
            yield* nodes(c);
        }
    }

    const textHandle = (n: FigmaNode) => {
        top().texts.add(n.characters);
        return {
            type: 'TEXT',
            name: n.name,
            textContent: n.characters,
            __render__: () => n.characters,
        };
    };
    const wrap = (n: FigmaNode): object => (n.type === 'TEXT' ? textHandle(n) : handle(n));

    function handle(n: FigmaNode): object {
        const cached = cache.get(n.id);
        if (cached) return cached;
        const h = {
            type: 'INSTANCE',
            id: n.id,
            name: n.name,
            symbolId: n.componentId,
            get children() {
                return layers(n).map(wrap);
            },
            get properties() {
                return Object.fromEntries(
                    Object.entries(n.componentProperties ?? {}).map(([k, v]) => [
                        k.replace(/#.*/, ''),
                        { value: v.value },
                    ]),
                );
            },
            codeConnectId: () => tree.connected(n)?.id ?? null,
            hasCodeConnect: () => !!tree.connected(n),
            getPropertyValue: (name: string) => prop(n, name)?.value ?? errorHandle(name),
            // ponytail: copy never reaches the blueprint, so a missing text property (older component copies)
            // answers '' instead of failing the whole template the way Figma's drift check would.
            getString(name: string) {
                const v = prop(n, name)?.value ?? '';
                top().texts.add(v);
                return v;
            },
            getBoolean(name: string, options?: Record<string, unknown>) {
                const v = prop(n, name)?.value;
                if (v === undefined) return undefined;
                return options ? options[String(v)] : v === true || v === 'true';
            },
            getEnum(name: string, options: Record<string, unknown>) {
                const v = prop(n, name)?.value;
                return v === undefined ? undefined : options[String(v)];
            },
            // The swapped-in layer is the child bound to the property, not the property's value (a component id
            // that can differ from what the layer shows).
            getInstanceSwap(name: string) {
                const hit = [...walk(n)].find(
                    (c) =>
                        c.componentPropertyReferences?.mainComponent?.replace(/#.*/, '') === name,
                );
                return hit ? handle(hit) : errorHandle(name);
            },
            getSlot(name: string) {
                const slot = [...nodes(n)].find(
                    (c) =>
                        c.type === 'SLOT' &&
                        c.componentPropertyReferences?.slotContentId?.replace(/#.*/, '') === name,
                );
                if (!slot) return undefined;
                const inside = [...walk(slot)].filter(
                    (c) => c.type === 'INSTANCE' && tree.connected(c),
                );
                return Object.assign(
                    inside.map((c): InstanceSection => ({ type: 'INSTANCE', guid: c.id })),
                    { connectedInstances: inside.map(handle) },
                );
            },
            findInstance(layerName: string, opts?: Visit) {
                const hit = [...walk(n, opts)].find(
                    (c) => c.type === 'INSTANCE' && c.name === layerName,
                );
                return hit ? handle(hit) : errorHandle(layerName);
            },
            findText(layerName: string, opts?: Visit) {
                const hit = [...walk(n, opts)].find(
                    (c) => c.type === 'TEXT' && c.name === layerName,
                );
                return hit ? textHandle(hit) : errorHandle(layerName);
            },
            findConnectedInstance(id: string, opts?: Visit) {
                const hit = [...walk(n, opts)].find(
                    (c) => c.type === 'INSTANCE' && tree.connected(c)?.id === id,
                );
                return hit ? handle(hit) : null;
            },
            findConnectedInstances: (fn: (h: object) => boolean, opts?: Visit) =>
                [...walk(n, opts)]
                    .filter((c) => c.type === 'INSTANCE' && tree.connected(c))
                    .map(handle)
                    .filter(fn),
            findLayers: (fn: (h: object) => boolean, opts?: Visit) =>
                [...walk(n, opts)].map(wrap).filter(fn),
            executeTemplate: (): { example: InstanceSection[] } => ({
                example: tree.connected(n) ? [{ type: 'INSTANCE', guid: n.id }] : [],
            }),
        };
        cache.set(n.id, h);
        return h;
    }
    return handle;
}
