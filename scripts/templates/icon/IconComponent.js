export default (IconName, Icon) => `

import IconBase, { type IconType } from '~/components/icon-base';

const ${IconName}: IconType = props => (
	${Icon}
);

export default ${IconName};
`;
