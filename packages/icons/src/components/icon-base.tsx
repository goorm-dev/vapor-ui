import type { FunctionComponent, SVGProps } from 'react';

import { assignInlineVars } from '@vanilla-extract/dynamic';

import { vaporIconHeight, vaporIconWidth } from './icon-base.css';

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
    style: customStyle,
    children,
    color = 'currentColor',
    ...props
}: IconBaseProps) {
    const iconWidth = width || size;
    const iconHeight = height || size;
    return (
        <svg
            aria-hidden="true"
            className={className}
            width={size || width}
            height={size || height}
            fill={color}
            style={assignInlineVars({
                [vaporIconHeight]: iconHeight.toString(),
                [vaporIconWidth]: iconWidth.toString(),
            })}
            {...props}
        >
            {children}
        </svg>
    );
}

export default IconBase;
