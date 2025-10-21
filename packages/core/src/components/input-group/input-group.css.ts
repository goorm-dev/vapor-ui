import { vars } from '~/styles/themes.css';
import { layerStyle } from '~/styles/utils/layer-style.css';

export const root = layerStyle('components', {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '100%',
});

export const counter = layerStyle('components', {
    lineHeight: vars.typography.lineHeight['050'],
    letterSpacing: vars.typography.letterSpacing['100'],
    fontSize: vars.typography.fontSize['050'],
    fontWeight: vars.typography.fontWeight[400],
});
