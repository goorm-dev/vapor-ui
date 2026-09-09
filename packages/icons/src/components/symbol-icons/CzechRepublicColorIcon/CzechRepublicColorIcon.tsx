import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const CzechRepublicColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-CzechRepublicColorIcon__a"
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
        <g mask="url(#vapor-icons-color-CzechRepublicColorIcon__a)">
            <path
                fill="#fff"
                fillRule="evenodd"
                d="M7.906 8.235-4.051.185V.091h23.818v8.144z"
                clipRule="evenodd"
            />
            <path
                fill="#F2F2F0"
                d="M8 16.182C3.49 16.182-.182 12.51-.182 8S3.49-.182 8-.182 16.182 3.489 16.182 8c0 4.51-3.671 8.182-8.182 8.182m0-16C3.69.182.182 3.689.182 8c0 4.31 3.507 7.818 7.818 7.818 4.31 0 7.818-3.507 7.818-7.818C15.818 3.69 12.311.182 8 .182"
            />
            <path fill="#D7141A" fillRule="evenodd" d="M7.878 8h11.98v8h-24z" clipRule="evenodd" />
            <path fill="#11457E" fillRule="evenodd" d="M-4.142 0v16l12.02-8z" clipRule="evenodd" />
        </g>
    </IconBase>
);
export default CzechRepublicColorIcon;
