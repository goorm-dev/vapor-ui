import { initApiKey } from './controllers/api-key';
import { initFocus } from './controllers/focus';
import { initResize } from './controllers/resize';
import { initScan } from './controllers/scan';
import { initSelection } from './controllers/selection';
import { start } from './messages';
import { DEFAULT_SIZE } from './views/window';

figma.showUI(__html__, DEFAULT_SIZE);

initSelection();
initScan();
initFocus();
initResize();
initApiKey();
start();
