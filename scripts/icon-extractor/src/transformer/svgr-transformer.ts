import { transform } from '@svgr/core';

import { buildConfig } from './svgr-config';

type IconSource = {
    svg: string;
    iconName: string;
    isColorIcon: boolean;
};

/**
 * SVG text → source of one `IconBase`-wrapped React component.
 */
const svgToIconComponent = ({ svg, iconName, isColorIcon }: IconSource) =>
    transform(svg, buildConfig({ iconName, isColorIcon }), { componentName: iconName });

export type { IconSource };
export { svgToIconComponent };
