import type { globalLayer } from '@vanilla-extract/css';

export const LAYER_ORDER = ['theme', 'reset', 'components', 'composites', 'utilities'] as const;

/**
 * `@vapor-ui/composites` 가 style-macro `layer` 옵션으로 `css()` 규칙을 넣는 레이어.
 * core 컴포넌트를 덮어쓰고 앱 `css()`(`vapor-utilities`)에는 지도록 그 사이에 둔다.
 */

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
    utilities: layerInstances.utilities,
};
