import { globalLayer } from '@vanilla-extract/css';

const LAYER_ORDER = ['theme', 'reset', 'components', 'utilities'] as const;

export const layerName = Object.fromEntries(LAYER_ORDER.map((name) => [name, name])) as Record<
    (typeof LAYER_ORDER)[number],
    string
>;

const prefix = globalLayer('vapor');
const createLayersInOrder = () => {
    const layerInstances: Record<string, ReturnType<typeof globalLayer>> = {};

    LAYER_ORDER.forEach((layerName) => {
        layerInstances[layerName] = globalLayer({ parent: prefix }, layerName);
    });

    return layerInstances;
};

const layerInstances = createLayersInOrder();

export const layers = {
    theme: layerInstances.theme,
    reset: layerInstances.reset,
    components: layerInstances.components,
    utilities: layerInstances.utilities,
};
