import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const IsraelColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-IsraelColorIcon__a"
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
        <g mask="url(#vapor-icons-color-IsraelColorIcon__a)">
            <path fill="#fff" d="M18.9.1H-2.896v15.8H18.9z" />
            <path
                fill="#F2F2F0"
                d="M8 16.182C3.49 16.182-.182 12.51-.182 8S3.49-.182 8-.182 16.182 3.489 16.182 8c0 4.51-3.671 8.182-8.182 8.182m0-16C3.69.182.182 3.689.182 8c0 4.31 3.507 7.818 7.818 7.818 4.31 0 7.818-3.507 7.818-7.818C15.818 3.69 12.311.182 8 .182"
            />
            <path
                fill="#0038B8"
                d="M18.996 1.502H-3v2.502h21.996zm0 10.494H-3v2.502h21.996zM8.002 4.55l-2.99 5.174h5.98L8.005 4.549zm0 1.086 2.045 3.54H5.958l2.046-3.54z"
            />
            <path
                fill="#0038B8"
                d="M10.99 6.275H5.01L8 11.449zm-5.034.549h4.09L8 10.364l-2.046-3.54z"
            />
        </g>
    </IconBase>
);
export default IsraelColorIcon;
