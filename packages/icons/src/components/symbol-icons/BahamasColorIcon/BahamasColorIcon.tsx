import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const BahamasColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-BahamasColorIcon__a"
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
        <g mask="url(#vapor-icons-color-BahamasColorIcon__a)">
            <path fill="#00788C" d="M27.646 10.702h-32V16h32zm0-10.702h-32v5.298h32z" />
            <path fill="#FFC828" d="M27.646 5.298h-32V10.7h32z" />
            <path
                fill="#000"
                fillRule="evenodd"
                d="M-4.354 16 9.387 8-4.354 0z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default BahamasColorIcon;
