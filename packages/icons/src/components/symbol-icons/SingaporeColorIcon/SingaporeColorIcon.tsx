import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SingaporeColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-SingaporeColorIcon__a"
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
        <g mask="url(#vapor-icons-color-SingaporeColorIcon__a)">
            <path fill="#fff" d="M23.91.09H.09v15.82h23.82z" />
            <path
                fill="#F2F2F0"
                d="M8 16.182C3.49 16.182-.182 12.51-.182 8S3.49-.182 8-.182 16.182 3.489 16.182 8c0 4.51-3.671 8.182-8.182 8.182m0-16C3.69.182.182 3.689.182 8c0 4.31 3.507 7.818 7.818 7.818 4.31 0 7.818-3.507 7.818-7.818C15.818 3.69 12.311.182 8 .182"
            />
            <path fill="#EE2436" d="M24 0H0v8h24z" />
            <path fill="#fff" d="M6.304 1.196a3.03 3.03 0 1 0 0 5.713 2.859 2.859 0 0 1 0-5.713" />
            <path
                fill="#fff"
                d="m6.984 2.133-.153-.471-.153.47h-.494l.4.292-.153.47.4-.29.4.29-.153-.47.4-.291zM5.365 3.325l-.154-.469-.153.47h-.494l.4.29-.153.471.4-.29.402.29-.155-.47.402-.292zm.613 1.893-.153-.47-.152.47h-.495l.4.29-.153.472.4-.291.4.29-.152-.47.4-.291zm2.607-1.893-.152-.469-.153.47h-.495l.4.29-.152.471.4-.29.4.29-.153-.47.4-.292zm-.612 1.893-.153-.47-.153.47h-.494l.4.29-.153.472.4-.291.4.29-.153-.47.4-.291z"
            />
        </g>
    </IconBase>
);
export default SingaporeColorIcon;
