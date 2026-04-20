import { componentStyle } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { vars } from '~/styles/themes.css';

export const root = componentStyle({
    display: 'flex',
    gap: vars.size.space['050'],

    padding: vars.size.space['025'],

    border: '1px solid',
    borderColor: vars.color.border.secondary,
    borderRadius: vars.size.borderRadius['300'],

    backgroundColor: vars.color.gray['100'],
});

export const item = componentStyle({
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: vars.size.space['075'],

    height: vars.size.dimension['400'],
    padding: `0 ${vars.size.space['200']}`,

    border: '1px solid transparent',
    borderRadius: vars.size.borderRadius['300'],

    backgroundColor: 'transparent',
    cursor: 'pointer',

    selectors: {
        [when.checked()]: {
            backgroundColor: vars.color.background.canvas['100'],
            borderColor: vars.color.border.secondary,
        },
    },
});
