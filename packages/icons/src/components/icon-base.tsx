import type { FunctionComponent, SVGProps } from 'react';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';

import { vaporIconHeight, vaporIconWidth } from './icon-base.css';
import * as styles from './icon-base.css';

export interface IconBaseProps extends SVGProps<SVGSVGElement> {
    width?: string | number;
    height?: string | number;
    size?: string | number;
    color?: string;
    className?: string;
    children: React.ReactNode;
}

export interface IconType extends FunctionComponent<Omit<IconBaseProps, 'children'>> {}

function IconBase({
    size = 16,
    width,
    height,
    className,
    style,
    children,
    color = 'currentColor',
    ...props
}: IconBaseProps) {
    const iconWidth = width || size;
    const iconHeight = height || size;
    return (
        <svg
            aria-hidden="true"
            className={clsx(className, styles.container_width, styles.container_height)}
            width={size || width}
            height={size || height}
            fill={color}
            style={{
                ...assignInlineVars({
                    [vaporIconHeight]: `${iconHeight.toString()}px`,
                    [vaporIconWidth]: `${iconWidth.toString()}px`,
                }),
                ...style,
            }}
            {...props}
        >
            {children}
        </svg>
    );
}

export default IconBase;
