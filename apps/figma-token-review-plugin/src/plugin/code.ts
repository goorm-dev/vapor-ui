import { start } from './bus';
import { initFocus } from './handlers/focus';
import { initResize } from './handlers/resize';
import { initScan } from './handlers/scan';
import { initSelection } from './handlers/selection';
import { DEFAULT_SIZE, restoreSavedSize } from './sizing';

figma.showUI(__html__, DEFAULT_SIZE);
void restoreSavedSize();

initSelection();
initScan();
initFocus();
initResize();
start();
