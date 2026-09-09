import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const GreeceColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-GreeceColorIcon__a"
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
        <g mask="url(#vapor-icons-color-GreeceColorIcon__a)">
            <path
                fill="#fff"
                d="M24 1.778H8.875v1.778H24zm0 3.555H8.875V7.11H24zM8.875 8.89H0v1.777h24V8.89zM24 12.444H0v1.778h24z"
            />
            <path
                fill="#0D5EAF"
                d="M24 0H8.875v1.778H24zm0 3.556H8.875v1.779H24zm0 3.554H8.875v1.78H24zm0 3.557H0v1.778h24zm0 3.555H0V16h24zM8.875 0H5.393v3.556h3.482zM3.65 0H0v3.556h3.65zm0 5.333H0v3.556h3.65zm5.224 0H5.393v3.556h3.481z"
            />
            <path
                fill="#fff"
                d="M5.393 3.556V0H3.65v3.556H0v1.777h3.65v3.556h1.743V5.333h3.482V3.556z"
            />
        </g>
    </IconBase>
);
export default GreeceColorIcon;
