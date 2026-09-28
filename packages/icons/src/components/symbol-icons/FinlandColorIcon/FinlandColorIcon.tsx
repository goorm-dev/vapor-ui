import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const FinlandColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-FinlandColorIcon__a"
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
        <g mask="url(#vapor-icons-color-FinlandColorIcon__a)">
            <path
                fill="#fff"
                d="M5.066 9.71h-7.34v6.2h7.34zm0-9.62h-7.34v6.2h7.34zm18.66 9.62H9.113v6.2h14.613zm0-9.62H9.113v6.2h14.613z"
            />
            <path
                fill="#F2F2F0"
                d="M8 16.182C3.49 16.182-.182 12.51-.182 8S3.49-.182 8-.182 16.182 3.489 16.182 8c0 4.51-3.671 8.182-8.182 8.182m0-16C3.69.182.182 3.689.182 8c0 4.31 3.507 7.818 7.818 7.818 4.31 0 7.818-3.507 7.818-7.818C15.818 3.69 12.311.182 8 .182"
            />
            <path
                fill="#002F6C"
                d="M9.28 0H4.896v5.818h-7.262v4.364h7.262V16H9.28v-5.818h14.536V5.818H9.28z"
            />
        </g>
    </IconBase>
);
export default FinlandColorIcon;
