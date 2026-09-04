import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const TogoColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-TogoColorIcon__a"
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
        <g mask="url(#vapor-icons-color-TogoColorIcon__a)">
            <path fill="#006A4E" d="M25.89 0H9.6v3.2h16.29z" />
            <path fill="#FFCE00" d="M25.891 3.2H9.601v3.2h16.29z" />
            <path fill="#006A4E" d="M25.891 6.4H9.601v3.2h16.29z" />
            <path fill="#FFCE00" d="M0 9.6v3.2h25.89V9.6z" />
            <path fill="#006A4E" d="M25.89 12.8H0V16h25.89z" />
            <path fill="#D21034" d="M9.6 6.4V0H0v9.6h9.6z" />
            <path
                fill="#fff"
                fillRule="evenodd"
                d="m4.8 1.858.664 2.038h2.143l-1.734 1.26.662 2.04L4.8 5.935 3.066 7.196l.663-2.04-1.734-1.26h2.143z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default TogoColorIcon;
