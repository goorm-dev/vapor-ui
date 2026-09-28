import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const LithuaniaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-LithuaniaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-LithuaniaColorIcon__a)">
            <path fill="#FDB913" d="M21.193 0H-5.475v5.333h26.668z" />
            <path fill="#006A44" d="M21.193 5.333H-5.475v5.332h26.668z" />
            <path fill="#C1272D" d="M21.193 10.667H-5.475V16h26.668z" />
        </g>
    </IconBase>
);
export default LithuaniaColorIcon;
