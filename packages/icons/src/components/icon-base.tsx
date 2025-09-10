import type { FunctionComponent, SVGProps } from 'react';

export interface IconBaseProps extends SVGProps<SVGSVGElement> {
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
    style,
    children,
    color = 'currentColor',
    ...props
}: IconBaseProps) {
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
