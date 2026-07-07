import { initApiKey } from './handlers/api-key';
import { initFocus } from './handlers/focus';
import { DEFAULT_SIZE, initResize, restoreSavedSize } from './handlers/resize';
import { initScan } from './handlers/scan';
import { initSelection } from './handlers/selection';
import { start } from './messages';

figma.showUI(__html__, DEFAULT_SIZE);

restoreSavedSize();
initSelection();
initScan();
initFocus();
initResize();
initApiKey();
start();
