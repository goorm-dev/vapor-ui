import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PakistanColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-PakistanColorIcon__a"
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
        <g mask="url(#vapor-icons-color-PakistanColorIcon__a)">
            <path fill="#fff" d="M19.91.09H-3.91v15.82h23.82z" />
            <path
                fill="#F2F2F0"
                d="M8 16.182C3.49 16.182-.182 12.51-.182 8S3.49-.182 8-.182 16.182 3.489 16.182 8c0 4.51-3.671 8.182-8.182 8.182m0-16C3.69.182.182 3.689.182 8c0 4.31 3.507 7.818 7.818 7.818 4.31 0 7.818-3.507 7.818-7.818C15.818 3.69 12.311.182 8 .182"
            />
            <path fill="#01411C" d="M20 0H2.007v16H20z" />
            <path
                fill="#fff"
                d="M12.127 11.375a4.373 4.373 0 0 1-2.622-7.873 4.794 4.794 0 0 0 1.415 9.372 4.79 4.79 0 0 0 4.395-2.88 4.36 4.36 0 0 1-3.188 1.38"
            />
            <path
                fill="#fff"
                d="m12.664 4.553.75.827 1.019-.458-.555.969.751.827-1.094-.229-.555.97-.12-1.11-1.093-.229 1.019-.458z"
            />
        </g>
    </IconBase>
);
export default PakistanColorIcon;
