import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const BelgiumColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-BelgiumColorIcon__a"
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
        <g mask="url(#vapor-icons-color-BelgiumColorIcon__a)">
            <path fill="#000" d="M4.934 0H-1.22v16h6.154z" />
            <path fill="#FDDA25" d="M11.09 0H4.934v16h6.154z" />
            <path fill="#EF3340" d="M17.244 0h-6.155v16h6.155z" />
        </g>
    </IconBase>
);
export default BelgiumColorIcon;
