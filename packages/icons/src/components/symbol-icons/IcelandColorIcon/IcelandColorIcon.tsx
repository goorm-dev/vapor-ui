import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const IcelandColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-IcelandColorIcon__a"
            width={16}
            height={16}
            x={0}
            y={0}
            maskUnits="userSpaceOnUse"
            style={{
                maskType: 'luminance',
            }}
        >
            <path fill="#fff" d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
        </mask>
        <g mask="url(#vapor-icons-color-IcelandColorIcon__a)">
            <path
                fill="#02529C"
                d="M4.787 9.778h-6.222V16h6.222zm16 0H8.344V16h12.443zM4.787 0h-6.222v6.222h6.222zm16 0H8.344v6.222h12.443z"
            />
            <path
                fill="#fff"
                d="M4.787 6.222h-6.222v.889h7.111V0h-.889zM8.344 0h-.89v7.11h13.333v-.888H8.344zm-.889 16h.889V9.778h12.443V8.89H7.455zm-8.89-6.222h6.222V16h.89V8.89h-7.112z"
            />
            <path
                fill="#DC1E35"
                d="M7.455 0H5.676v7.11h-7.11v1.78h7.11V16h1.779V8.89h13.332V7.11H7.455z"
            />
        </g>
    </IconBase>
);
export default IcelandColorIcon;
