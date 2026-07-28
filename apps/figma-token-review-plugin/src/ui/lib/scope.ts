import type { Property, Role } from '~/common/schemas';

export const PROPERTY_SCOPE: Record<Exclude<Property, 'textStyle'>, ReadonlyArray<Role>> = {
    fill: ['background'],
    'fill-on-text': ['foreground'],
    stroke: ['border'],
    padding: ['space'],
    paddingTop: ['space'],
    paddingRight: ['space'],
    paddingBottom: ['space'],
    paddingLeft: ['space'],
    paddingVertical: ['space'],
    paddingHorizontal: ['space'],
    gap: ['space'],
    width: ['dimension'],
    height: ['dimension'],
    borderRadius: ['borderRadius'],
    shadow: ['shadow'],
} as const;
