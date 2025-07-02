import type { FunctionComponent, SVGProps } from 'react';
import React from 'react';

import clsx from 'clsx';

import * as style from './icon-base.css';

export interface IconBaseProps extends SVGProps<SVGSVGElement> {
    width?: number | string;
    height?: number | string;
    size?: number | string;
    color?: string;
    className?: string;
    children: React.ReactNode;
}

export interface IconType extends FunctionComponent<Omit<IconBaseProps, 'children'>> {}
type Size = number | string;

const isCssVariable = (value?: Size) => typeof value === 'string' && value.startsWith('var(--');

/**
 * Icon Component
 * @param children - children of the icon component
 * @param width - width of the icon. if size is provided, it will be ignored
 * @param height - height of the icon. if size is provided, it will be ignored
 * @param size - size of the icon. if width or height is provided, priority is given to size
 * @param className - className of the icon component
 * @param style - style of the icon component
 * @param color - color of the icon
 * @param props - props of the icon component
 * @returns icon component
 */
function IconBase({
    color = 'currentColor',
    width = 'var(--vapor-size-dimension-200, 1rem)',
    height = 'var(--vapor-size-dimension-200, 1rem)',
    size,
    style,
    children,
    ...props
}: IconBaseProps) {
    const widthValue = size || width;
    const heightValue = size || height;

    return (
        <svg
            aria-hidden="true"
            fill={color}
            /*
                NOTE: 사용자가 dom attribute로 width, height를 지정할 수 있도록 함
            */
            {...(!isCssVariable(widthValue) && { width: widthValue })}
            {...(!isCssVariable(heightValue) && { height: heightValue })}
            // className={clsx(
            //     {
            //         [style.container_width]: isCssVariable(widthValue),
            //         [style.container_height]: isCssVariable(heightValue),
            //     },
            //     className,
            // )}
            style={
                {
                    '--vapor-icon-width': widthValue,
                    '--vapor-icon-height': heightValue,

                    width: 'var(--vapor-icon-width)',
                    height: 'var(--vapor-icon-height)',

                    ...style,
                } as React.CSSProperties
            }
            {...props}
        >
            {children}
        </svg>
    );
}

export default IconBase;
