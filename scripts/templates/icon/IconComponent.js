export default (IconName, Icon) => `

import IconBase, { type IconProps } from '~/components/icon-base';

const ${IconName} = (props : IconProps) => (
	${Icon}
);

export default ${IconName};
`;
