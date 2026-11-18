import type { FigmaNode } from '~/figma';

import type { Batch } from './files';

export const FIGMA_KEY = Symbol.for('@vapor-ui/figma-blueprint');

export interface TemplateResult {
    id?: string;
    example?: unknown;
}

export type TemplateFn = () => TemplateResult;

interface Context {
    handle: object;
    batch: Batch | null;
    copy: Set<unknown>;
}

interface InstanceSection {
    type: 'INSTANCE';
    guid: string;
}

export const NESTED_TAG = '__nested';

const code = (strings: readonly string[], ...values: unknown[]) => ({
    type: 'SECTIONS',
    language: 'typescript',
    sections: [
        { type: 'CODE', code: strings.reduce((acc, s, i) => acc + render(values[i - 1]) + s) },
    ],
});

function render(v: unknown): string {
    if (v == null || v === false) return '';
    if (Array.isArray(v)) return v.map(render).join('');
    if (typeof v !== 'object') return String(v);
    const section = v as { type?: string; sections?: unknown; code?: string; guid?: string };
    if (section.type === 'SECTIONS') return render(section.sections);
    if (section.type === 'CODE') return section.code ?? '';
    if (section.type === 'INSTANCE') return `<${NESTED_TAG} id="${section.guid}" />`;
    return '';
}

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
    const ctx = registerFigma().stack.at(-1);
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
export const registerFigma = () =>
    ((globalThis as unknown as Record<symbol, typeof standIn>)[FIGMA_KEY] ??= standIn);

function withContext<T>(ctx: Context, fn: () => T): T {
    const { stack } = registerFigma();
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

type ConnectionOf = (n: FigmaNode) => { id: string | null } | null;

type Visit = { traverseInstances?: boolean } | undefined;

function makeHandles(tree: { connected: ConnectionOf }) {
    const cache = new WeakMap<FigmaNode, object>();
    const visible = (n: FigmaNode) => n.visible !== false;
    const prop = (n: FigmaNode, name: string) => {
        const props = n.componentProperties ?? {};
        return (
            props[name] ?? Object.entries(props).find(([k]) => k.replace(/#.*/, '') === name)?.[1]
        );
    };
    const layers = (n: FigmaNode): FigmaNode[] =>
        (n.children ?? [])
            .filter(visible)
            .flatMap((c) => (c.type === 'INSTANCE' || c.type === 'TEXT' ? [c] : layers(c)));
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
        top().copy.add(n.characters);
        return {
            type: 'TEXT',
            name: n.name,
            textContent: n.characters,
            __render__: () => n.characters,
        };
    };
    const wrap = (n: FigmaNode): object => (n.type === 'TEXT' ? textHandle(n) : handle(n));

    function handle(n: FigmaNode): object {
        const cached = cache.get(n);
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
                top().copy.add(v);
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
        cache.set(n, h);
        return h;
    }
    return handle;
}

const idProbe: object = {
    type: 'INSTANCE',
    children: [],
    properties: {},
    getEnum: (_: string, o: Record<string, unknown>) => Object.values(o)[0],
    getBoolean: (_: string, o?: Record<string, unknown>) => (o ? Object.values(o)[0] : false),
    getString: () => '',
    getInstanceSwap: () => undefined,
    findInstance: () => idProbe,
    findText: () => ({ type: 'TEXT', textContent: '' }),
    findConnectedInstance: () => null,
    findConnectedInstances: () => [],
    findLayers: () => [],
    codeConnectId: () => null,
    hasCodeConnect: () => false,
    executeTemplate: () => ({ example: [] }),
};

export function templateId(load: () => TemplateFn, batch: Batch | null): string | null {
    try {
        return withContext({ handle: idProbe, batch, copy: new Set() }, load()).id ?? null;
    } catch {
        return null;
    }
}

export interface Snippet {
    code: string;
    copy: Set<unknown>;
}

export function templateRunner(connected: ConnectionOf) {
    const handle = makeHandles({ connected });
    return {
        run(n: FigmaNode, fn: TemplateFn, batch: Batch | null): Snippet {
            const copy = new Set<unknown>();
            const { example } = withContext({ handle: handle(n), batch, copy }, fn);
            return { code: render(example), copy };
        },
    };
}
