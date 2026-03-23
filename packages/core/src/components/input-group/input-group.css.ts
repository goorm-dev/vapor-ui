import { componentStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const root = componentStyle({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '100%',
});

export const counter = componentStyle({
    lineHeight: vars.typography.lineHeight['050'],
    letterSpacing: vars.typography.letterSpacing['100'],
    fontSize: vars.typography.fontSize['050'],
    fontWeight: vars.typography.fontWeight[400],
});
