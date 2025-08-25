import type { FunctionComponent, SVGProps } from 'react';

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
    className,
    style: customStyle,
    children,
    color = 'currentColor',
    ...props
}: IconBaseProps) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            width={size}
            height={size}
            fill={color}
            {...props}
        >
            {children}
        </svg>
    );
}

export default IconBase;
