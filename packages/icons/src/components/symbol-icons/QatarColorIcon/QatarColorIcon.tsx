import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const QatarColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-QatarColorIcon__a"
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
        <g mask="url(#vapor-icons-color-QatarColorIcon__a)">
            <path
                fill="#fff"
                d="M6.53 0H-5.454v16H6.53l3.18-.89-3.18-.888 3.18-.89-3.18-.888 3.18-.89-3.18-.889 3.18-.889-3.18-.889L9.71 8l-3.18-.89 3.18-.888-3.18-.89 3.18-.888-3.18-.89 3.18-.887-3.18-.889L9.71.89z"
            />
            <path
                fill="#F2F2F0"
                d="M8 16.182C3.49 16.182-.182 12.51-.182 8S3.49-.182 8-.182 16.182 3.489 16.182 8c0 4.51-3.671 8.182-8.182 8.182m0-16C3.69.182.182 3.689.182 8c0 4.31 3.507 7.818 7.818 7.818 4.31 0 7.818-3.507 7.818-7.818C15.818 3.69 12.311.182 8 .182"
            />
            <path
                fill="#8A1538"
                d="m9.709.889-3.18.89 3.18.888-3.18.887 3.18.89-3.18.889 3.18.889-3.18.889L9.709 8l-3.18.887 3.18.89-3.18.888 3.18.89-3.18.889 3.18.889-3.18.889 3.18.889-3.18.889h28.746V0H6.529z"
            />
        </g>
    </IconBase>
);
export default QatarColorIcon;
