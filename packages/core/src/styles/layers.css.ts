import type { globalLayer } from '@vanilla-extract/css';

export const LAYER_ORDER = ['theme', 'reset', 'components', 'composites', 'utilities'] as const;

/** `layers.css` 로 배포되는 전체 레이어 순서. 앞쪽일수록 우선순위가 낮다. */
export const CASCADE_LAYER_ORDER = LAYER_ORDER.flatMap((name) => `vapor-${name}`);

export const layerName = Object.fromEntries(
    LAYER_ORDER.map((name) => [name, `vapor-${name}`]),
) as Record<(typeof LAYER_ORDER)[number], string>;

const createLayersInOrder = () => {
    const layerInstances: Record<string, ReturnType<typeof globalLayer>> = {};

    LAYER_ORDER.forEach((name) => {
        layerInstances[name] = `vapor-${name}`;
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
