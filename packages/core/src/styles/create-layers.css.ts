import { globalLayer } from '@vanilla-extract/css';

import { LAYER_ORDER } from './layers.css';

LAYER_ORDER.forEach((name) => {
    globalLayer(`vapor-${name}`);
});
