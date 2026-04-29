export default (IconName, Icon) => `

import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ${IconName} = (props : IconProps) => (
	${Icon}
);

export default ${IconName};
`;
