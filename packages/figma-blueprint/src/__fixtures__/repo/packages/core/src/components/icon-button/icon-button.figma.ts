// component=IconButton
import figma from 'figma';

import { pick } from '../../utils/figma';

export default {
    id: 'icon-button',
    example: figma.code`<IconButton size="${pick('Size', { Md: 'md', Lg: 'lg' })}" />`,
};
