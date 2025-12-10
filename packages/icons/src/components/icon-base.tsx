import type { ComponentProps } from 'react';

export interface IconProps extends ComponentProps<'svg'> {
    size?: string | number;
}

function IconBase({
    size = 16,
    width: widthProp,
    height: heightProp,
    color = 'currentColor',
    ...props
}: IconProps) {
    const width = widthProp ?? size;
    const height = heightProp ?? size;

    return <svg aria-hidden="true" width={width} height={height} fill={color} {...props} />;
}

export default IconBase;
