import { globalLayer } from '@vanilla-extract/css';

export const LAYER_ORDER = ['theme', 'reset', 'components', 'composites', 'utilities'] as const;

export const layerName = Object.fromEntries(
    LAYER_ORDER.map((name) => [name, `vapor-${name}`]),
) as Record<(typeof LAYER_ORDER)[number], string>;

const createLayersInOrder = () => {
    const layerInstances: Record<string, ReturnType<typeof globalLayer>> = {};

    LAYER_ORDER.forEach((name) => {
        layerInstances[name] = globalLayer(`vapor-${name}`);
    });

    return layerInstances;
};

const layerInstances = createLayersInOrder();

export const layers = {
    theme: layerInstances.theme,
    reset: layerInstances.reset,
    components: layerInstances.components,
    composites: layerInstances.composites,
    utilities: layerInstances.utilities,
};
