import type { SVGProps } from 'react';
import React from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    className?: string;
    children: React.ReactNode;
}

function IconBase({
    size = 16,
    width,
    height,
    style,
    children,
    color = 'currentColor',
    ...props
}: IconProps) {
    return (
        <svg
            aria-hidden="true"
            width={size || width}
            height={size || height}
            fill={color}
            {...props}
        >
            {children}
        </svg>
    );
}

export default IconBase;
