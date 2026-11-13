import { globalLayer } from '@vanilla-extract/css';

import { CASCADE_LAYER_ORDER } from './layers.css';

CASCADE_LAYER_ORDER.forEach((name) => {
    globalLayer(name);
});
