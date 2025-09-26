import type { FunctionComponent, SVGProps } from 'react';

export interface IconBaseProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
}

export interface IconType extends FunctionComponent<Omit<IconBaseProps, 'children'>> {}

function IconBase({
    size = 16,
    width: widthProp,
    height: heightProp,
    color = 'currentColor',
    ...props
}: IconBaseProps) {
    const width = widthProp ?? size;
    const height = heightProp ?? size;

    return <svg aria-hidden="true" width={width} height={height} fill={color} {...props} />;
}

export default IconBase;
