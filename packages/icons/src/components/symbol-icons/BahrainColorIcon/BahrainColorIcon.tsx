import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const BahrainColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-BahrainColorIcon__a"
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
        <g mask="url(#vapor-icons-color-BahrainColorIcon__a)">
            <path
                fill="#fff"
                d="m5.32 12.8 3.95-1.598-3.95-1.6 3.95-1.6-3.95-1.6 3.95-1.6-3.95-1.6 3.95-1.6L5.32 0h-6.704v16H5.32l3.95-1.6z"
            />
            <path
                fill="#F2F2F0"
                d="M8 16.182C3.49 16.182-.182 12.51-.182 8S3.49-.182 8-.182 16.182 3.489 16.182 8c0 4.51-3.671 8.182-8.182 8.182m0-16C3.69.182.182 3.689.182 8c0 4.31 3.507 7.818 7.818 7.818 4.31 0 7.818-3.507 7.818-7.818C15.818 3.69 12.311.182 8 .182"
            />
            <path
                fill="#CE1126"
                d="m5.32 0 3.95 1.602-3.95 1.6 3.95 1.6-3.95 1.6 3.95 1.6-3.95 1.6 3.95 1.6L5.32 12.8l3.95 1.6L5.32 16h19.962V0z"
            />
        </g>
    </IconBase>
);
export default BahrainColorIcon;
