import { layerStyle } from '../layers.css';

export const visuallyHidden = layerStyle('component', {
    position: 'absolute',
    margin: -1,
    border: 0,
    padding: 0,
    width: 1,
    height: 1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    wordWrap: 'normal',
    clip: 'rect(0, 0, 0, 0)',
});
