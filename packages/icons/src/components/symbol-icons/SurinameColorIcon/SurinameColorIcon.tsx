import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SurinameColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-SurinameColorIcon__a"
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
        <g mask="url(#vapor-icons-color-SurinameColorIcon__a)">
            <path fill="#377E3F" d="M20 12.858H-4V16h24zM20 0H-4v3.142h24z" />
            <path fill="#fff" d="M20 11.17H-4v1.688h24zm0-8.028H-4v1.687h24z" />
            <path fill="#B40A2D" d="M20 4.83H-4v6.34h24z" />
            <path
                fill="#ECC81D"
                d="M8.727 7.455 8.02 5.278l-.707 2.177H5.026L6.876 8.8l-.707 2.176L8.02 9.631l1.853 1.345L9.166 8.8l1.85-1.345z"
            />
        </g>
    </IconBase>
);
export default SurinameColorIcon;
